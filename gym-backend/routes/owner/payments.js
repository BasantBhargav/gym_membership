const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const Member = require('../../models/Member');
const Plan = require('../../models/Plan');
const ownerAuth = require('../../middleware/ownerAuth');

// Get all payments (owner-wise)
router.get('/', ownerAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ ownerId: req.owner.id })
      .populate('memberId', 'name phone')
      .sort({ date: -1 });

    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add payment (cash / online / partial)
router.post('/', ownerAuth, async (req, res) => {
  try {
    const { memberId, amount, paymentMethod, transactionId, date, billingMonth: bmFromBody } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    // determine billing month (YYYY-MM)
    const paymentDate = date ? new Date(date) : new Date();
    const billingMonth = bmFromBody
      ? bmFromBody
      : `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

    // Determine expected monthly fee
    let monthlyFee = null;
    if (member.planId) {
      const plan = await Plan.findById(member.planId);
      if (plan) monthlyFee = plan.monthlyFee;
    }

    // If no plan reference, try to derive from totalFees and membership duration
    if (monthlyFee === null && member.totalFees && member.joinDate && member.expiryDate) {
      const join = new Date(member.joinDate);
      const expiry = new Date(member.expiryDate);
      const msPerMonth = 1000 * 60 * 60 * 24 * 30;
      const months = Math.max(1, Math.ceil((expiry - join) / msPerMonth));
      monthlyFee = Math.round((member.totalFees / months) * 100) / 100;
    }

    // Sum existing payments for this member + billingMonth
    const existingPayments = await Payment.find({ ownerId: req.owner.id, memberId, billingMonth });
    const existingTotal = existingPayments.reduce((s, p) => s + (p.amount || 0), 0);

    // If we know monthlyFee, ensure we don't over-collect for the billing month
    if (monthlyFee !== null) {
      const remaining = Math.max(0, monthlyFee - existingTotal);
      if (remaining <= 0) {
        return res.status(400).json({ message: 'Monthly fee already fully paid for this member' });
      }
      if (Number(amount) > remaining) {
        return res.status(400).json({ message: `Payment exceeds remaining for billing month. Remaining: ${remaining}` });
      }
    }

    const payment = new Payment({
      ownerId: req.owner.id,
      memberId,
      amount,
      paymentMethod,
      transactionId,
      billingMonth,
      date: paymentDate,
    });

    await payment.save();

    // Update member's cumulative amountPaid
    member.amountPaid = (member.amountPaid || 0) + Number(amount || 0);
    await member.save();

    res.status(201).json({ message: 'Payment added successfully', payment, member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

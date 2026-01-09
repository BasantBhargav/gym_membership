const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const ownerAuth = require('../../middleware/ownerAuth');
const Payment = require('../../models/Payment');
const Plan = require('../../models/Plan');
const {
  calculateTotalFee,
  calculateExpiryDate,
} = require('../../utils/feeCalculator');

// Get all members (owner-wise, excluding soft deleted)
router.get('/', ownerAuth, async (req, res) => {
  try {
    const members = await Member.find({ ownerId: req.owner.id, deletedAt: null });
    res.json({ members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new member
router.post('/', ownerAuth, async (req, res) => {
  try {
    const { name, phone, email, plan, months } = req.body;

    const joinDate = new Date();
    const totalFees = calculateTotalFee(plan, months);
    const expiryDate = calculateExpiryDate(joinDate, months);

    const member = new Member({
      ownerId: req.owner.id,
      name,
      phone,
      email,
      plan,
      totalFees,
      amountPaid: 0,
      joinDate,
      expiryDate,
    });

    await member.save();

    res.status(201).json({
      message: 'Member added successfully',
      member,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update member
router.put('/:id', ownerAuth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully',
      member,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Soft delete member (deactivate)
router.delete('/:id', ownerAuth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member deactivated successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// Get member-wise history: member details + payments
router.get('/:id/history', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const member = await Member.findOne({ _id: req.params.id, ownerId });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const payments = await Payment.find({ ownerId, memberId: member._id }).sort({ date: -1 });

    res.json({ member, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Renew membership: extend expiry, optionally change plan and create payment
router.post('/:id/renew', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const member = await Member.findOne({ _id: req.params.id, ownerId });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const { planId, months, paymentAmount, paymentMethod, transactionId, billingMonth } = req.body;

    // If planId provided, attach
    if (planId) {
      const plan = await Plan.findOne({ _id: planId, ownerId });
      if (!plan) return res.status(400).json({ message: 'Invalid plan' });
      member.planId = planId;
      member.plan = plan.name;
    }

    // Extend expiry
    const currentExpiry = new Date(member.expiryDate || Date.now());
    const addMonths = Number(months) || 1;
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + addMonths);
    member.expiryDate = newExpiry;

    // Recalculate totalFees if plan present
    if (member.planId) {
      const plan = await Plan.findById(member.planId);
      if (plan) {
        member.totalFees = (member.totalFees || 0) + plan.monthlyFee * addMonths;
      }
    }

    await member.save();

    let payment = null;
    if (paymentAmount && Number(paymentAmount) > 0) {
      payment = new Payment({
        ownerId,
        memberId: member._id,
        amount: Number(paymentAmount),
        paymentMethod: paymentMethod || 'cash',
        transactionId: transactionId || null,
        billingMonth: billingMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        date: new Date(),
      });
      await payment.save();
      member.amountPaid = (member.amountPaid || 0) + Number(paymentAmount);
      await member.save();
    }

    res.json({ message: 'Member renewed', member, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

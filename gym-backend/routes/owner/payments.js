const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const Member = require('../../models/Member');
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
    const { memberId, amount, paymentMethod, transactionId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const payment = new Payment({
      ownerId: req.owner.id,
      memberId,
      amount,
      paymentMethod,
      transactionId,
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment added successfully',
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

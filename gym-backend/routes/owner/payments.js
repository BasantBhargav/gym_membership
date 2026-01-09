const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const Member = require('../../models/Member');
const ownerAuth = require('../../middleware/ownerAuth');

// Get all payments of an owner
router.get('/', ownerAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ ownerId: req.owner.id })
      .populate('memberId')
      .sort({ paymentDate: -1 });

    res.json({
      message: 'Payments fetched successfully',
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record payment
router.post('/', ownerAuth, async (req, res) => {
  try {
    const { memberId, amount, paymentMethod, transactionId, notes } = req.body;

    // Update member's payment status
    await Member.findByIdAndUpdate(memberId, { isPaid: true });

    const payment = new Payment({
      ownerId: req.owner.id,
      memberId,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed',
      notes,
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment by ID
router.get('/:id', ownerAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('memberId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      message: 'Payment fetched successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

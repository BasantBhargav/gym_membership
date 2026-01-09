const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const ownerAuth = require('../../middleware/ownerAuth');
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

const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const ownerAuth = require('../../middleware/ownerAuth');

// Get all members of an owner
router.get('/', ownerAuth, async (req, res) => {
  try {
    const members = await Member.find({ ownerId: req.owner.id });
    res.json({
      message: 'Members fetched successfully',
      members,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new member
router.post('/', ownerAuth, async (req, res) => {
  try {
    const { name, email, phone, membershipType, expiryDate, amount } = req.body;

    const member = new Member({
      ownerId: req.owner.id,
      name,
      email,
      phone,
      membershipType,
      expiryDate,
      amount,
    });

    await member.save();

    res.status(201).json({
      message: 'Member added successfully',
      member,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete member
router.delete('/:id', ownerAuth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

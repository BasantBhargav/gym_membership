const express = require('express');
const router = express.Router();
const ownerAuth = require('../../middleware/ownerAuth');
const Plan = require('../../models/Plan');

// List plans for owner
router.get('/', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const plans = await Plan.find({ ownerId, isActive: true }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single plan
router.get('/:id', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const plan = await Plan.findOne({ _id: req.params.id, ownerId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create plan
router.post('/', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const { name, monthlyFee, durationMonths, discountPercent, isDefault, notes } = req.body;
    const plan = new Plan({ ownerId, name, monthlyFee, durationMonths, discountPercent, isDefault, notes });
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update plan
router.put('/:id', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, ownerId },
      { $set: req.body },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft-delete plan
router.delete('/:id', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, ownerId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

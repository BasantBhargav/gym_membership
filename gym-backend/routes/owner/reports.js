const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const Payment = require('../../models/Payment');
const ownerAuth = require('../../middleware/ownerAuth');

// Get revenue report
router.get('/revenue', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    const payments = await Payment.find({ ownerId, status: 'completed' }).sort({ paymentDate: -1 });

    // Daily collection
    const dailyCollection = {};
    payments.forEach(p => {
      const date = new Date(p.paymentDate).toLocaleDateString('en-IN');
      dailyCollection[date] = (dailyCollection[date] || 0) + p.amount;
    });

    // Monthly collection
    const monthlyCollection = {};
    payments.forEach(p => {
      const monthKey = new Date(p.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
      monthlyCollection[monthKey] = (monthlyCollection[monthKey] || 0) + p.amount;
    });

    // Payment method breakdown
    const methodBreakdown = {};
    payments.forEach(p => {
      methodBreakdown[p.paymentMethod] = (methodBreakdown[p.paymentMethod] || 0) + p.amount;
    });

    res.json({
      daily: dailyCollection,
      monthly: monthlyCollection,
      byMethod: methodBreakdown,
      totalPayments: payments.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get member reports
router.get('/members', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id;
    const members = await Member.find({ ownerId, deletedAt: null }).populate('ownerId', 'gymName');

    const active = members.filter(m => new Date(m.expiryDate) > new Date());
    const expired = members.filter(m => new Date(m.expiryDate) <= new Date());

    // Plan-wise breakdown
    const planBreakdown = {};
    members.forEach(m => {
      const plan = m.plan || 'unknown';
      planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
    });

    res.json({
      total: members.length,
      active: active.length,
      expired: expired.length,
      byPlan: planBreakdown,
      members: members.map(m => ({
        id: m._id,
        name: m.name,
        phone: m.phone,
        plan: m.plan,
        totalFees: m.totalFees,
        amountPaid: m.amountPaid,
        joinDate: m.joinDate,
        expiryDate: m.expiryDate,
        status: new Date(m.expiryDate) > new Date() ? 'active' : 'expired',
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const Payment = require('../../models/Payment');
const ownerAuth = require('../../middleware/ownerAuth');

// Get revenue report
// optional query: ?year=2026&month=01 (month two digits)
router.get('/revenue', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const { year, month } = req.query;

    // base filter
    const filter = { ownerId };
    if (year && month) {
      const from = new Date(`${year}-${month}-01T00:00:00Z`);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      filter.date = { $gte: from, $lt: to };
    } else if (year) {
      const from = new Date(`${year}-01-01T00:00:00Z`);
      const to = new Date(`${Number(year) + 1}-01-01T00:00:00Z`);
      filter.date = { $gte: from, $lt: to };
    }

    const payments = await Payment.find(filter).sort({ date: -1 });

    // Daily collection
    const dailyCollection = {};
    payments.forEach(p => {
      const date = new Date(p.date).toLocaleDateString('en-IN');
      dailyCollection[date] = (dailyCollection[date] || 0) + p.amount;
    });

    // Monthly collection
    const monthlyCollection = {};
    payments.forEach(p => {
      const d = new Date(p.date);
      const monthKey = d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
      monthlyCollection[monthKey] = (monthlyCollection[monthKey] || 0) + p.amount;
    });

    // Payment method breakdown
    const methodBreakdown = {};
    payments.forEach(p => {
      methodBreakdown[p.paymentMethod] = (methodBreakdown[p.paymentMethod] || 0) + p.amount;
    });

    const total = payments.reduce((s, p) => s + p.amount, 0);

    res.json({ daily: dailyCollection, monthly: monthlyCollection, byMethod: methodBreakdown, totalPayments: payments.length, total });
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

// Export revenue as CSV
router.get('/revenue/export/csv', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id || req.owner._id;
    const { year, month } = req.query;
    const filter = { ownerId };
    if (year && month) {
      const from = new Date(`${year}-${month}-01T00:00:00Z`);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      filter.date = { $gte: from, $lt: to };
    }
    const payments = await Payment.find(filter).populate('memberId', 'name phone');
    const csv = payments.map(p => `${p.memberId.name},${p.memberId.phone},${p.amount},${p.paymentMethod},${new Date(p.date).toLocaleDateString('en-IN')}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments_${year}_${month}.csv"`);
    res.send(`Member,Phone,Amount,Method,Date\n${csv}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

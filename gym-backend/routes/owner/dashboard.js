const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const Payment = require('../../models/Payment');
const ownerAuth = require('../../middleware/ownerAuth');
const { isMembershipExpired, isDueSoon } = require('../../utils/feeCalculator');

router.get('/', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id;

    // Get all active members
    const members = await Member.find({ ownerId, deletedAt: null });
    const payments = await Payment.find({ ownerId });

    // Calculate stats
    const activeMembers = members.filter(m => !isMembershipExpired(m.expiryDate));
    const expiredMembers = members.filter(m => isMembershipExpired(m.expiryDate));
    const dueSoonMembers = members.filter(m => isDueSoon(m.expiryDate) && !isMembershipExpired(m.expiryDate));

    // Current month snapshot
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthPayments = payments.filter(p => p.billingMonth === currentMonth);
    const currentMonthTotal = currentMonthPayments.reduce((s, p) => s + p.amount, 0);
    
    const paidMembersThisMonth = new Set(currentMonthPayments.map(p => p.memberId.toString()));
    const unpaidThisMonth = members.filter(m => !paidMembersThisMonth.has(m._id.toString())).length;

    let totalRevenue = 0;
    let cashCollection = 0;
    let onlineCollection = 0;
    
    payments.forEach(p => {
      totalRevenue += p.amount;
      if (p.paymentMethod === 'cash') {
        cashCollection += p.amount;
      } else {
        onlineCollection += p.amount;
      }
    });

    // Get remaining due
    let totalDue = 0;
    members.forEach(m => {
      totalDue += (m.totalFees - m.amountPaid);
    });

    res.json({
      summary: {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        expiredMembers: expiredMembers.length,
        dueSoonMembers: dueSoonMembers.length,
      },
      currentMonth: {
        month: currentMonth,
        collection: currentMonthTotal,
        paidMembers: paidMembersThisMonth.size,
        unpaidMembers: unpaidThisMonth,
        cashThisMonth: currentMonthPayments.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + p.amount, 0),
        onlineThisMonth: currentMonthPayments.filter(p => p.paymentMethod !== 'cash').reduce((s, p) => s + p.amount, 0),
      },
      revenue: {
        totalRevenue,
        cashCollection,
        onlineCollection,
        totalDue,
      },
      alerts: {
        dueSoon: dueSoonMembers.map(m => ({
          id: m._id,
          name: m.name,
          daysLeft: Math.ceil((m.expiryDate - new Date()) / (1000 * 60 * 60 * 24)),
        })),
        expired: expiredMembers.slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

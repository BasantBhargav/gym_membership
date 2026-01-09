const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const Payment = require('../../models/Payment');
const ownerAuth = require('../../middleware/ownerAuth');

// Get dashboard data for owner
router.get('/', ownerAuth, async (req, res) => {
  try {
    const ownerId = req.owner.id;

    // Total members
    const totalMembers = await Member.countDocuments({
      ownerId,
      isActive: true,
    });

    // Active members
    const activeMembers = await Member.find({
      ownerId,
      isActive: true,
      expiryDate: { $gt: new Date() },
    });

    // Expired members
    const expiredMembers = await Member.countDocuments({
      ownerId,
      expiryDate: { $lte: new Date() },
    });

    // Due payments
    const duePayments = await Member.countDocuments({
      ownerId,
      isPaid: false,
    });

    // Total revenue (completed payments)
    const revenueData = await Payment.aggregate([
      { $match: { ownerId, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Recent payments
    const recentPayments = await Payment.find({ ownerId })
      .populate('memberId', 'name')
      .sort({ paymentDate: -1 })
      .limit(5);

    res.json({
      message: 'Dashboard data fetched successfully',
      dashboard: {
        totalMembers,
        activeMembers: activeMembers.length,
        expiredMembers,
        duePayments,
        totalRevenue,
        recentPayments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

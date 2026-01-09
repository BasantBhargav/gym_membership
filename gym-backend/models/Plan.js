const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    monthlyFee: {
      type: Number,
      required: true,
      default: 0,
    },
    durationMonths: {
      type: Number,
      default: 1,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);

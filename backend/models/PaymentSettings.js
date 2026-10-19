const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  // The current active deadline set by admin
  currentDueDate: {
    type: Date,
    required: true
  },
  periodLabel: {
    type: String,
    required: true
    // e.g., "October 2026"
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0
    // e.g., 500 Birr per student
  },
  // Penalty rules by days late
  penaltyRules: {
    type: Map,
    of: Number,
    default: {
      '1': 100,
      '2': 300,
      '3': 500
    }
    // Day 1 → 100 Birr, Day 2 → 300 Birr, Day 3 → 500 Birr
    // 4+ days → payment blocked
  },
  // After this many days late, payment is blocked
  blockAfterDays: {
    type: Number,
    default: 4
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  setBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
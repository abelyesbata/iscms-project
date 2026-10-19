const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Classroom is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  penalty: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  period: {
    type: String,
    enum: ['Monthly', 'Termly', 'Yearly', 'Other'],
    default: 'Monthly'
  },
  periodLabel: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paymentDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'blocked'],
    default: 'pending'
  },
  daysLate: {
    type: Number,
    default: 0
  },
    method: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Online', 'Other', 'Chapa', 'Telebirr'],
    default: 'Online'
  },
  transactionId: {
    type: String,
    default: ''
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-calculate totalAmount (Mongoose 7+ async style)
paymentSchema.pre('save', function () {
  this.totalAmount = (this.amount || 0) + (this.penalty || 0);
});

// Generate receipt number when paid
paymentSchema.pre('save', function () {
  if (this.status === 'paid' && !this.receiptNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.receiptNumber = `RCP-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
    // null means system-generated (e.g., automatic absence alert)
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 1000
  },
  type: {
    type: String,
    enum: [
      'absence',      // student absent
      'grade',        // new grade posted
      'payment',      // payment reminder / confirmation
      'penalty',      // late payment penalty
      'announcement', // school-wide news
      'attendance',   // attendance summary
      'resource',     // new resource uploaded
      'general'       // catch-all
    ],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Optional link to related document
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
    // e.g., the Payment _id, Mark _id, etc.
  },
  relatedModel: {
    type: String,
    enum: ['Payment', 'Mark', 'Attendance', 'Resource', 'Class', null],
    default: null
  },
  link: {
    type: String,
    default: ''
    // optional frontend deep link
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  delivered: {
    type: Boolean,
    default: false
    // true if push notification was sent
  },
  channel: {
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: 'in-app'
  }
}, { timestamps: true });

// Indexes for fast queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
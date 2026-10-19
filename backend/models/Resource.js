const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['PDF', 'Video', 'Link', 'Note', 'Image', 'Audio', 'Other'],
    default: 'PDF'
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
    // URL to the actual file (Cloudinary, Google Drive, etc.)
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Classroom is required']
  },
  subject: {
    type: String,
    default: '',
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who can access this resource
  accessLevel: {
    type: String,
    enum: ['class', 'grade', 'all', 'private'],
    default: 'class'
    // 'class' = only this classroom
    // 'grade' = same grade level
    // 'all' = everyone
    // 'private' = only uploader
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Index for faster lookups
resourceSchema.index({ classroom: 1, isActive: 1 });
resourceSchema.index({ teacher: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Class name is required'],
    unique: true,
    trim: true
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    trim: true
  },
  section: {
    type: String,
    default: 'A',
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    default: 30,
    min: 1
  },
  homeroomTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subjects: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual: current number of students
// SAFE VERSION — checks if students exists first
classSchema.virtual('studentCount').get(function () {
  return this.students ? this.students.length : 0;
});

// Ensure virtuals appear in JSON
classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Class', classSchema);
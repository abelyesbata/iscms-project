const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Classroom is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  term: {
    type: String,
    required: [true, 'Term is required'],
    enum: ['Term 1', 'Term 2', 'Term 3'],
    default: 'Term 1'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  assessmentType: {
    type: String,
    enum: ['Quiz', 'Assignment', 'Midterm', 'Final', 'Project'],
    default: 'Final'
  },
  assessmentName: {
    type: String,
    default: '',
    trim: true
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: 0
  },
  maxScore: {
    type: Number,
    required: [true, 'Max score is required'],
    min: 1,
    default: 100
  },
  weight: {
    type: Number,
    default: 1,
    min: 0.1
    // For weighted average if you want to combine quizzes etc.
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, { timestamps: true });

// Virtual: percentage
markSchema.virtual('percentage').get(function () {
  if (!this.maxScore) return 0;
  return Math.round((this.score / this.maxScore) * 100 * 100) / 100;
});

// Virtual: letter grade (Ethiopian-style)
markSchema.virtual('letterGrade').get(function () {
  const p = this.percentage;
  if (p >= 90) return 'A';
  if (p >= 80) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  return 'F';
});

// Prevent duplicate mark (same student, subject, assessment, term)
markSchema.index(
  {
    student: 1,
    subject: 1,
    term: 1,
    academicYear: 1,
    assessmentType: 1,
    assessmentName: 1
  },
  { unique: true }
);

// Ensure virtuals appear in JSON output
markSchema.set('toJSON', { virtuals: true });
markSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Mark', markSchema);
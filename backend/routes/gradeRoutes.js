const express = require('express');
const router = express.Router();
const {
  enterMark,
  enterBulkMarks,
  getStudentMarks,
  getClassMarks,
  getStudentReport,
  updateMark,
  deleteMark
} = require('../controllers/gradeController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// GRADE ROUTES
// ==========================================

// Teacher enters a single mark
router.post(
  '/entry',
  protect,
  allow('teacher', 'admin'),
  enterMark
);

// Teacher enters marks for whole class
router.post(
  '/entry-bulk',
  protect,
  allow('teacher', 'admin'),
  enterBulkMarks
);

// Get a student's marks
router.get(
  '/student/:studentId',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getStudentMarks
);

// Get class marks
router.get(
  '/class/:classroomId',
  protect,
  allow('teacher', 'admin', 'registrar'),
  getClassMarks
);

// Get student report card
router.get(
  '/student/:studentId/report',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getStudentReport
);

// Update mark
router.put(
  '/:id',
  protect,
  allow('teacher', 'admin'),
  updateMark
);

// Delete mark (admin only)
router.delete(
  '/:id',
  protect,
  allow('admin'),
  deleteMark
);

module.exports = router;
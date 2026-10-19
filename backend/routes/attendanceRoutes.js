const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getStudentAttendance,
  getClassAttendance,
  getDailyReport,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// ATTENDANCE ROUTES
// ==========================================

// Teacher marks single attendance
router.post(
  '/mark',
  protect,
  allow('teacher', 'admin'),
  markAttendance
);

// Teacher marks attendance for whole class
router.post(
  '/mark-bulk',
  protect,
  allow('teacher', 'admin'),
  markBulkAttendance
);

// View student's attendance (Student/Parent/Teacher/Admin)
router.get(
  '/student/:studentId',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getStudentAttendance
);

// View class attendance (Teacher/Admin)
router.get(
  '/class/:classroomId',
  protect,
  allow('teacher', 'admin', 'registrar'),
  getClassAttendance
);

// Daily report (Teacher/Admin/Registrar)
router.get(
  '/report/daily',
  protect,
  allow('teacher', 'admin', 'registrar'),
  getDailyReport
);

// Update attendance (Teacher/Admin)
router.put(
  '/:id',
  protect,
  allow('teacher', 'admin'),
  updateAttendance
);

// Delete attendance (Admin only)
router.delete(
  '/:id',
  protect,
  allow('admin'),
  deleteAttendance
);

module.exports = router;
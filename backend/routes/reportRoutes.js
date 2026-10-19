const express = require('express');
const router = express.Router();
const {
  getStudentAttendanceReport,
  getClassAttendanceReport,
  getStudentGradeReport,
  getClassGradeReport,
  getFinanceSummary,
  getClassFinanceReport,
  getDashboardOverview,
  getTeacherPerformance
} = require('../controllers/reportController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// ATTENDANCE REPORTS
// ==========================================
router.get(
  '/attendance/student/:studentId',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getStudentAttendanceReport
);

router.get(
  '/attendance/class/:classId',
  protect,
  allow('teacher', 'admin', 'registrar'),
  getClassAttendanceReport
);

// ==========================================
// GRADE REPORTS
// ==========================================
router.get(
  '/grades/student/:studentId',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getStudentGradeReport
);

router.get(
  '/grades/class/:classId',
  protect,
  allow('teacher', 'admin', 'registrar'),
  getClassGradeReport
);

// ==========================================
// FINANCE REPORTS (Admin/Registrar)
// ==========================================
router.get(
  '/finance/summary',
  protect,
  allow('admin', 'registrar'),
  getFinanceSummary
);

router.get(
  '/finance/class/:classId',
  protect,
  allow('admin', 'registrar'),
  getClassFinanceReport
);

// ==========================================
// DASHBOARD (Admin)
// ==========================================
router.get(
  '/dashboard',
  protect,
  allow('admin', 'registrar'),
  getDashboardOverview
);

// ==========================================
// TEACHER PERFORMANCE (Admin)
// ==========================================
router.get(
  '/teacher/performance',
  protect,
  allow('admin', 'registrar'),
  getTeacherPerformance
);

module.exports = router;
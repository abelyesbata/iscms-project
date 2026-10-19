const express = require('express');
const router = express.Router();
const {
  setDeadline,
  getDeadline,
  checkPaymentStatus,
  initiatePayment,
  verifyPayment,
  getStudentPayments,
  getReceipt,
  getOverdueStudents,
  initiateChapaPayment,
  verifyChapaPayment
} = require('../controllers/paymentController');
const { protect, allow } = require('../middleware/auth');

// Admin sets deadline
router.post(
  '/set-deadline',
  protect,
  allow('admin', 'registrar'),
  setDeadline
);

// Get active deadline for a class
router.get(
  '/deadline/:classId',
  protect,
  allow('admin', 'registrar', 'teacher', 'parent', 'student'),
  getDeadline
);

// Check payment status of a student
router.get(
  '/status/:studentId',
  protect,
  allow('admin', 'registrar', 'parent', 'student'),
  checkPaymentStatus
);

// Parent/Student initiates payment
router.post(
  '/initiate',
  protect,
  allow('parent', 'student', 'admin', 'registrar'),
  initiatePayment
);

// Verify/complete payment
router.post(
  '/verify',
  protect,
  allow('parent', 'student', 'admin', 'registrar'),
  verifyPayment
);

// Get student payment history
router.get(
  '/student/:studentId',
  protect,
  allow('admin', 'registrar', 'parent', 'student'),
  getStudentPayments
);

// Get receipt
router.get(
  '/receipt/:paymentId',
  protect,
  allow('admin', 'registrar', 'parent', 'student'),
  getReceipt
);

// Admin: list overdue students in a class
router.get(
  '/overdue/:classId',
  protect,
  allow('admin', 'registrar'),
  getOverdueStudents
);
// Chapa payment routes
router.post(
  '/chapa/initiate',
  protect,
  allow('parent', 'student', 'admin', 'registrar'),
  initiateChapaPayment
);

router.get(
  '/chapa/verify/:txRef',
  protect,
  allow('parent', 'student', 'admin', 'registrar'),
  verifyChapaPayment
);

module.exports = router;
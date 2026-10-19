const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  linkParent,
  getMyChildren,
  changePassword,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// ==========================================
// PROTECTED ROUTES (require login)
// ==========================================

// Get current user profile
router.get('/me', protect, getMe);
// Change own password (any logged-in user)
router.put('/change-password', protect, changePassword);

// Parent: get own children
router.get('/my-children', protect, allow('parent'), getMyChildren);

// ==========================================
// ADMIN-ONLY ROUTES
// ==========================================

// Get all users
router.get('/users', protect, allow('admin', 'registrar'), getAllUsers);

// Get one user
router.get('/users/:id', protect, allow('admin', 'registrar'), getUserById);

// Update user
router.put('/users/:id', protect, allow('admin'), updateUser);

// Delete user
router.delete('/users/:id', protect, allow('admin'), deleteUser);

// Link parent to student (admin/registrar)
router.put(
  '/students/:studentId/parent',
  protect,
  allow('admin', 'registrar'),
  linkParent
);
// Forgot & Reset Password (Public routes)
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
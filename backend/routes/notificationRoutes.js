const express = require('express');
const router = express.Router();
const {
  sendNotification,
  sendBulkNotifications,
  getMyNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllMine,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// NOTIFICATION ROUTES
// ==========================================

// Send one notification (admin/teacher)
router.post(
  '/send',
  protect,
  allow('admin', 'teacher', 'registrar'),
  sendNotification
);

// Send to multiple users
router.post(
  '/send-bulk',
  protect,
  allow('admin', 'teacher', 'registrar'),
  sendBulkNotifications
);

// Get my notifications
router.get(
  '/my',
  protect,
  getMyNotifications
);

// Unread count for badge
router.get(
  '/unread-count',
  protect,
  getUnreadCount
);

// Get a specific user's notifications (admin only)
router.get(
  '/user/:userId',
  protect,
  allow('admin', 'registrar'),
  getUserNotifications
);

// Mark one as read
router.put(
  '/:id/read',
  protect,
  markAsRead
);

// Mark all as read
router.put(
  '/read-all',
  protect,
  markAllAsRead
);

// Delete one
router.delete(
  '/:id',
  protect,
  deleteNotification
);

// Clear all mine
router.delete(
  '/clear-all',
  protect,
  clearAllMine
);

module.exports = router;
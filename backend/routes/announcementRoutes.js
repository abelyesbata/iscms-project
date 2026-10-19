const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, allow } = require('../middleware/auth');

// Get active announcements for current user (everyone)
router.get('/active', protect, getActiveAnnouncements);

// Get all announcements (admin, registrar, teacher)
router.get(
  '/',
  protect,
  allow('admin', 'registrar', 'teacher'),
  getAllAnnouncements
);

// Create announcement (admin, registrar, teacher)
router.post(
  '/',
  protect,
  allow('admin', 'registrar', 'teacher'),
  createAnnouncement
);

// Update announcement (admin, registrar, teacher)
router.put(
  '/:id',
  protect,
  allow('admin', 'registrar', 'teacher'),
  updateAnnouncement
);

// Delete announcement (admin, registrar, teacher)
router.delete(
  '/:id',
  protect,
  allow('admin', 'registrar', 'teacher'),
  deleteAnnouncement
);

module.exports = router;
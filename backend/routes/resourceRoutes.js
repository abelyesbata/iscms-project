const express = require('express');
const router = express.Router();
const {
  uploadResource,
  getResourcesByClass,
  getResourceById,
  downloadResource,
  getMyResources,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, allow } = require('../middleware/auth');

// ==========================================
// RESOURCE ROUTES
// ==========================================

// Teacher uploads a resource
router.post(
  '/upload',
  protect,
  allow('teacher', 'admin'),
  uploadResource
);

// Teacher views their own uploads
router.get(
  '/teacher/mine',
  protect,
  allow('teacher', 'admin'),
  getMyResources
);

// Get resources for a class (all logged-in users)
router.get(
  '/class/:classroomId',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getResourcesByClass
);

// Download a resource (increments counter, returns URL)
router.get(
  '/:id/download',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  downloadResource
);

// Get one resource
router.get(
  '/:id',
  protect,
  allow('student', 'parent', 'teacher', 'admin', 'registrar'),
  getResourceById
);

// Update a resource
router.put(
  '/:id',
  protect,
  allow('teacher', 'admin'),
  updateResource
);

// Delete a resource
router.delete(
  '/:id',
  protect,
  allow('teacher', 'admin'),
  deleteResource
);

module.exports = router;
const Resource = require('../models/Resource');
const Class = require('../models/Class');
const User = require('../models/User');

// ==========================================
// 1. UPLOAD RESOURCE (Teacher/Admin)
// POST /api/resources/upload
// ==========================================
exports.uploadResource = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      url,
      classroomId,
      subject,
      accessLevel,
      tags
    } = req.body;

    // Validate required
    if (!title || !url || !classroomId) {
      return res.status(400).json({
        message: 'title, url, and classroomId are required'
      });
    }

    // Verify class exists
    const classroom = await Class.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify teacher is assigned to this class (unless admin)
    if (req.user.role === 'teacher') {
      const isHomeroom = classroom.homeroomTeacher?.toString() === req.user._id.toString();
      if (!isHomeroom) {
        // Allow if teacher is in the class's teachers array (future feature)
        // For now, allow all teachers to upload to any class
      }
    }

    const resource = await Resource.create({
      title,
      description: description || '',
      type: type || 'PDF',
      url,
      classroom: classroomId,
      subject: subject || '',
      teacher: req.user._id,
      accessLevel: accessLevel || 'class',
      tags: tags || []
    });

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('=== uploadResource ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error uploading resource',
      error: error.message
    });
  }
};

// ==========================================
// 2. GET RESOURCES BY CLASS
// GET /api/resources/class/:classroomId
// ==========================================
exports.getResourcesByClass = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { type, subject } = req.query;

    const filter = { classroom: classroomId, isActive: true };
    if (type) filter.type = type;
    if (subject) filter.subject = subject;

    const resources = await Resource.find(filter)
      .populate('teacher', 'fullName email')
      .populate('classroom', 'className gradeLevel')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Resources fetched',
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('=== getResourcesByClass ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching resources',
      error: error.message
    });
  }
};

// ==========================================
// 3. GET ONE RESOURCE
// GET /api/resources/:id
// ==========================================
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('teacher', 'fullName email')
      .populate('classroom', 'className gradeLevel');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({
      message: 'Resource found',
      resource
    });
  } catch (error) {
    console.error('=== getResourceById ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching resource',
      error: error.message
    });
  }
};

// ==========================================
// 4. DOWNLOAD RESOURCE (increments download count)
// GET /api/resources/:id/download
// ==========================================
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      message: 'Download link ready',
      url: resource.url,
      title: resource.title,
      type: resource.type,
      downloads: resource.downloads
    });
  } catch (error) {
    console.error('=== downloadResource ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error processing download',
      error: error.message
    });
  }
};

// ==========================================
// 5. GET MY RESOURCES (Teacher's own uploads)
// GET /api/resources/teacher/mine
// ==========================================
exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ teacher: req.user._id })
      .populate('classroom', 'className gradeLevel')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Your resources fetched',
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('=== getMyResources ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching your resources',
      error: error.message
    });
  }
};

// ==========================================
// 6. UPDATE RESOURCE (Owner or Admin)
// PUT /api/resources/:id
// ==========================================
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Permission check
    const isOwner = resource.teacher.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Only the original uploader or admin can update this resource'
      });
    }

    // Allowed fields
    const fields = [
      'title', 'description', 'type', 'url',
      'subject', 'accessLevel', 'tags', 'isActive'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        resource[f] = req.body[f];
      }
    });

    await resource.save();

    res.json({
      message: 'Resource updated',
      resource
    });
  } catch (error) {
    console.error('=== updateResource ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error updating resource',
      error: error.message
    });
  }
};

// ==========================================
// 7. DELETE RESOURCE (Owner or Admin)
// DELETE /api/resources/:id
// ==========================================
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const isOwner = resource.teacher.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Only the original uploader or admin can delete this resource'
      });
    }

    await resource.deleteOne();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('=== deleteResource ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error deleting resource',
      error: error.message
    });
  }
};
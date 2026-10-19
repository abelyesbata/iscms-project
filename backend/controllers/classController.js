const Class = require('../models/Class');
const User = require('../models/User');

// ==========================================
// 1. CREATE CLASS (Admin only)
// POST /api/classes
// ==========================================
exports.createClass = async (req, res) => {
  try {
    const {
      className,
      gradeLevel,
      section,
      academicYear,
      roomNumber,
      capacity,
      homeroomTeacher,
      subjects
    } = req.body;

    // Validate required fields
    if (!className || !gradeLevel || !academicYear) {
      return res.status(400).json({
        message: 'className, gradeLevel, and academicYear are required'
      });
    }

    // Check if class already exists
    const existing = await Class.findOne({ className });
    if (existing) {
      return res.status(400).json({
        message: 'Class with this name already exists'
      });
    }

    // Validate homeroom teacher (if provided)
    if (homeroomTeacher) {
      const teacher = await User.findById(homeroomTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({
          message: 'Homeroom teacher must be a valid teacher'
        });
      }
    }

    const newClass = await Class.create({
      className,
      gradeLevel,
      section: section || 'A',
      academicYear,
      roomNumber: roomNumber || '',
      capacity: capacity || 30,
      homeroomTeacher: homeroomTeacher || null,
      subjects: subjects || []
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating class',
      error: error.message
    });
  }
};

// ==========================================
// 2. GET ALL CLASSES
// GET /api/classes
// ==========================================
exports.getAllClasses = async (req, res) => {
  try {
    const { academicYear, gradeLevel, isActive } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classes = await Class.find(filter)
      .populate('homeroomTeacher', 'fullName email')
      .populate('students', 'fullName email')
      .sort({ gradeLevel: 1, section: 1 });

    res.json({
      message: 'Classes fetched successfully',
      count: classes.length,
      classes
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

// ==========================================
// 3. GET ONE CLASS
// GET /api/classes/:id
// ==========================================
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('homeroomTeacher', 'fullName email')
      .populate('students', 'fullName email role');

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class found', class: cls });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching class',
      error: error.message
    });
  }
};

// ==========================================
// 4. UPDATE CLASS (Admin only)
// PUT /api/classes/:id
// ==========================================
exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Allowed fields to update
    const allowed = [
      'className', 'gradeLevel', 'section', 'academicYear',
      'roomNumber', 'capacity', 'homeroomTeacher', 'subjects', 'isActive'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        cls[field] = req.body[field];
      }
    });

    await cls.save();

    res.json({
      message: 'Class updated successfully',
      class: cls
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating class',
      error: error.message
    });
  }
};

// ==========================================
// 5. DELETE CLASS (Admin only)
// DELETE /api/classes/:id
// ==========================================
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Safety: don't delete if students are still enrolled
    if (cls.students.length > 0) {
      return res.status(400).json({
        message: `Cannot delete: class has ${cls.students.length} students. Remove them first.`
      });
    }

    await cls.deleteOne();

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting class',
      error: error.message
    });
  }
};

// ==========================================
// 6. ADD STUDENT TO CLASS (Admin/Teacher)
// POST /api/classes/:id/students
// ==========================================
exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // Check student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        message: 'Student not found or user is not a student'
      });
    }

    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if already enrolled
    if (cls.students.includes(studentId)) {
      return res.status(400).json({
        message: 'Student already enrolled in this class'
      });
    }

    // Check capacity
    if (cls.students.length >= cls.capacity) {
      return res.status(400).json({
        message: `Class is full (capacity: ${cls.capacity})`
      });
    }

    cls.students.push(studentId);
    await cls.save();

    res.json({
      message: 'Student added to class successfully',
      class: cls
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding student',
      error: error.message
    });
  }
};

// ==========================================
// 7. REMOVE STUDENT FROM CLASS (Admin/Teacher)
// DELETE /api/classes/:id/students/:studentId
// ==========================================
exports.removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const cls = await Class.findById(id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (!cls.students.includes(studentId)) {
      return res.status(400).json({
        message: 'Student is not enrolled in this class'
      });
    }

    cls.students = cls.students.filter(
      s => s.toString() !== studentId
    );
    await cls.save();

    res.json({
      message: 'Student removed from class successfully',
      class: cls
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing student',
      error: error.message
    });
  }
};

// ==========================================
// 8. GET CLASS BY TEACHER (Teacher's own classes)
// GET /api/classes/teacher/mine
// ==========================================
exports.getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      $or: [
        { homeroomTeacher: req.user._id },
        // also allow if teacher is in students? Not applicable, but teachers
        // might be linked via other fields in future
      ]
    })
      .populate('students', 'fullName email')
      .sort({ gradeLevel: 1, section: 1 });

    res.json({
      message: 'Your classes fetched',
      count: classes.length,
      classes
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching your classes',
      error: error.message
    });
  }
};
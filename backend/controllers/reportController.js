const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Payment = require('../models/Payment');
const Resource = require('../models/Resource');

// ==========================================
// HELPER: Letter grade
// ==========================================
function getLetterGrade(percent) {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

// ==========================================
// 1. STUDENT ATTENDANCE REPORT
// GET /api/reports/attendance/student/:id
// ==========================================
exports.getStudentAttendanceReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Access control for parents/students
    if (req.user.role === 'parent') {
      const child = await User.findById(studentId);
      if (!child || child.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { student: studentId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    const attendanceRate = total > 0
      ? ((present + late) / total * 100).toFixed(2)
      : 0;

    res.json({
      message: 'Student attendance report generated',
      studentId,
      period: { startDate, endDate },
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: `${attendanceRate}%`
      },
      records
    });
  } catch (error) {
    console.error('=== getStudentAttendanceReport ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 2. CLASS ATTENDANCE REPORT
// GET /api/reports/attendance/class/:id
// ==========================================
exports.getClassAttendanceReport = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const filter = { classroom: classId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: d, $lt: nextDay };
    }

    const records = await Attendance.find(filter)
      .populate('student', 'fullName email')
      .populate('teacher', 'fullName')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    const attendanceRate = total > 0
      ? ((present + late) / total * 100).toFixed(2)
      : 0;

    res.json({
      message: 'Class attendance report generated',
      classId,
      date: date || 'all-time',
      summary: { total, present, absent, late, attendanceRate: `${attendanceRate}%` },
      records
    });
  } catch (error) {
    console.error('=== getClassAttendanceReport ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 3. STUDENT GRADE REPORT
// GET /api/reports/grades/student/:id
// ==========================================
exports.getStudentGradeReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role === 'parent') {
      const child = await User.findById(studentId);
      if (!child || child.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { student: studentId };
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const marks = await Mark.find(filter)
      .populate('teacher', 'fullName')
      .sort({ subject: 1 });

    // Group by subject
    const bySubject = {};
    marks.forEach(m => {
      if (!bySubject[m.subject]) bySubject[m.subject] = [];
      bySubject[m.subject].push(m);
    });

    const subjects = Object.keys(bySubject).map(subj => {
      const list = bySubject[subj];
      const avg = list.reduce((sum, m) => {
        const percent = m.maxScore ? (m.score / m.maxScore) * 100 : 0;
        return sum + percent;
      }, 0) / list.length;

      return {
        subject: subj,
        markCount: list.length,
        average: Math.round(avg * 100) / 100,
        letterGrade: getLetterGrade(avg),
        marks: list
      };
    });

    const overallAvg = subjects.length
      ? subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length
      : 0;

    res.json({
      message: 'Student grade report generated',
      studentId,
      term: term || 'all',
      academicYear: academicYear || 'all',
      overallAverage: Math.round(overallAvg * 100) / 100,
      overallGrade: getLetterGrade(overallAvg),
      subjectCount: subjects.length,
      subjects
    });
  } catch (error) {
    console.error('=== getStudentGradeReport ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 4. CLASS GRADE PERFORMANCE
// GET /api/reports/grades/class/:id
// ==========================================
exports.getClassGradeReport = async (req, res) => {
  try {
    const { classId } = req.params;
    const { term, academicYear } = req.query;

    const filter = { classroom: classId };
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const marks = await Mark.find(filter)
      .populate('student', 'fullName email')
      .sort({ subject: 1 });

    // Group by student
    const byStudent = {};
    marks.forEach(m => {
      const sid = m.student?._id?.toString() || 'unknown';
      if (!byStudent[sid]) {
        byStudent[sid] = {
          student: m.student,
          marks: [],
          totalPercent: 0
        };
      }
      const percent = m.maxScore ? (m.score / m.maxScore) * 100 : 0;
      byStudent[sid].marks.push(m);
      byStudent[sid].totalPercent += percent;
    });

    const students = Object.values(byStudent).map(s => ({
      student: s.student,
      markCount: s.marks.length,
      average: Math.round((s.totalPercent / s.marks.length) * 100) / 100,
      letterGrade: getLetterGrade(s.totalPercent / s.marks.length)
    }));

    const classAvg = students.length
      ? students.reduce((sum, s) => sum + s.average, 0) / students.length
      : 0;

    res.json({
      message: 'Class grade report generated',
      classId,
      term: term || 'all',
      academicYear: academicYear || 'all',
      classAverage: Math.round(classAvg * 100) / 100,
      classGrade: getLetterGrade(classAvg),
      studentCount: students.length,
      students
    });
  } catch (error) {
    console.error('=== getClassGradeReport ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 5. FINANCE SUMMARY (Admin)
// GET /api/reports/finance/summary
// ==========================================
exports.getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter);

    const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPenalties = payments.reduce((sum, p) => sum + (p.penalty || 0), 0);
    const totalBasePaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      message: 'Finance summary generated',
      period: { startDate, endDate },
      summary: {
        totalRecords: payments.length,
        paidCount: payments.filter(p => p.status === 'paid').length,
        pendingCount: payments.filter(p => p.status === 'pending').length,
        overdueCount: payments.filter(p => p.status === 'overdue').length,
        blockedCount: payments.filter(p => p.status === 'blocked').length,
        totalExpected,
        totalPaid,
        totalBasePaid,
        totalPenalties,
        collectionRate: totalExpected > 0
          ? `${((totalBasePaid / totalExpected) * 100).toFixed(2)}%`
          : '0%'
      }
    });
  } catch (error) {
    console.error('=== getFinanceSummary ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 6. PER-CLASS FINANCE REPORT
// GET /api/reports/finance/class/:classId
// ==========================================
exports.getClassFinanceReport = async (req, res) => {
  try {
    const { classId } = req.params;

    const classroom = await Class.findById(classId).populate('students', 'fullName email');
    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const payments = await Payment.find({ classroom: classId })
      .populate('student', 'fullName email')
      .sort({ createdAt: -1 });

    const paidStudentIds = payments
      .filter(p => p.status === 'paid')
      .map(p => p.student?._id?.toString());

    const unpaidStudents = classroom.students.filter(
      s => !paidStudentIds.includes(s._id.toString())
    );

    res.json({
      message: 'Class finance report generated',
      classId,
      className: classroom.className,
      totalStudents: classroom.students.length,
      paidCount: paidStudentIds.length,
      unpaidCount: unpaidStudents.length,
      payments,
      unpaidStudents
    });
  } catch (error) {
    console.error('=== getClassFinanceReport ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};

// ==========================================
// 7. DASHBOARD OVERVIEW (Admin)
// GET /api/reports/dashboard
// ==========================================
exports.getDashboardOverview = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalClasses] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Class.countDocuments()
    ]);

    const totalAttendance = await Attendance.countDocuments();
    const totalMarks = await Mark.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalResources = await Resource.countDocuments();

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    // Finance snapshot
    const paidSum = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalCollected = paidSum[0]?.total || 0;

    res.json({
      message: 'Dashboard overview generated',
      timestamp: new Date(),
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers
      },
      academics: {
        classes: totalClasses,
        attendanceRecords: totalAttendance,
        todayAttendance,
        marksEntered: totalMarks,
        resourcesUploaded: totalResources
      },
      finance: {
        totalPayments,
        totalCollected
      }
    });
  } catch (error) {
    console.error('=== getDashboardOverview ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating dashboard',
      error: error.message
    });
  }
};

// ==========================================
// 8. TEACHER PERFORMANCE REPORT
// GET /api/reports/teacher/performance
// ==========================================
exports.getTeacherPerformance = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('fullName email');

    const performance = await Promise.all(teachers.map(async (t) => {
      const marksEntered = await Mark.countDocuments({ teacher: t._id });
      const attendanceMarked = await Attendance.countDocuments({ teacher: t._id });
      const resourcesUploaded = await Resource.countDocuments({ teacher: t._id });
      const classesAsHomeroom = await Class.countDocuments({ homeroomTeacher: t._id });

      return {
        teacher: { id: t._id, name: t.fullName, email: t.email },
        marksEntered,
        attendanceMarked,
        resourcesUploaded,
        classesAsHomeroom
      };
    }));

    res.json({
      message: 'Teacher performance report generated',
      teacherCount: performance.length,
      performance
    });
  } catch (error) {
    console.error('=== getTeacherPerformance ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message
    });
  }
};
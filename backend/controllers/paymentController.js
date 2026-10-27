const Payment = require('../models/Payment');
const PaymentSettings = require('../models/PaymentSettings');
const User = require('../models/User');
const Class = require('../models/Class');
const axios = require('axios');

// ==========================================
// HELPER: Calculate penalty based on days late
// ==========================================
function calculatePenalty(daysLate, penaltyRules, blockAfterDays) {
  if (daysLate <= 0) {
    return { penalty: 0, blocked: false };
  }

  if (daysLate >= blockAfterDays) {
    return { penalty: null, blocked: true };
  }

  const rules = penaltyRules instanceof Map
    ? Object.fromEntries(penaltyRules)
    : penaltyRules;

  const penalty = rules[daysLate.toString()] || 0;
  return { penalty, blocked: false };
}

// ==========================================
// HELPER: Calculate days late
// ==========================================
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((date2 - date1) / oneDay);
  return diff;
}

// ==========================================
// 1. SET DEADLINE (Admin only)
// POST /api/payments/set-deadline
// ==========================================
exports.setDeadline = async (req, res) => {
  try {
    const {
      currentDueDate,
      periodLabel,
      baseAmount,
      classroomId,
      penaltyRules,
      blockAfterDays
    } = req.body;

    if (!currentDueDate || !periodLabel || !baseAmount || !classroomId) {
      return res.status(400).json({
        message: 'currentDueDate, periodLabel, baseAmount, and classroomId are required'
      });
    }

    const classroom = await Class.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await PaymentSettings.updateMany(
      { classroom: classroomId, isActive: true },
      { isActive: false }
    );

    const settings = await PaymentSettings.create({
      currentDueDate: new Date(currentDueDate),
      periodLabel,
      baseAmount,
      classroom: classroomId,
      penaltyRules: penaltyRules || { '1': 100, '2': 300, '3': 500 },
      blockAfterDays: blockAfterDays || 4,
      setBy: req.user._id,
      isActive: true
    });

    res.status(201).json({
      message: 'Payment deadline set successfully',
      settings
    });
  } catch (error) {
    console.error('=== setDeadline ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error setting deadline',
      error: error.message
    });
  }
};

// ==========================================
// 2. GET ACTIVE DEADLINE FOR A CLASS
// GET /api/payments/deadline/:classId
// ==========================================
exports.getDeadline = async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne({
      classroom: req.params.classId,
      isActive: true
    })
      .populate('classroom', 'className')
      .populate('setBy', 'fullName');

    if (!settings) {
      return res.status(404).json({
        message: 'No active payment deadline for this class'
      });
    }

    const now = new Date();
    const due = new Date(settings.currentDueDate);
    const daysLate = daysBetween(due, now);

    let status = 'on-time';
    let nextPenalty = 0;
    if (daysLate > 0 && daysLate < settings.blockAfterDays) {
      status = 'late';
      const rules = Object.fromEntries(settings.penaltyRules);
      nextPenalty = rules[daysLate.toString()] || 0;
    } else if (daysLate >= settings.blockAfterDays) {
      status = 'blocked';
    }

    res.json({
      message: 'Active deadline fetched',
      settings,
      currentStatus: status,
      daysLate: daysLate > 0 ? daysLate : 0,
      currentPenalty: nextPenalty
    });
  } catch (error) {
    console.error('=== getDeadline ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching deadline',
      error: error.message
    });
  }
};

// ==========================================
// 3. CHECK PAYMENT STATUS FOR A STUDENT
// GET /api/payments/status/:studentId
// ==========================================
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classroom = await Class.findOne({ students: studentId });
    if (!classroom) {
      return res.status(404).json({
        message: 'Student is not enrolled in any class'
      });
    }

    const settings = await PaymentSettings.findOne({
      classroom: classroom._id,
      isActive: true
    });

    if (!settings) {
      return res.status(404).json({
        message: 'No active payment deadline for this student\'s class'
      });
    }

    const existingPayment = await Payment.findOne({
      student: studentId,
      periodLabel: settings.periodLabel,
      status: 'paid'
    });

    if (existingPayment) {
      return res.json({
        message: 'Already paid for this period',
        status: 'paid',
        payment: existingPayment
      });
    }

    const now = new Date();
    const due = new Date(settings.currentDueDate);
    const daysLate = daysBetween(due, now);

    const { penalty, blocked } = calculatePenalty(
      daysLate,
      settings.penaltyRules,
      settings.blockAfterDays
    );

    if (blocked) {
      return res.json({
        message: 'Payment deadline has passed. Contact admin.',
        status: 'blocked',
        daysLate,
        baseAmount: settings.baseAmount,
        reason: `More than ${settings.blockAfterDays - 1} days late`
      });
    }

    const totalAmount = settings.baseAmount + (penalty || 0);

    res.json({
      message: 'Payment status checked',
      status: daysLate > 0 ? 'late' : 'pending',
      studentId,
      classroom: classroom._id,
      periodLabel: settings.periodLabel,
      dueDate: settings.currentDueDate,
      daysLate: daysLate > 0 ? daysLate : 0,
      baseAmount: settings.baseAmount,
      penalty: penalty || 0,
      totalAmount,
      canPay: true
    });
  } catch (error) {
    console.error('=== checkPaymentStatus ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error checking payment status',
      error: error.message
    });
  }
};

// ==========================================
// 4. INITIATE PAYMENT (Parent/Student)
// POST /api/payments/initiate
// ==========================================
exports.initiatePayment = async (req, res) => {
  try {
    const { studentId, periodLabel } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (req.user.role === 'parent') {
      if (student.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only pay for your own child'
        });
      }
    }

    const classroom = await Class.findOne({ students: studentId });
    if (!classroom) {
      return res.status(404).json({
        message: 'Student is not enrolled in any class'
      });
    }

    const settings = await PaymentSettings.findOne({
      classroom: classroom._id,
      isActive: true
    });

    if (!settings) {
      return res.status(404).json({
        message: 'No active payment settings for this class'
      });
    }

    const existing = await Payment.findOne({
      student: studentId,
      periodLabel: settings.periodLabel,
      status: 'paid'
    });

    if (existing) {
      return res.status(400).json({
        message: 'Already paid for this period',
        receiptNumber: existing.receiptNumber
      });
    }

    const now = new Date();
    const due = new Date(settings.currentDueDate);
    const daysLate = daysBetween(due, now);

    const { penalty, blocked } = calculatePenalty(
      daysLate,
      settings.penaltyRules,
      settings.blockAfterDays
    );

    if (blocked) {
      return res.status(403).json({
        message: `Payment is BLOCKED. You are ${daysLate} days late. Please contact the school admin.`,
        daysLate,
        status: 'blocked',
        baseAmount: settings.baseAmount
      });
    }

    let payment = await Payment.findOne({
      student: studentId,
      periodLabel: settings.periodLabel,
      status: { $in: ['pending', 'overdue'] }
    });

    if (payment) {
      payment.penalty = penalty || 0;
      payment.dueDate = settings.currentDueDate;
      payment.daysLate = daysLate > 0 ? daysLate : 0;
      payment.amount = settings.baseAmount;
      if (daysLate > 0) payment.status = 'overdue';
      await payment.save();
    } else {
      payment = await Payment.create({
        student: studentId,
        parent: req.user.role === 'parent' ? req.user._id : null,
        classroom: classroom._id,
        amount: settings.baseAmount,
        penalty: penalty || 0,
        periodLabel: settings.periodLabel,
        period: 'Monthly',
        dueDate: settings.currentDueDate,
        daysLate: daysLate > 0 ? daysLate : 0,
        status: daysLate > 0 ? 'overdue' : 'pending',
        method: 'Online',
        createdBy: req.user._id
      });
    }

    res.status(201).json({
      message: daysLate > 0
        ? `Payment initiated. You are ${daysLate} days late. Penalty: ${penalty} Birr`
        : 'Payment initiated successfully',
      payment,
      breakdown: {
        baseAmount: settings.baseAmount,
        penalty: penalty || 0,
        totalAmount: settings.baseAmount + (penalty || 0),
        daysLate: daysLate > 0 ? daysLate : 0
      },
      nextStep: 'Use POST /api/payments/verify with paymentId to complete'
    });
  } catch (error) {
    console.error('=== initiatePayment ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error initiating payment',
      error: error.message
    });
  }
};

// ==========================================
// 5. VERIFY PAYMENT (simulates gateway callback)
// POST /api/payments/verify
// ==========================================
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, method } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: 'paymentId is required' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({
        message: 'Payment already completed',
        receiptNumber: payment.receiptNumber
      });
    }

    const now = new Date();
    const due = new Date(payment.dueDate);
    const daysLate = daysBetween(due, now);

    const settings = await PaymentSettings.findOne({
      classroom: payment.classroom,
      isActive: true
    });

    if (settings) {
      const { blocked } = calculatePenalty(
        daysLate,
        settings.penaltyRules,
        settings.blockAfterDays
      );

      if (blocked) {
        payment.status = 'blocked';
        await payment.save();
        return res.status(403).json({
          message: 'Payment is BLOCKED due to excessive delay. Contact admin.',
          daysLate
        });
      }
    }

    payment.status = 'paid';
    payment.paymentDate = new Date();
    payment.transactionId = transactionId || `TXN-${Date.now()}`;
    payment.method = method || 'Online';
    payment.daysLate = daysLate > 0 ? daysLate : 0;

    await payment.save();

    res.json({
      message: 'Payment verified successfully',
      payment,
      receiptNumber: payment.receiptNumber
    });
  } catch (error) {
    console.error('=== verifyPayment ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// ==========================================
// 6. GET STUDENT PAYMENT HISTORY
// GET /api/payments/student/:studentId
// ==========================================
exports.getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'parent') {
      const student = await User.findById(studentId);
      if (!student || student.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only view your own child\'s payments'
        });
      }
    }
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        message: 'You can only view your own payments'
      });
    }

    const payments = await Payment.find({ student: studentId })
      .populate('classroom', 'className')
      .sort({ createdAt: -1 });

    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPenalty = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.penalty, 0);

    res.json({
      message: 'Payment history fetched',
      count: payments.length,
      summary: {
        totalPaid,
        totalPenalty,
        paidCount: payments.filter(p => p.status === 'paid').length,
        pendingCount: payments.filter(p => p.status === 'pending').length,
        overdueCount: payments.filter(p => p.status === 'overdue').length,
        blockedCount: payments.filter(p => p.status === 'blocked').length
      },
      payments
    });
  } catch (error) {
    console.error('=== getStudentPayments ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// ==========================================
// 7. GET RECEIPT
// GET /api/payments/receipt/:paymentId
// ==========================================
exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('student', 'fullName email')
      .populate('classroom', 'className')
      .populate('parent', 'fullName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        message: 'Receipt not available. Payment is not yet completed.'
      });
    }

    res.json({
      message: 'Receipt fetched',
      receipt: {
        receiptNumber: payment.receiptNumber,
        student: payment.student,
        parent: payment.parent,
        classroom: payment.classroom,
        periodLabel: payment.periodLabel,
        baseAmount: payment.amount,
        penalty: payment.penalty,
        totalAmount: payment.totalAmount,
        daysLate: payment.daysLate,
        paymentDate: payment.paymentDate,
        method: payment.method,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    console.error('=== getReceipt ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching receipt',
      error: error.message
    });
  }
};

// ==========================================
// 8. GET OVERDUE STUDENTS (Admin)
// GET /api/payments/overdue/:classId
// ==========================================
exports.getOverdueStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const settings = await PaymentSettings.findOne({
      classroom: classId,
      isActive: true
    });

    if (!settings) {
      return res.status(404).json({
        message: 'No active payment settings for this class'
      });
    }

    const classroom = await Class.findById(classId).populate('students', 'fullName email');
    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const now = new Date();
    const due = new Date(settings.currentDueDate);
    const daysLate = daysBetween(due, now);

    if (daysLate <= 0) {
      return res.json({
        message: 'No overdue payments yet',
        daysLate: 0,
        overdueStudents: []
      });
    }

    const paidStudentIds = await Payment.find({
      classroom: classId,
      periodLabel: settings.periodLabel,
      status: 'paid'
    }).distinct('student');

    const overdue = classroom.students
      .filter(s => !paidStudentIds.map(id => id.toString()).includes(s._id.toString()))
      .map(s => ({
        student: {
          id: s._id,
          fullName: s.fullName,
          email: s.email
        },
        daysLate,
        penalty: daysLate < settings.blockAfterDays
          ? (Object.fromEntries(settings.penaltyRules)[daysLate.toString()] || 0)
          : null,
        blocked: daysLate >= settings.blockAfterDays
      }));

    res.json({
      message: 'Overdue students fetched',
      daysLate,
      blockAfterDays: settings.blockAfterDays,
      count: overdue.length,
      overdueStudents: overdue
    });
  } catch (error) {
    console.error('=== getOverdueStudents ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching overdue students',
      error: error.message
    });
  }
};
// ==========================================
// INITIATE CHAPA PAYMENT (Real Gateway)
// POST /api/payments/chapa/initiate
// ==========================================
exports.initiateChapaPayment = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId required' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (req.user.role === 'parent') {
      if (student.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not your child' });
      }
    }

    const classroom = await Class.findOne({ students: studentId });
    if (!classroom) {
      return res.status(404).json({ message: 'Student not in class' });
    }

    const settings = await PaymentSettings.findOne({
      classroom: classroom._id,
      isActive: true
    });

    if (!settings) {
      return res.status(404).json({ message: 'No payment deadline' });
    }

    const existing = await Payment.findOne({
      student: studentId,
      periodLabel: settings.periodLabel,
      status: 'paid'
    });

    if (existing) {
      return res.status(400).json({
        message: 'Already paid',
        receiptNumber: existing.receiptNumber
      });
    }

    const now = new Date();
    const due = new Date(settings.currentDueDate);
    const daysLate = Math.floor((now - due) / (1000 * 60 * 60 * 24));

    const { penalty, blocked } = calculatePenalty(
      daysLate,
      settings.penaltyRules,
      settings.blockAfterDays
    );

    if (blocked) {
      return res.status(403).json({
        message: `Payment BLOCKED. ${daysLate} days late.`,
        daysLate,
        status: 'blocked'
      });
    }

    const totalAmount = settings.baseAmount + (penalty || 0);
    const tx_ref = `ISCMS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 🔥 ማስተካከያ፦ አስቀድሞ የ "pending" ሪከርድ ካለ አዲስ ከመፍጠር ይልቅ ያለውን እናዘምን
    let payment = await Payment.findOne({
      student: studentId,
      periodLabel: settings.periodLabel,
      status: { $in: ['pending', 'overdue'] }
    });

    if (payment) {
      // ያለውን ሪከርድ አዘምን (አዲስ አትፍጠር)
      payment.penalty = penalty || 0;
      payment.dueDate = settings.currentDueDate;
      payment.daysLate = daysLate > 0 ? daysLate : 0;
      payment.amount = settings.baseAmount;
      payment.method = 'Chapa';
      payment.transactionId = tx_ref;
      if (daysLate > 0) payment.status = 'overdue';
      await payment.save();
    } else {
      // ምንም ሪከርድ ከሌለ አዲስ ፍጠር
      payment = await Payment.create({
        student: studentId,
        parent: req.user.role === 'parent' ? req.user._id : null,
        classroom: classroom._id,
        amount: settings.baseAmount,
        penalty: penalty || 0,
        periodLabel: settings.periodLabel,
        period: 'Monthly',
        dueDate: settings.currentDueDate,
        daysLate: daysLate > 0 ? daysLate : 0,
        status: daysLate > 0 ? 'overdue' : 'pending',
        method: 'Chapa',
        transactionId: tx_ref,
        createdBy: req.user._id
      });
    }

    // Chapa API call with email fallback fix
    const chapaResponse = await axios.post(
      `${process.env.CHAPA_BASE_URL}/transaction/initialize`,
      {
        amount: totalAmount,
        currency: 'ETB',
        email: (req.user.email && req.user.email.includes('@')) 
               ? req.user.email 
               : 'abelyesfa5@gmail.com',
        first_name: req.user.name ? req.user.name.split(' ')[0] : 'Parent',
        last_name: req.user.name && req.user.name.split(' ').length > 1 ? req.user.name.split(' ')[1] : 'User',
        phone_number: '0900000000',
        tx_ref: tx_ref,
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        customization: {
          title: 'ISCMS School Fee',
          description: `Payment for ${student.fullName} - ${settings.periodLabel}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(201).json({
      message: 'Payment initiated',
      paymentId: payment._id,
      checkoutUrl: chapaResponse.data.data.checkout_url,
      tx_ref: tx_ref,
      amount: totalAmount
    });
  } catch (error) {
    console.error('=== Chapa initiate ERROR ===');
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: 'Payment initiation failed',
      error: error.response?.data?.message || error.message
    });
  }
};
// ==========================================
// VERIFY CHAPA PAYMENT (Webhook / Return)
// GET /api/payments/chapa/verify/:txRef
// ==========================================
exports.verifyChapaPayment = async (req, res) => {
  try {
    const { txRef } = req.params;

    const chapaResponse = await axios.get(
      `${process.env.CHAPA_BASE_URL}/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );

    const data = chapaResponse.data.data;

    if (data.status !== 'success') {
      return res.status(400).json({
        message: 'Payment not successful',
        status: data.status
      });
    }

    const payment = await Payment.findOne({ transactionId: txRef });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'paid') {
      return res.json({ message: 'Already paid', payment });
    }

    payment.status = 'paid';
    payment.paymentDate = new Date();
    payment.method = 'Chapa';

    await payment.save();

    res.json({
      message: 'Payment verified successfully',
      payment,
      receiptNumber: payment.receiptNumber
    });
  } catch (error) {
    console.error('=== Chapa verify ERROR ===');
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: 'Verification failed',
      error: error.message
    });
  }
};
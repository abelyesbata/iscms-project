const Notification = require('../models/Notification');
const User = require('../models/User');

// ==========================================
// 1. SEND NOTIFICATION (Admin/Teacher)
// POST /api/notifications/send
// ==========================================
exports.sendNotification = async (req, res) => {
  try {
    const {
      recipientId,
      title,
      message,
      type,
      priority,
      relatedId,
      relatedModel,
      link
    } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({
        message: 'recipientId, title, and message are required'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      title,
      message,
      type: type || 'general',
      priority: priority || 'normal',
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      link: link || ''
    });

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('=== sendNotification ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error sending notification',
      error: error.message
    });
  }
};

// ==========================================
// 2. SEND BULK NOTIFICATIONS
// POST /api/notifications/send-bulk
// ==========================================
exports.sendBulkNotifications = async (req, res) => {
  try {
    const {
      recipientIds,   // array of user ids
      title,
      message,
      type,
      priority,
      link
    } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || !title || !message) {
      return res.status(400).json({
        message: 'recipientIds (array), title, and message are required'
      });
    }

    const docs = recipientIds.map(id => ({
      recipient: id,
      sender: req.user._id,
      title,
      message,
      type: type || 'general',
      priority: priority || 'normal',
      link: link || ''
    }));

    const created = await Notification.insertMany(docs);

    res.status(201).json({
      message: `Sent ${created.length} notifications`,
      count: created.length,
      notifications: created
    });
  } catch (error) {
    console.error('=== sendBulkNotifications ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error sending bulk notifications',
      error: error.message
    });
  }
};

// ==========================================
// 3. GET MY NOTIFICATIONS
// GET /api/notifications/my
// ==========================================
exports.getMyNotifications = async (req, res) => {
  try {
    const { type, isRead, limit } = req.query;

    const filter = { recipient: req.user._id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const query = Notification.find(filter)
      .populate('sender', 'fullName email role')
      .sort({ createdAt: -1 });

    if (limit) query.limit(parseInt(limit));

    const notifications = await query;
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      message: 'Notifications fetched',
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('=== getMyNotifications ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// ==========================================
// 4. GET USER'S NOTIFICATIONS (Admin)
// GET /api/notifications/user/:userId
// ==========================================
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      message: 'User notifications fetched',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('=== getUserNotifications ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// ==========================================
// 5. MARK ONE AS READ
// PUT /api/notifications/:id/read
// ==========================================
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only the recipient can mark their own notifications
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only mark your own notifications'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: 'Marked as read',
      notification
    });
  } catch (error) {
    console.error('=== markAsRead ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// ==========================================
// 6. MARK ALL AS READ
// PUT /api/notifications/read-all
// ==========================================
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('=== markAllAsRead ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error marking all as read',
      error: error.message
    });
  }
};

// ==========================================
// 7. DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// ==========================================
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only the recipient or admin can delete
    const isOwner = notification.recipient.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'You can only delete your own notifications'
      });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('=== deleteNotification ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// ==========================================
// 8. DELETE ALL MY NOTIFICATIONS
// DELETE /api/notifications/clear-all
// ==========================================
exports.clearAllMine = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id });

    res.json({
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('=== clearAllMine ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error clearing notifications',
      error: error.message
    });
  }
};

// ==========================================
// 9. GET UNREAD COUNT
// GET /api/notifications/unread-count
// ==========================================
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      message: 'Unread count fetched',
      unreadCount: count
    });
  } catch (error) {
    console.error('=== getUnreadCount ERROR ===');
    console.error(error.stack);
    res.status(500).json({
      message: 'Error counting unread',
      error: error.message
    });
  }
};
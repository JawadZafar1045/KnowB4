const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

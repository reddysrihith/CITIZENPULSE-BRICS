const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const createNotification = async ({ user, title, message, type = 'info', link = '', metadata = {} }) => {
  if (!user || !title || !message) return null;

  const notification = await Notification.create({
    user,
    title,
    message,
    type,
    link,
    metadata,
  });

  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
    User.findById(user, 'email name')
      .then((recipient) => {
        if (!recipient?.email) return null;
        return sendEmail({
          email: recipient.email,
          subject: `SkillSphere: ${title}`,
          message: `
            <h2>${title}</h2>
            <p>${message}</p>
            ${link ? `<p><a href="${process.env.FRONTEND_URL || ''}${link}">Open in SkillSphere</a></p>` : ''}
          `,
        });
      })
      .catch((error) => console.warn('Email notification failed:', error.message));
  }

  return notification;
};

exports.createNotification = createNotification;

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((item) => !item.read).length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

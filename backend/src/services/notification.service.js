const Notification = require('../models/Notification');

const createNotification = async ({ userId, companyId, title, message, type = 'SYSTEM', link = '' }) => {
  try {
    return await Notification.create({
      userId,
      companyId,
      title,
      message,
      type,
      link
    });
  } catch (err) {
    console.error('[Notification Service] Failed to create notification:', err);
    return null;
  }
};

module.exports = { createNotification };

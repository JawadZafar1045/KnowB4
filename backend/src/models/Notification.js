const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['TRAINING_ASSIGNED', 'REMINDER', 'QUIZ_PASSED', 'QUIZ_FAILED', 'CERTIFICATE_ISSUED', 'SYSTEM'],
    default: 'SYSTEM'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);

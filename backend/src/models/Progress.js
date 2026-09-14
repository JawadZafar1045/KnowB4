const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  watchProgress: {
    type: Number, // seconds or percentage
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

ProgressSchema.index({ userId: 1, enrollmentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);

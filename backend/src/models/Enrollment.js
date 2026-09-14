const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'OVERDUE'],
    default: 'ASSIGNED'
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

EnrollmentSchema.index({ companyId: 1, userId: 1, campaignId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);

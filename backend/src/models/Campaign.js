const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  targetType: {
    type: String,
    enum: ['ALL_EMPLOYEES', 'DEPARTMENT', 'SELECTED_USERS'],
    default: 'ALL_EMPLOYEES'
  },
  targetDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  passingRequirement: {
    type: Number, // percentage required
    default: 80
  },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

CampaignSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Campaign', CampaignSchema);

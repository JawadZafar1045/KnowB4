const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

AuditLogSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

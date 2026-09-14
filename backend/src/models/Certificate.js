const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['VALID', 'REVOKED', 'EXPIRED'],
    default: 'VALID'
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

CertificateSchema.index({ companyId: 1, userId: 1, courseId: 1 });

module.exports = mongoose.model('Certificate', CertificateSchema);

const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Company slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: 'Technology'
  },
  address: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'],
    default: 'ACTIVE'
  },
  subscriptionPlan: {
    type: String,
    enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    default: 'PROFESSIONAL'
  },
  subscriptionStatus: {
    type: String,
    enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL'],
    default: 'ACTIVE'
  },
  branding: {
    primaryColor: { type: String, default: '#06b6d4' },
    secondaryColor: { type: String, default: '#3b82f6' }
  }
}, { timestamps: true });

CompanySchema.index({ status: 1 });

module.exports = mongoose.model('Company', CompanySchema);

const mongoose = require('mongoose');
const crypto = require('crypto');

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
  tenantId: {
    type: String,
    required: [true, 'Tenant ID is required'],
    unique: true,
    uppercase: true,
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
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'PENDING_APPROVAL'],
    default: 'PENDING_APPROVAL'
  },
  subscriptionPlan: {
    type: String,
    enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    default: 'PROFESSIONAL'
  },
  subscriptionStatus: {
    type: String,
    enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL'],
    default: 'TRIAL'
  },
  branding: {
    primaryColor: { type: String, default: '#06b6d4' },
    secondaryColor: { type: String, default: '#3b82f6' }
  },
  activatedAt: {
    type: Date,
    default: null
  },
  activatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

CompanySchema.index({ status: 1 });

// Auto-generate a unique tenantId before validation if not set
CompanySchema.pre('validate', async function(next) {
  if (!this.tenantId) {
    // Generate format: TB4-XXXXXX (6 uppercase alphanumeric chars)
    const generateId = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0,O,1,I)
      let id = 'TB4-';
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

    let attempts = 0;
    let id;
    do {
      id = generateId();
      const exists = await mongoose.model('Company').findOne({ tenantId: id });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    this.tenantId = id;
  }
  next();
});

module.exports = mongoose.model('Company', CompanySchema);

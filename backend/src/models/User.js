const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password']
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'],
    default: 'EMPLOYEE'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED'],
    default: 'ACTIVE'
  },
  avatar: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: 'Employee'
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, { timestamps: true });

UserSchema.index({ companyId: 1 });
UserSchema.index({ companyId: 1, role: 1 });

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

UserSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

UserSchema.methods.incrementFailedLogin = async function() {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  if (this.failedLoginAttempts >= 5) {
    const lockMinutes = 30;
    this.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
  }
  await this.save({ validateBeforeSave: false });
};

UserSchema.methods.resetFailedLogin = async function() {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', UserSchema);

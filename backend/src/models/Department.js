const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

DepartmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);

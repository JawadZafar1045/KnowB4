const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

ModuleSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Module', ModuleSchema);

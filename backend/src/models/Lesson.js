const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    enum: ['VIDEO', 'PDF', 'TEXT', 'IMAGE', 'EXTERNAL'],
    default: 'TEXT'
  },
  contentUrl: {
    type: String,
    default: ''
  },
  textContent: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // duration in minutes
    default: 5
  },
  order: {
    type: Number,
    default: 1
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

LessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);

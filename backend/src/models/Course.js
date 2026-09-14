const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Course slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General Security'
  },
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BEGINNER'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 15
  },
  passingScore: {
    type: Number, // e.g. 80
    default: 80
  },
  certificateEligible: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
    default: 'PUBLISHED'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

CourseSchema.index({ status: 1 });

module.exports = mongoose.model('Course', CourseSchema);

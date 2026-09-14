const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  type: {
    type: String,
    enum: ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE'],
    default: 'MCQ_SINGLE'
  },
  options: [OptionSchema],
  correctAnswer: {
    type: Number, // index of the correct option or string identifier
    default: 0
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM'
  },
  category: {
    type: String,
    default: 'General'
  },
  points: {
    type: Number,
    default: 10
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);

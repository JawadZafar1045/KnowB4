const mongoose = require('mongoose');

const AnswerRecordSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOption: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, { _id: false });

const QuizAttemptSchema = new mongoose.Schema({
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
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  answers: [AnswerRecordSchema],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  score: {
    type: Number, // percentage (0-100)
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

QuizAttemptSchema.index({ companyId: 1, userId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);

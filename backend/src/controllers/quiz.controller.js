const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Company = require('../models/Company');
const { issueCertificate } = require('../services/certificate.service');
const { createNotification } = require('../services/notification.service');

// @route   GET /api/quizzes/course/:courseId
// @desc    Get quiz for course (students receive sanitized questions without answers)
// @access  Private
const getQuizByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ courseId }).populate('questions');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz configured for this course' });
    }

    // Check learner's previous attempts
    const attempts = await QuizAttempt.find({
      userId: req.user._id,
      quizId: quiz._id
    }).sort({ attemptNumber: -1 });

    const attemptsCount = attempts.length;
    const hasPassed = attempts.some(a => a.passed);
    const attemptsRemaining = Math.max(0, quiz.attemptsAllowed - attemptsCount);

    // Sanitize questions for student: strip out isCorrect & explanation
    const sanitizedQuestions = quiz.questions.map((q, idx) => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options.map((opt, oIdx) => ({
        index: oIdx,
        text: opt.text
      })),
      difficulty: q.difficulty,
      points: q.points
    }));

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsCount,
        attemptsRemaining,
        hasPassed,
        bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
        questions: sanitizedQuestions
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/quizzes/:quizId/submit
// @desc    Submit quiz attempt, grade, record attempt, check course completion & issue certificate
// @access  Private (Learner)
const submitQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, campaignId } = req.body; // answers: [{ questionId, selectedOption }]

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check attempts limit
    const previousAttempts = await QuizAttempt.find({
      userId: req.user._id,
      quizId: quiz._id
    });

    const alreadyPassed = previousAttempts.some(a => a.passed);
    if (!alreadyPassed && previousAttempts.length >= quiz.attemptsAllowed) {
      return res.status(403).json({
        success: false,
        message: `You have exhausted all ${quiz.attemptsAllowed} attempts for this quiz.`
      });
    }

    // Grade the submission
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const gradedAnswers = [];
    const feedbackDetails = [];

    quiz.questions.forEach((q) => {
      const userSubmission = answers.find(a => String(a.questionId) === String(q._id));
      const selectedOption = userSubmission !== undefined ? userSubmission.selectedOption : -1;

      // Check if selected option is the correct one
      let isCorrect = false;
      if (selectedOption >= 0 && selectedOption < q.options.length) {
        isCorrect = q.options[selectedOption].isCorrect;
      }

      if (isCorrect) {
        correctCount++;
      }

      gradedAnswers.push({
        questionId: q._id,
        selectedOption,
        isCorrect
      });

      // Prepare educational review feedback
      const correctOptionIndex = q.options.findIndex(opt => opt.isCorrect);
      feedbackDetails.push({
        questionId: q._id,
        questionText: q.questionText,
        selectedOption,
        correctOption: correctOptionIndex,
        isCorrect,
        explanation: q.explanation || 'Review the cybersecurity policies in the course lessons.'
      });
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;
    const attemptNumber = previousAttempts.length + 1;

    // Record attempt
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      quizId: quiz._id,
      courseId: quiz.courseId,
      campaignId: campaignId || null,
      answers: gradedAnswers,
      totalQuestions,
      correctAnswers: correctCount,
      score,
      passed,
      attemptNumber,
      submittedAt: new Date()
    });

    let certificate = null;
    let courseCompleted = false;

    if (passed) {
      // Check lesson completions for this course
      const requiredLessons = await Lesson.find({ courseId: quiz.courseId, isRequired: true });
      const completedProgress = await Progress.find({
        userId: req.user._id,
        courseId: quiz.courseId,
        completed: true
      });

      const allLessonsCompleted = requiredLessons.every(l =>
        completedProgress.some(p => String(p.lessonId) === String(l._id))
      );

      // If all lessons completed (or if no lessons required), mark Enrollment as COMPLETED
      let enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: quiz.courseId
      });

      if (enrollment) {
        enrollment.progressPercentage = 100;
        enrollment.status = 'COMPLETED';
        enrollment.completedAt = new Date();
        await enrollment.save();
        courseCompleted = true;
      }

      // Automatically issue verified certificate
      const course = await Course.findById(quiz.courseId);
      const company = await Company.findById(req.user.companyId);

      if (course && company && course.certificateEligible) {
        certificate = await issueCertificate({
          user: req.user,
          company,
          course,
          campaignId,
          score
        });

        await createNotification({
          userId: req.user._id,
          companyId: req.user.companyId,
          title: '🎉 Certificate Earned!',
          message: `Congratulations! You scored ${score}% on "${course.title}" and earned your verified certificate.`,
          type: 'CERTIFICATE_ISSUED',
          link: `/employee/certificates`
        });
      }
    } else {
      await createNotification({
        userId: req.user._id,
        companyId: req.user.companyId,
        title: 'Quiz Assessment Incomplete',
        message: `You scored ${score}%. Passing score is ${quiz.passingScore}%. You have ${Math.max(0, quiz.attemptsAllowed - attemptNumber)} attempt(s) remaining.`,
        type: 'QUIZ_FAILED',
        link: `/employee/course/${quiz.courseId}/quiz`
      });
    }

    res.json({
      success: true,
      score,
      passed,
      passingScore: quiz.passingScore,
      totalQuestions,
      correctCount,
      attemptNumber,
      attemptsRemaining: Math.max(0, quiz.attemptsAllowed - attemptNumber),
      feedback: feedbackDetails,
      courseCompleted,
      certificate
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuizByCourse,
  submitQuizAttempt
};

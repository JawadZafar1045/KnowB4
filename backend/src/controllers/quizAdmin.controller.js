/**
 * Quiz management for Super Admin (PRD 15.6 / Sprint 4 - Quiz Builder).
 * Place in: backend/src/controllers/quizAdmin.controller.js
 *
 * This is a NEW file. The existing quiz.controller.js (learner side:
 * getQuizByCourse / submitQuizAttempt) is not touched.
 */
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const { buildQuestionsFromCsv } = require('../utils/quizCsv');

const MAX_CSV_CHARS = 200000;

const isSuperAdmin = (user) => user && user.role === 'SUPER_ADMIN';

const forbid = (res) =>
  res.status(403).json({
    success: false,
    message: 'Only the platform Super Admin can manage quizzes.'
  });

const toBool = (v) => v === true || v === 'true';

// Deletes the questions of a quiz, but keeps any question that another quiz still uses
const removeUnsharedQuestions = async (quizId, questionIds) => {
  if (!questionIds || questionIds.length === 0) return;
  const others = await Quiz.find({
    _id: { $ne: quizId },
    questions: { $in: questionIds }
  }).select('questions');
  const shared = new Set(others.flatMap((q) => q.questions.map(String)));
  const deletable = questionIds.filter((id) => !shared.has(String(id)));
  if (deletable.length) await Question.deleteMany({ _id: { $in: deletable } });
};

// @route   GET /api/quizzes
// @desc    List all quizzes with course info (Quiz Library)
// @access  Private (Super Admin)
const listQuizzes = async (req, res, next) => {
  try {
    if (!isSuperAdmin(req.user)) return forbid(res);

    const quizzes = await Quiz.find().sort({ createdAt: -1 }).populate('courseId', 'title category');

    const rows = await Promise.all(
      quizzes.map(async (q) => ({
        _id: q._id,
        title: q.title,
        course: q.courseId
          ? { _id: q.courseId._id, title: q.courseId.title, category: q.courseId.category }
          : null,
        questionCount: q.questions.length,
        passingScore: q.passingScore,
        timeLimit: q.timeLimit,
        attemptsAllowed: q.attemptsAllowed,
        status: q.status,
        attemptCount: await QuizAttempt.countDocuments({ quizId: q._id }),
        createdAt: q.createdAt
      }))
    );

    res.json({ success: true, count: rows.length, quizzes: rows });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/quizzes/import
// @desc    Create (or replace) a course quiz from CSV text.
//          Send dryRun:true first to validate and preview without saving.
// @access  Private (Super Admin)
const importQuiz = async (req, res, next) => {
  try {
    if (!isSuperAdmin(req.user)) return forbid(res);

    const {
      courseId,
      csvText,
      title,
      passingScore,
      timeLimit,
      attemptsAllowed,
      randomizeQuestions,
      randomizeOptions,
      replaceExisting,
      dryRun
    } = req.body;

    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Please select a valid course.' });
    }
    if (typeof csvText !== 'string' || !csvText.trim()) {
      return res.status(400).json({ success: false, message: 'CSV content is required.' });
    }
    if (csvText.length > MAX_CSV_CHARS) {
      return res.status(413).json({ success: false, message: 'CSV file is too large.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Quiz settings (fall back to sensible defaults)
    const settings = {
      passingScore: passingScore === undefined || passingScore === '' ? (course.passingScore || 80) : Number(passingScore),
      timeLimit: timeLimit === undefined || timeLimit === '' ? 15 : Number(timeLimit),
      attemptsAllowed: attemptsAllowed === undefined || attemptsAllowed === '' ? 3 : Number(attemptsAllowed),
      randomizeQuestions: toBool(randomizeQuestions),
      randomizeOptions: toBool(randomizeOptions)
    };

    if (!Number.isFinite(settings.passingScore) || settings.passingScore < 1 || settings.passingScore > 100) {
      return res.status(400).json({ success: false, message: 'Passing score must be between 1 and 100.' });
    }
    if (!Number.isFinite(settings.timeLimit) || settings.timeLimit < 0) {
      return res.status(400).json({ success: false, message: 'Time limit must be 0 (unlimited) or more minutes.' });
    }
    if (!Number.isInteger(settings.attemptsAllowed) || settings.attemptsAllowed < 1) {
      return res.status(400).json({ success: false, message: 'Attempts allowed must be at least 1.' });
    }

    const { items, errors, totalRows } = buildQuestionsFromCsv(csvText);
    const existing = await Quiz.findOne({ courseId });

    // ---- Step 1: preview only, nothing is saved ----
    if (toBool(dryRun)) {
      return res.json({
        success: true,
        valid: errors.length === 0,
        totalRows,
        validCount: items.length,
        errors,
        existingQuiz: existing ? { _id: existing._id, title: existing.title, questionCount: existing.questions.length } : null,
        preview: items.map((it) => ({
          row: it.row,
          questionText: it.data.questionText,
          type: it.data.type,
          options: it.data.options.map((o) => o.text),
          correctIndex: it.data.correctAnswer,
          points: it.data.points
        }))
      });
    }

    // ---- Step 2: real import (all rows must be valid) ----
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The CSV has ${errors.length} problem(s). Fix them and try again. Nothing was saved.`,
        errors
      });
    }

    if (existing) {
      if (!toBool(replaceExisting)) {
        return res.status(409).json({
          success: false,
          message: 'This course already has a quiz. Tick "Replace existing quiz" to overwrite it.'
        });
      }
      const attempts = await QuizAttempt.countDocuments({ quizId: existing._id });
      if (attempts > 0) {
        return res.status(409).json({
          success: false,
          message: `Learners have already made ${attempts} attempt(s) on the current quiz, so it cannot be replaced.`
        });
      }
    }

    const created = await Question.insertMany(
      items.map((it) => ({ ...it.data, createdBy: req.user._id }))
    );
    const questionIds = created.map((q) => q._id);

    let quiz;
    try {
      if (existing) {
        const oldQuestionIds = [...existing.questions];
        existing.title = title && title.trim() ? title.trim() : existing.title;
        existing.questions = questionIds;
        existing.set(settings);
        quiz = await existing.save();
        await removeUnsharedQuestions(existing._id, oldQuestionIds);
      } else {
        quiz = await Quiz.create({
          title: title && title.trim() ? title.trim() : `${course.title} - Final Assessment`,
          courseId,
          questions: questionIds,
          ...settings
        });
      }
    } catch (err) {
      // roll back the questions we just inserted so no orphans are left
      await Question.deleteMany({ _id: { $in: questionIds } });
      throw err;
    }

    res.status(201).json({
      success: true,
      message: `Quiz imported with ${questionIds.length} question(s).`,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        questionCount: questionIds.length,
        replaced: Boolean(existing)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/quizzes/:quizId
// @desc    Delete a quiz and its (unshared) questions
// @access  Private (Super Admin)
const deleteQuiz = async (req, res, next) => {
  try {
    if (!isSuperAdmin(req.user)) return forbid(res);

    const { quizId } = req.params;
    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz id.' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const attempts = await QuizAttempt.countDocuments({ quizId: quiz._id });
    if (attempts > 0) {
      return res.status(409).json({
        success: false,
        message: `This quiz has ${attempts} learner attempt(s) and cannot be deleted, to keep training records intact.`
      });
    }

    const questionIds = [...quiz.questions];
    await quiz.deleteOne();
    await removeUnsharedQuestions(quiz._id, questionIds);

    res.json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listQuizzes, importQuiz, deleteQuiz };
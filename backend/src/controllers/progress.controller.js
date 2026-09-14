const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// @route   POST /api/progress/lesson/:lessonId
// @desc    Update progress for a specific lesson
// @access  Private (Learner)
const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { completed, watchProgress } = req.body;
    const userId = req.user._id;
    const companyId = req.user.companyId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const courseId = lesson.courseId;

    // Find user's enrollment for this course
    let enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      // Auto-create enrollment if self-learning
      enrollment = await Enrollment.create({
        companyId,
        userId,
        campaignId: null,
        courseId,
        status: 'IN_PROGRESS',
        progressPercentage: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Upsert lesson progress
    let progress = await Progress.findOne({ userId, lessonId });
    if (!progress) {
      progress = new Progress({
        userId,
        companyId,
        enrollmentId: enrollment._id,
        courseId,
        lessonId,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
        watchProgress: watchProgress || 0,
        lastAccessedAt: new Date()
      });
    } else {
      if (completed && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      if (watchProgress !== undefined) {
        progress.watchProgress = watchProgress;
      }
      progress.lastAccessedAt = new Date();
    }
    await progress.save();

    // Recalculate course overall progress
    const totalLessons = await Lesson.countDocuments({ courseId });
    const completedLessons = await Progress.countDocuments({ userId, courseId, completed: true });
    const hasQuiz = await Quiz.exists({ courseId });

    // Weight: If course has a quiz, lessons account for 70% and quiz for 30%
    let percentage = 0;
    if (totalLessons > 0) {
      const lessonRatio = completedLessons / totalLessons;
      percentage = hasQuiz ? Math.round(lessonRatio * 70) : Math.round(lessonRatio * 100);
    }

    enrollment.progressPercentage = Math.min(percentage, 95); // 100% only awarded after quiz pass if quiz exists
    if (enrollment.status === 'ASSIGNED') {
      enrollment.status = 'IN_PROGRESS';
      enrollment.startedAt = new Date();
    }
    await enrollment.save();

    res.json({
      success: true,
      progress,
      courseProgressPercentage: enrollment.progressPercentage,
      completedLessons,
      totalLessons
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/progress/course/:courseId
// @desc    Get user's progress records for all lessons in a course
// @access  Private (Learner)
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const progressRecords = await Progress.find({ userId, courseId });
    const enrollment = await Enrollment.findOne({ userId, courseId });

    res.json({
      success: true,
      enrollment,
      progressRecords
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateLessonProgress,
  getCourseProgress
};

const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// @route   GET /api/courses
// @desc    Get all available courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    const filter = req.user.role === 'EMPLOYEE' ? { status: 'PUBLISHED' } : {};
    const courses = await Course.find(filter).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      courses.map(async (c) => {
        const moduleCount = await Module.countDocuments({ courseId: c._id });
        const lessonCount = await Lesson.countDocuments({ courseId: c._id });
        const quiz = await Quiz.findOne({ courseId: c._id });
        return {
          ...c.toObject(),
          moduleCount,
          lessonCount,
          hasQuiz: !!quiz
        };
      })
    );

    res.json({ success: true, count: enriched.length, courses: enriched });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/courses/:id
// @desc    Get single course with modules, lessons, and quiz info
// @access  Private
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ courseId: course._id, moduleId: mod._id }).sort({ order: 1 });
        return {
          ...mod.toObject(),
          lessons
        };
      })
    );

    const quiz = await Quiz.findOne({ courseId: course._id }).select('-questions.correctAnswer');

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        modules: modulesWithLessons,
        quiz: quiz ? {
          _id: quiz._id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          attemptsAllowed: quiz.attemptsAllowed,
          questionCount: quiz.questions.length
        } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Super Admin)
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, estimatedDuration, passingScore, thumbnail } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existing = await Course.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const course = await Course.create({
      title,
      slug: finalSlug,
      description,
      category: category || 'General Security',
      difficulty: difficulty || 'BEGINNER',
      estimatedDuration: estimatedDuration || 20,
      passingScore: passingScore || 80,
      thumbnail: thumbnail || '',
      createdBy: req.user._id,
      status: 'PUBLISHED'
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/courses/:id/modules
// @desc    Add module to course
// @access  Private (Super Admin)
const addModule = async (req, res, next) => {
  try {
    const { title, description, order } = req.body;
    const courseId = req.params.id;

    const module = await Module.create({
      courseId,
      title,
      description: description || '',
      order: order || 1
    });

    res.status(201).json({ success: true, module });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/courses/:id/lessons
// @desc    Add lesson to course module
// @access  Private (Super Admin)
const addLesson = async (req, res, next) => {
  try {
    const { moduleId, title, description, contentType, contentUrl, textContent, duration, order, isRequired } = req.body;
    const courseId = req.params.id;

    const lesson = await Lesson.create({
      courseId,
      moduleId,
      title,
      description: description || '',
      contentType: contentType || 'TEXT',
      contentUrl: contentUrl || '',
      textContent: textContent || '',
      duration: duration || 5,
      order: order || 1,
      isRequired: isRequired !== false
    });

    res.status(201).json({ success: true, lesson });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  addModule,
  addLesson
};

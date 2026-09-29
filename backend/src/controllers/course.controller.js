const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// DEMO SWITCH: true = company admin can edit/delete ALL courses (for demo).
// Set to false for production. Must match DEMO_MODE in CompanyCourseManager.jsx.
const DEMO_MODE = true;

// @route   GET /api/courses
// @desc    Get all available courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'EMPLOYEE') {
      filter = { status: 'PUBLISHED' };
    } else if (req.user.role === 'COMPANY_ADMIN') {
      filter = {
        $or: [
          { companyId: req.user.companyId },
          { companyId: null }
        ]
      };
    }

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

    res.json({
      success: true,
      count: enriched.length,
      courses: enriched
    });
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
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (
      req.user.role === 'COMPANY_ADMIN' &&
      course.companyId &&
      course.companyId.toString() !== req.user.companyId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    }

    const modules = await Module.find({
      courseId: course._id
    }).sort({ order: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({
          courseId: course._id,
          moduleId: mod._id
        }).sort({ order: 1 });

        return {
          ...mod.toObject(),
          lessons
        };
      })
    );

    const quiz = await Quiz.findOne({
      courseId: course._id
    }).select('-questions.correctAnswer');

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        modules: modulesWithLessons,
        quiz: quiz
          ? {
              _id: quiz._id,
              title: quiz.title,
              passingScore: quiz.passingScore,
              timeLimit: quiz.timeLimit,
              attemptsAllowed: quiz.attemptsAllowed,
              questionCount: quiz.questions.length
            }
          : null
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
    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      passingScore,
      thumbnail
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await Course.findOne({ slug });

    const finalSlug = existing
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;

    const coursePayload = {
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
    };

    if (req.user.role === 'COMPANY_ADMIN') {
      coursePayload.companyId = req.user.companyId;
    }

    const course = await Course.create(coursePayload);

    res.status(201).json({
      success: true,
      course
    });
  } catch (err) {
    next(err);
  }
};

// Helper: decides whether the logged-in user may edit/delete a given course.
//  - SUPER_ADMIN: any course
//  - COMPANY_ADMIN: only courses that belong to their own company
//    (global courses with companyId = null are shared by all tenants, so a
//     company admin must not change or remove them)
//  - everyone else (e.g. EMPLOYEE): never
const canManageCourse = (user, course) => {
  if (user.role === 'SUPER_ADMIN') return true;

  if (user.role === 'COMPANY_ADMIN') {
    // DEMO_MODE: company admin may also edit/delete shared (global) courses
    if (DEMO_MODE) return true;

    return (
      !!course.companyId &&
      !!user.companyId &&
      course.companyId.toString() === user.companyId.toString()
    );
  }

  return false;
};

// @route   PUT /api/courses/:id
// @desc    Update an existing course
// @access  Private (Super Admin, Company Admin - own courses only)
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this course'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      passingScore,
      thumbnail
    } = req.body;

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }

      course.title = String(title).trim();
    }

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty'
        });
      }

      course.description = String(description).trim();
    }

    if (category !== undefined) {
      course.category = category || 'General Security';
    }

    if (difficulty !== undefined) {
      course.difficulty = difficulty;
    }

    if (estimatedDuration !== undefined) {
      const duration = Number(estimatedDuration);

      if (!Number.isFinite(duration) || duration < 1) {
        return res.status(400).json({
          success: false,
          message: 'Estimated duration must be at least 1 minute'
        });
      }

      course.estimatedDuration = duration;
    }

    if (passingScore !== undefined) {
      const score = Number(passingScore);

      if (!Number.isFinite(score) || score < 1 || score > 100) {
        return res.status(400).json({
          success: false,
          message: 'Passing score must be between 1 and 100'
        });
      }

      course.passingScore = score;
    }

    if (thumbnail !== undefined) {
      course.thumbnail = thumbnail || '';
    }

    // slug is intentionally left unchanged so existing links keep working
    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/courses/:id
// @desc    Delete a course together with its modules, lessons and quiz
// @access  Private (Super Admin, Company Admin - own courses only)
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permission
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this course'
      });
    }

    // Delete all lessons belonging to this course
    await Lesson.deleteMany({
      courseId: course._id
    });

    // Delete all modules belonging to this course
    await Module.deleteMany({
      courseId: course._id
    });

    // Delete quiz belonging to this course
    await Quiz.deleteMany({
      courseId: course._id
    });

    // Finally delete the course
    await Course.deleteOne({
      _id: course._id
    });

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
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

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (
      req.user.role === 'COMPANY_ADMIN' &&
      course.companyId &&
      course.companyId.toString() !== req.user.companyId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot edit this course'
      });
    }

    const module = await Module.create({
      courseId,
      title,
      description: description || '',
      order: order || 1
    });

    res.status(201).json({
      success: true,
      module
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/courses/:id/lessons
// @desc    Add lesson to course module
// @access  Private (Super Admin)
const addLesson = async (req, res, next) => {
  try {
    const {
      moduleId,
      title,
      description,
      contentType,
      contentUrl,
      textContent,
      duration,
      order,
      isRequired
    } = req.body;

    const courseId = req.params.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (
      req.user.role === 'COMPANY_ADMIN' &&
      course.companyId &&
      course.companyId.toString() !== req.user.companyId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot edit this course'
      });
    }

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

    res.status(201).json({
      success: true,
      lesson
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  addLesson
};

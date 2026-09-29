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
      thumbnail,
      modules
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

    // If initial modules were provided, create them and any child lessons
    if (Array.isArray(modules) && modules.length > 0) {
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const m = modules[mIdx];
        if (!m || !m.title || !String(m.title).trim()) continue;

        const newModule = await Module.create({
          courseId: course._id,
          title: String(m.title).trim(),
          description: m.description || '',
          order: m.order || (mIdx + 1)
        });

        if (Array.isArray(m.lessons) && m.lessons.length > 0) {
          for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
            const l = m.lessons[lIdx];
            if (!l || !l.title || !String(l.title).trim()) continue;

            await Lesson.create({
              courseId: course._id,
              moduleId: newModule._id,
              title: String(l.title).trim(),
              description: l.description || '',
              contentType: l.contentType || 'TEXT',
              contentUrl: l.contentUrl || '',
              textContent: l.textContent || '',
              duration: Number(l.duration) || 5,
              order: l.order || (lIdx + 1),
              isRequired: l.isRequired !== false
            });
          }
        }
      }
    }

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
// @access  Private (Super Admin, Company Admin)
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

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this course'
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Module title is required'
      });
    }

    let moduleOrder = order;
    if (!moduleOrder) {
      const highest = await Module.findOne({ courseId }).sort({ order: -1 });
      moduleOrder = highest ? highest.order + 1 : 1;
    }

    const module = await Module.create({
      courseId,
      title: String(title).trim(),
      description: description || '',
      order: moduleOrder
    });

    res.status(201).json({
      success: true,
      module
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/courses/:id/modules/:moduleId
// @desc    Update a module
// @access  Private (Super Admin, Company Admin)
const updateModule = async (req, res, next) => {
  try {
    const { id: courseId, moduleId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this course' });
    }

    const mod = await Module.findOne({ _id: moduleId, courseId });
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: 'Module title cannot be empty' });
      }
      mod.title = String(title).trim();
    }
    if (description !== undefined) {
      mod.description = String(description).trim();
    }
    if (order !== undefined) {
      mod.order = Number(order) || mod.order;
    }

    await mod.save();

    res.json({
      success: true,
      message: 'Module updated successfully',
      module: mod
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/courses/:id/modules/:moduleId
// @desc    Delete module and its lessons
// @access  Private (Super Admin, Company Admin)
const deleteModule = async (req, res, next) => {
  try {
    const { id: courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this course' });
    }

    const mod = await Module.findOne({ _id: moduleId, courseId });
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Delete all lessons under this module
    await Lesson.deleteMany({ moduleId: mod._id });

    // Delete module
    await Module.deleteOne({ _id: mod._id });

    res.json({
      success: true,
      message: 'Module and its lessons deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/courses/:id/lessons
// @desc    Add lesson to course module
// @access  Private (Super Admin, Company Admin)
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

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this course'
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title is required'
      });
    }

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Module ID is required'
      });
    }

    const mod = await Module.findOne({ _id: moduleId, courseId });
    if (!mod) {
      return res.status(404).json({
        success: false,
        message: 'Target module not found for this course'
      });
    }

    let lessonOrder = order;
    if (!lessonOrder) {
      const highest = await Lesson.findOne({ courseId, moduleId }).sort({ order: -1 });
      lessonOrder = highest ? highest.order + 1 : 1;
    }

    const lesson = await Lesson.create({
      courseId,
      moduleId,
      title: String(title).trim(),
      description: description || '',
      contentType: contentType || 'TEXT',
      contentUrl: contentUrl || '',
      textContent: textContent || '',
      duration: Number(duration) || 5,
      order: lessonOrder,
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

// @route   PUT /api/courses/:id/lessons/:lessonId
// @desc    Update a lesson
// @access  Private (Super Admin, Company Admin)
const updateLesson = async (req, res, next) => {
  try {
    const { id: courseId, lessonId } = req.params;
    const {
      title,
      description,
      contentType,
      contentUrl,
      textContent,
      duration,
      order,
      isRequired,
      moduleId
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this course' });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: 'Lesson title cannot be empty' });
      }
      lesson.title = String(title).trim();
    }
    if (description !== undefined) lesson.description = String(description).trim();
    if (contentType !== undefined) lesson.contentType = contentType;
    if (contentUrl !== undefined) lesson.contentUrl = String(contentUrl).trim();
    if (textContent !== undefined) lesson.textContent = textContent;
    if (duration !== undefined) lesson.duration = Number(duration) || 5;
    if (order !== undefined) lesson.order = Number(order) || lesson.order;
    if (isRequired !== undefined) lesson.isRequired = Boolean(isRequired);

    if (moduleId !== undefined && moduleId !== lesson.moduleId.toString()) {
      const targetMod = await Module.findOne({ _id: moduleId, courseId });
      if (targetMod) {
        lesson.moduleId = targetMod._id;
      }
    }

    await lesson.save();

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/courses/:id/lessons/:lessonId
// @desc    Delete a lesson
// @access  Private (Super Admin, Company Admin)
const deleteLesson = async (req, res, next) => {
  try {
    const { id: courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this course' });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    await Lesson.deleteOne({ _id: lesson._id });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
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
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson
};

const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/course.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getCourses);
router.get('/:id', getCourseById);

router.post(
  '/',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  createCourse
);

router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  updateCourse
);

router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  deleteCourse
);

// Module routes
router.post(
  '/:id/modules',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  addModule
);

router.put(
  '/:id/modules/:moduleId',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  updateModule
);

router.delete(
  '/:id/modules/:moduleId',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  deleteModule
);

// Lesson routes
router.post(
  '/:id/lessons',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  addLesson
);

router.put(
  '/:id/lessons/:lessonId',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  updateLesson
);

router.delete(
  '/:id/lessons/:lessonId',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  deleteLesson
);

module.exports = router;

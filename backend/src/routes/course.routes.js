const express = require('express');
const router = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  addLesson
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

router.post(
  '/:id/modules',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  addModule
);

router.post(
  '/:id/lessons',
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  addLesson
);

module.exports = router;

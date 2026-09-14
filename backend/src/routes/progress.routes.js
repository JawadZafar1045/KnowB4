const express = require('express');
const router = express.Router();
const { updateLessonProgress, getCourseProgress } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/lesson/:lessonId', updateLessonProgress);
router.get('/course/:courseId', getCourseProgress);

module.exports = router;

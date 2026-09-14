const express = require('express');
const router = express.Router();
const { getQuizByCourse, submitQuizAttempt } = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/course/:courseId', getQuizByCourse);
router.post('/:quizId/submit', submitQuizAttempt);

module.exports = router;

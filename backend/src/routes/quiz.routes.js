const express = require('express');
const router = express.Router();
const { getQuizByCourse, submitQuizAttempt } = require('../controllers/quiz.controller');
const { listQuizzes, importQuiz, deleteQuiz } = require('../controllers/quizAdmin.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Learner side (unchanged)
router.get('/course/:courseId', getQuizByCourse);
router.post('/:quizId/submit', submitQuizAttempt);

// Super Admin: Quiz Library (role is checked inside the controller)
router.get('/', listQuizzes);
router.post('/import', importQuiz);
router.delete('/:quizId', deleteQuiz);

module.exports = router;
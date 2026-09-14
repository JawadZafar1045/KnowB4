const express = require('express');
const router = express.Router();
const { login, registerCompany, refreshToken, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register-company', registerCompany);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;

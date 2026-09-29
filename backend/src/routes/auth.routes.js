const express = require('express');
const router = express.Router();
const { login, registerCompany, refreshToken, getMe, logout, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register-company', registerCompany);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

module.exports = router;


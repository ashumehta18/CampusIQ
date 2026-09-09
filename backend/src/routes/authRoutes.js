const express = require('express');
const router = express.Router();

const { register, login, getMe, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate-limited public routes
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.put('/change-password', authenticateUser, changePassword);

module.exports = router;

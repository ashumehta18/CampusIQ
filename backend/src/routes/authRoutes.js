const express = require('express');
const router = express.Router();

const { register, login, getMe, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.put('/change-password', authenticateUser, changePassword);

module.exports = router;

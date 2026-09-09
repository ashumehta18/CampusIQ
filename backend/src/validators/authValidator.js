const { body } = require('express-validator');

const registerValidator = [
  // Accept either 'fullName' or 'name' and normalize it
  body('name')
    .custom((value, { req }) => {
      const name = value || req.body.fullName;
      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error('Name is required');
      }
      // Ensure req.body.name is set for downstream controller usage
      req.body.name = name.trim();
      return true;
    }),

  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
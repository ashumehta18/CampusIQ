const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

// Middleware to check express-validator results and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return errorResponse(res, 400, messages);
  }
  next();
};

module.exports = validate;

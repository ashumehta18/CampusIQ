const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');

/**
 * Validates that req.params.id is a valid MongoDB ObjectId.
 * Prevents Mongoose CastError from reaching the error handler with a clear message.
 *
 * Usage: router.get('/:id', validateObjectId, controller)
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return errorResponse(res, 400, `Invalid ID format: ${req.params.id}`);
  }
  next();
};

module.exports = validateObjectId;

// Centralized error response helper
const errorResponse = (res, statusCode, message, error = null) => {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

// Centralized success response helper
const successResponse = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

module.exports = { errorResponse, successResponse };

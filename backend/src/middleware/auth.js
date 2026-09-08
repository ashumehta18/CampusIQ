const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

// Verifies JWT and attaches user to req.user
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }
    if (!user.isActive) {
      return errorResponse(res, 401, 'Account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Restricts access to specific roles
// Usage: authorizeRoles('admin', 'faculty')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized for this action`
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };

const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/admin/users
 * List all users with optional role filter.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users fetched', users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User fetched', user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 * Admin can update name, email, isActive. Cannot change role or password here.
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User updated', user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Soft delete — sets isActive to false on both User and their profile.
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return errorResponse(res, 404, 'User not found');

    // Also deactivate the profile document
    if (user.role === 'student') {
      await Student.findOneAndUpdate({ user: user._id }, { isActive: false });
    } else if (user.role === 'faculty') {
      await Faculty.findOneAndUpdate({ user: user._id }, { isActive: false });
    }

    return successResponse(res, 200, 'User deactivated', user);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Quick system-wide counts for the admin dashboard.
 */
const getSystemStats = async (req, res, next) => {
  try {
    const [totalStudents, totalFaculty, totalAdmins, activeStudents, activeFaculty] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        User.countDocuments({ role: 'admin' }),
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
      ]);

    return successResponse(res, 200, 'Stats fetched', {
      totalStudents,
      totalFaculty,
      totalAdmins,
      activeStudents,
      activeFaculty,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, getSystemStats };

const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
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

/**
 * GET /api/admin/analytics
 * Richer stats for the admin dashboard — departments, subjects, enrollments.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalDepartments,
      totalSubjects,
      totalEnrollments,
      totalAttendanceRecords,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      Department.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Enrollment.countDocuments({ isActive: true }),
      Attendance.countDocuments(),
    ]);

    // Students per department
    const studentsByDept = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmpty: true } },
      { $project: { name: '$department.name', code: '$department.code', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    return successResponse(res, 200, 'Analytics fetched', {
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalDepartments,
      totalSubjects,
      totalEnrollments,
      totalAttendanceRecords,
      studentsByDept,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, getSystemStats, getAnalytics };

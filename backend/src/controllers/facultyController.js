const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/faculty/profile
 * Faculty views their own profile.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id })
      .populate('user', 'name email profilePicture createdAt')
      .populate('department', 'name code');

    if (!faculty) {
      return errorResponse(res, 404, 'Faculty profile not found. Contact admin.');
    }

    return successResponse(res, 200, 'Profile fetched', faculty);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/faculty/profile
 * Faculty updates their own editable fields.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, designation, specialization } = req.body;

    const faculty = await Faculty.findOneAndUpdate(
      { user: req.user._id },
      { phone, designation, specialization },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email profilePicture')
      .populate('department', 'name code');

    if (!faculty) {
      return errorResponse(res, 404, 'Faculty profile not found');
    }

    return successResponse(res, 200, 'Profile updated', faculty);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/faculty
 * Admin: get all faculty members.
 */
const getAllFaculty = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;

    const facultyList = await Faculty.find(filter)
      .populate('user', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Faculty fetched', facultyList);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/faculty/:id
 * Admin: get a single faculty member.
 */
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'name email profilePicture createdAt')
      .populate('department', 'name code');

    if (!faculty) {
      return errorResponse(res, 404, 'Faculty not found');
    }

    return successResponse(res, 200, 'Faculty fetched', faculty);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/faculty
 * Admin: create a faculty profile for an existing user.
 */
const createFacultyProfile = async (req, res, next) => {
  try {
    const { userId, employeeId, department, designation, specialization, phone } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'faculty') {
      return errorResponse(res, 400, 'User not found or is not a faculty member');
    }

    const existing = await Faculty.findOne({ user: userId });
    if (existing) {
      return errorResponse(res, 409, 'Faculty profile already exists for this user');
    }

    const faculty = await Faculty.create({
      user: userId,
      employeeId,
      department,
      designation,
      specialization,
      phone,
    });

    const populated = await faculty.populate([
      { path: 'user', select: 'name email' },
      { path: 'department', select: 'name code' },
    ]);

    return successResponse(res, 201, 'Faculty profile created', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/faculty/:id
 * Admin: update any faculty member's profile.
 */
const updateFacultyById = async (req, res, next) => {
  try {
    const { department, designation, specialization, phone, isActive } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { department, designation, specialization, phone, isActive },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('department', 'name code');

    if (!faculty) {
      return errorResponse(res, 404, 'Faculty not found');
    }

    return successResponse(res, 200, 'Faculty updated', faculty);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllFaculty,
  getFacultyById,
  createFacultyProfile,
  updateFacultyById,
};

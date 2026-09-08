const Student = require('../models/Student');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/students/profile
 * Student views their own profile.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email profilePicture createdAt')
      .populate('department', 'name code');

    if (!student) {
      return errorResponse(res, 404, 'Student profile not found. Contact admin.');
    }

    return successResponse(res, 200, 'Profile fetched', student);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/profile
 * Student updates their own editable fields.
 * They cannot change enrollmentNumber, department, semester, or batch — admin does that.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, address, dateOfBirth, gender } = req.body;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { phone, address, dateOfBirth, gender },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email profilePicture')
      .populate('department', 'name code');

    if (!student) {
      return errorResponse(res, 404, 'Student profile not found');
    }

    return successResponse(res, 200, 'Profile updated', student);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students
 * Admin/Faculty: get all students with optional filters.
 * Query params: department, semester, batch
 */
const getAllStudents = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.batch) filter.batch = req.query.batch;

    const students = await Student.find(filter)
      .populate('user', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Students fetched', students);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Admin/Faculty: get a single student by Student document ID.
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email profilePicture createdAt')
      .populate('department', 'name code');

    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    return successResponse(res, 200, 'Student fetched', student);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students
 * Admin: create a student profile for an existing user.
 * The user account must already exist (created via /api/auth/register).
 */
const createStudentProfile = async (req, res, next) => {
  try {
    const { userId, enrollmentNumber, department, semester, batch, phone, gender } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return errorResponse(res, 400, 'User not found or is not a student');
    }

    const existing = await Student.findOne({ user: userId });
    if (existing) {
      return errorResponse(res, 409, 'Student profile already exists for this user');
    }

    const student = await Student.create({
      user: userId,
      enrollmentNumber,
      department,
      semester,
      batch,
      phone,
      gender,
    });

    const populated = await student.populate([
      { path: 'user', select: 'name email' },
      { path: 'department', select: 'name code' },
    ]);

    return successResponse(res, 201, 'Student profile created', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/:id
 * Admin: update any student's academic fields.
 */
const updateStudentById = async (req, res, next) => {
  try {
    const { department, semester, batch, phone, address, gender, isActive } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { department, semester, batch, phone, address, gender, isActive },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('department', 'name code');

    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    return successResponse(res, 200, 'Student updated', student);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  createStudentProfile,
  updateStudentById,
};

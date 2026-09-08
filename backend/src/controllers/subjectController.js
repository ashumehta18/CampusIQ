const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/subjects
 * All roles. Supports query filters: department, semester, faculty.
 */
const getAllSubjects = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.faculty) filter.faculty = req.query.faculty;

    const subjects = await Subject.find(filter)
      .populate('department', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } })
      .sort({ semester: 1, name: 1 });

    return successResponse(res, 200, 'Subjects fetched', subjects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subjects/my
 * Faculty: get only subjects assigned to the logged-in faculty member.
 */
const getMySubjects = async (req, res, next) => {
  try {
    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) {
      return errorResponse(res, 404, 'Faculty profile not found');
    }

    const subjects = await Subject.find({ faculty: facultyProfile._id, isActive: true })
      .populate('department', 'name code')
      .sort({ semester: 1, name: 1 });

    return successResponse(res, 200, 'My subjects fetched', subjects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subjects/:id
 */
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } });

    if (!subject) return errorResponse(res, 404, 'Subject not found');
    return successResponse(res, 200, 'Subject fetched', subject);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/subjects
 * Admin only.
 */
const createSubject = async (req, res, next) => {
  try {
    const { name, code, department, faculty, semester, credits, description } = req.body;

    if (!name || !code || !department || !semester) {
      return errorResponse(res, 400, 'Name, code, department, and semester are required');
    }

    const subject = await Subject.create({
      name, code, department, faculty: faculty || null, semester, credits, description,
    });

    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } });

    return successResponse(res, 201, 'Subject created', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/subjects/:id
 * Admin only.
 */
const updateSubject = async (req, res, next) => {
  try {
    const { name, code, department, faculty, semester, credits, description, isActive } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, code, department, faculty: faculty || null, semester, credits, description, isActive },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } });

    if (!subject) return errorResponse(res, 404, 'Subject not found');
    return successResponse(res, 200, 'Subject updated', subject);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubjects,
  getMySubjects,
  getSubjectById,
  createSubject,
  updateSubject,
};

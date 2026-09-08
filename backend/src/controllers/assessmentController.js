const Assessment = require('../models/Assessment');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/assessments
 * All roles. Required query: subjectId
 */
const getAssessments = async (req, res, next) => {
  try {
    const { subjectId, type } = req.query;
    if (!subjectId) return errorResponse(res, 400, 'subjectId query param is required');

    const filter = { subject: subjectId };
    if (type) filter.type = type;

    const assessments = await Assessment.find(filter)
      .populate('faculty', 'employeeId')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    return successResponse(res, 200, 'Assessments fetched', assessments);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assessments/:id
 */
const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .populate('subject', 'name code');

    if (!assessment) return errorResponse(res, 404, 'Assessment not found');
    return successResponse(res, 200, 'Assessment fetched', assessment);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assessments
 * Faculty only: create an assessment for one of their subjects.
 */
const createAssessment = async (req, res, next) => {
  try {
    const { subjectId, title, type, maxMarks, weightage, date, description } = req.body;

    if (!subjectId || !title || !type || !maxMarks || !date) {
      return errorResponse(res, 400, 'subjectId, title, type, maxMarks, and date are required');
    }

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assessment = await Assessment.create({
      subject: subjectId,
      faculty: facultyProfile._id,
      title,
      type,
      maxMarks,
      weightage: weightage || 0,
      date,
      description: description || '',
    });

    const populated = await Assessment.findById(assessment._id)
      .populate('subject', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });

    return successResponse(res, 201, 'Assessment created', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/assessments/:id
 * Faculty only: update their own assessment.
 */
const updateAssessment = async (req, res, next) => {
  try {
    const { title, type, maxMarks, weightage, date, description } = req.body;

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assessment = await Assessment.findOne({
      _id: req.params.id,
      faculty: facultyProfile._id,
    });
    if (!assessment) return errorResponse(res, 404, 'Assessment not found or not yours');

    Object.assign(assessment, { title, type, maxMarks, weightage, date, description });
    await assessment.save();

    return successResponse(res, 200, 'Assessment updated', assessment);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/assessments/:id
 * Faculty only: delete an assessment (and its marks — handled in controller).
 */
const deleteAssessment = async (req, res, next) => {
  try {
    const Mark = require('../models/Mark');
    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      faculty: facultyProfile._id,
    });
    if (!assessment) return errorResponse(res, 404, 'Assessment not found or not yours');

    // Remove all marks for this assessment
    await Mark.deleteMany({ assessment: req.params.id });

    return successResponse(res, 200, 'Assessment deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
};

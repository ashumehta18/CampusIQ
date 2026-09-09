const Mark = require('../models/Mark');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/marks/bulk
 * Faculty: enter or update marks for all students in one assessment.
 * Body: { assessmentId, marks: [{ studentId, marksObtained, remarks }] }
 *
 * Uses bulkWrite with upsert — same pattern as attendance.
 * Validates each mark against assessment.maxMarks before writing.
 */
const enterBulkMarks = async (req, res, next) => {
  try {
    const { assessmentId, marks } = req.body;

    if (!assessmentId || !Array.isArray(marks) || marks.length === 0) {
      return errorResponse(res, 400, 'assessmentId and marks array are required');
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return errorResponse(res, 404, 'Assessment not found');

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    if (String(assessment.faculty) !== String(facultyProfile._id)) {
      return errorResponse(res, 403, 'You are not assigned to this assessment');
    }

    // Validate all marks before writing anything
    for (const m of marks) {
      if (m.marksObtained < 0) {
        return errorResponse(res, 400, 'Marks cannot be negative');
      }
      if (m.marksObtained > assessment.maxMarks) {
        return errorResponse(
          res,
          400,
          `Marks ${m.marksObtained} exceed maximum marks ${assessment.maxMarks}`
        );
      }
    }

    const studentIds = marks.map((mark) => mark.studentId);
    const enrolledStudents = await Enrollment.countDocuments({
      subject: assessment.subject,
      student: { $in: studentIds },
      isActive: true,
    });
    if (enrolledStudents !== new Set(studentIds.map(String)).size) {
      return errorResponse(res, 400, 'Marks can only be entered for enrolled students');
    }

    const bulkOps = marks.map((m) => ({
      updateOne: {
        filter: { student: m.studentId, assessment: assessmentId },
        update: {
          $set: {
            student: m.studentId,
            assessment: assessmentId,
            marksObtained: m.marksObtained,
            remarks: m.remarks || '',
            gradedBy: facultyProfile._id,
          },
        },
        upsert: true,
      },
    }));

    await Mark.bulkWrite(bulkOps);

    return successResponse(res, 200, `Marks saved for ${marks.length} students`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/marks
 * Faculty/Admin: get marks for a specific assessment.
 * Required query: assessmentId
 */
const getMarksByAssessment = async (req, res, next) => {
  try {
    const { assessmentId } = req.query;
    if (!assessmentId) return errorResponse(res, 400, 'assessmentId query param is required');

    const marks = await Mark.find({ assessment: assessmentId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('assessment', 'title maxMarks type')
      .sort({ marksObtained: -1 });

    return successResponse(res, 200, 'Marks fetched', marks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/marks/my
 * Student: get all their own marks.
 * Optional query: subjectId
 */
const getMyMarks = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    let assessmentFilter = {};
    if (req.query.subjectId) {
      assessmentFilter.subject = req.query.subjectId;
    }

    // Find assessments matching the filter, then find marks for those assessments
    const assessments = await Assessment.find(assessmentFilter).select('_id');
    const assessmentIds = assessments.map((a) => a._id);

    const marks = await Mark.find({
      student: student._id,
      assessment: { $in: assessmentIds },
    })
      .populate({
        path: 'assessment',
        select: 'title type maxMarks date weightage',
        populate: { path: 'subject', select: 'name code' },
      })
      .sort({ 'assessment.date': -1 });

    return successResponse(res, 200, 'Marks fetched', marks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/marks/summary
 * Student: average marks percentage per enrolled subject.
 * Used in dashboard and academic alerts.
 */
const getMarksSummary = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    const enrollments = await Enrollment.find({ student: student._id, isActive: true })
      .populate('subject', 'name code');

    const summary = await Promise.all(
      enrollments.map(async (en) => {
        const assessments = await Assessment.find({ subject: en.subject._id });
        if (assessments.length === 0) {
          return { subject: en.subject, totalAssessments: 0, attempted: 0, averagePercentage: null };
        }

        const assessmentIds = assessments.map((a) => a._id);
        const marks = await Mark.find({
          student: student._id,
          assessment: { $in: assessmentIds },
        }).populate('assessment', 'maxMarks');

        if (marks.length === 0) {
          return {
            subject: en.subject,
            totalAssessments: assessments.length,
            attempted: 0,
            averagePercentage: null,
          };
        }

        const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = marks.reduce((sum, m) => sum + m.assessment.maxMarks, 0);
        const averagePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

        return {
          subject: en.subject,
          totalAssessments: assessments.length,
          attempted: marks.length,
          averagePercentage,
          // Rule-based performance alert
          alert:
            averagePercentage !== null && averagePercentage < 40
              ? { type: 'PERFORMANCE_ALERT', severity: 'HIGH' }
              : averagePercentage !== null && averagePercentage < 60
              ? { type: 'PERFORMANCE_ALERT', severity: 'MEDIUM' }
              : null,
        };
      })
    );

    return successResponse(res, 200, 'Marks summary fetched', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/marks/:id
 * Faculty: update a single mark record.
 */
const updateMark = async (req, res, next) => {
  try {
    const { marksObtained, remarks } = req.body;

    const mark = await Mark.findById(req.params.id).populate('assessment', 'maxMarks');
    if (!mark) return errorResponse(res, 404, 'Mark not found');

    if (marksObtained !== undefined) {
      if (marksObtained < 0) return errorResponse(res, 400, 'Marks cannot be negative');
      if (marksObtained > mark.assessment.maxMarks) {
        return errorResponse(res, 400, `Marks exceed maximum of ${mark.assessment.maxMarks}`);
      }
      mark.marksObtained = marksObtained;
    }
    if (remarks !== undefined) mark.remarks = remarks;

    await mark.save();
    return successResponse(res, 200, 'Mark updated', mark);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/marks/subject-summary/:subjectId
 * Faculty/Admin: performance summary for all students in a subject.
 */
const getSubjectMarksSummary = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const assessments = await Assessment.find({ subject: subjectId });
    if (assessments.length === 0) {
      return successResponse(res, 200, 'No assessments found', []);
    }

    const enrollments = await Enrollment.find({ subject: subjectId, isActive: true })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    const assessmentIds = assessments.map((a) => a._id);

    const summary = await Promise.all(
      enrollments.map(async (en) => {
        const marks = await Mark.find({
          student: en.student._id,
          assessment: { $in: assessmentIds },
        }).populate('assessment', 'maxMarks title type');

        const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = marks.reduce((sum, m) => sum + m.assessment.maxMarks, 0);
        const averagePercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

        return {
          student: en.student,
          attempted: marks.length,
          totalAssessments: assessments.length,
          averagePercentage,
          marks,
          needsAttention: averagePercentage !== null && averagePercentage < 60,
        };
      })
    );

    return successResponse(res, 200, 'Subject marks summary fetched', summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enterBulkMarks,
  getMarksByAssessment,
  getMyMarks,
  getMarksSummary,
  updateMark,
  getSubjectMarksSummary,
};

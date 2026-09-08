const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/submissions
 * Student: submit an assignment.
 * Checks deadline to set isLate flag automatically.
 * Prevents duplicate submissions (compound unique index handles it too).
 */
const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, submissionUrl } = req.body;

    if (!assignmentId) return errorResponse(res, 400, 'assignmentId is required');

    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isActive) {
      return errorResponse(res, 404, 'Assignment not found');
    }

    // Check for existing submission
    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: student._id,
    });
    if (existing) {
      return errorResponse(res, 409, 'You have already submitted this assignment. Use update instead.');
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const submission = await Submission.create({
      assignment: assignmentId,
      student: student._id,
      submissionUrl: submissionUrl || '',
      submittedAt: new Date(),
      isLate,
    });

    const populated = await Submission.findById(submission._id)
      .populate('assignment', 'title deadline maxMarks')
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

    return successResponse(res, 201, isLate ? 'Submitted (late)' : 'Submitted successfully', populated);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, 'You have already submitted this assignment');
    }
    next(error);
  }
};

/**
 * GET /api/submissions/my
 * Student: get all their own submissions.
 */
const getMySubmissions = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    const submissions = await Submission.find({ student: student._id })
      .populate({
        path: 'assignment',
        select: 'title deadline maxMarks description',
        populate: { path: 'subject', select: 'name code' },
      })
      .sort({ submittedAt: -1 });

    return successResponse(res, 200, 'Submissions fetched', submissions);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions
 * Faculty: get all submissions for a specific assignment.
 * Required query: assignmentId
 */
const getSubmissionsByAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.query;
    if (!assignmentId) return errorResponse(res, 400, 'assignmentId query param is required');

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('assignment', 'title maxMarks deadline')
      .sort({ submittedAt: 1 });

    return successResponse(res, 200, 'Submissions fetched', submissions);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/submissions/:id/grade
 * Faculty: grade a submission — set marksAwarded, feedback, status.
 */
const gradeSubmission = async (req, res, next) => {
  try {
    const { marksAwarded, feedback, status } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'maxMarks title')
      .populate({ path: 'student', populate: { path: 'user', select: '_id name' } });

    if (!submission) return errorResponse(res, 404, 'Submission not found');

    if (marksAwarded !== undefined) {
      if (marksAwarded < 0) return errorResponse(res, 400, 'Marks cannot be negative');
      if (marksAwarded > submission.assignment.maxMarks) {
        return errorResponse(res, 400, `Marks exceed maximum of ${submission.assignment.maxMarks}`);
      }
      submission.marksAwarded = marksAwarded;
    }
    if (feedback !== undefined) submission.feedback = feedback;
    if (status) submission.status = status;

    await submission.save();

    // Notify student that their submission was graded
    if (status === 'graded') {
      Notification.create({
        recipient: submission.student.user._id,
        title: 'Assignment Graded',
        message: `Your submission for "${submission.assignment.title}" has been graded. Marks: ${marksAwarded ?? 'N/A'}`,
        type: 'marks',
        relatedId: submission._id,
      }).catch(() => {});
    }

    return successResponse(res, 200, 'Submission graded', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/submissions/:id
 * Student: update their own submission (before deadline or if returned).
 */
const updateSubmission = async (req, res, next) => {
  try {
    const { submissionUrl } = req.body;

    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    const submission = await Submission.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate('assignment', 'deadline');

    if (!submission) return errorResponse(res, 404, 'Submission not found');
    if (submission.status === 'graded') {
      return errorResponse(res, 400, 'Cannot update a graded submission');
    }

    submission.submissionUrl = submissionUrl || submission.submissionUrl;
    submission.submittedAt = new Date();
    submission.isLate = new Date() > new Date(submission.assignment.deadline);
    await submission.save();

    return successResponse(res, 200, 'Submission updated', submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAssignment,
  getMySubmissions,
  getSubmissionsByAssignment,
  gradeSubmission,
  updateSubmission,
};

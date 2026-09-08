const Assignment = require('../models/Assignment');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/assignments
 * Faculty: their own assignments filtered by subject.
 * Student: assignments for their enrolled subjects.
 * Query: subjectId (optional for faculty, used internally for student)
 */
const getAssignments = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isActive: true };

    if (role === 'faculty') {
      const facultyProfile = await Faculty.findOne({ user: userId });
      if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');
      filter.faculty = facultyProfile._id;
      if (req.query.subjectId) filter.subject = req.query.subjectId;
    } else if (role === 'student') {
      // Get all subjects the student is enrolled in
      const student = await Student.findOne({ user: userId });
      if (!student) return errorResponse(res, 404, 'Student profile not found');
      const enrollments = await Enrollment.find({ student: student._id, isActive: true });
      const subjectIds = enrollments.map((e) => e.subject);
      filter.subject = { $in: subjectIds };
    } else {
      // Admin: optional subject filter
      if (req.query.subjectId) filter.subject = req.query.subjectId;
    }

    const assignments = await Assignment.find(filter)
      .populate('subject', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ deadline: 1 }); // soonest deadline first

    return successResponse(res, 200, 'Assignments fetched', assignments);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments/:id
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });

    if (!assignment) return errorResponse(res, 404, 'Assignment not found');
    return successResponse(res, 200, 'Assignment fetched', assignment);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assignments
 * Faculty only.
 * After creating, notifies all enrolled students in that subject.
 */
const createAssignment = async (req, res, next) => {
  try {
    const { subjectId, title, description, deadline, maxMarks } = req.body;

    if (!subjectId || !title || !deadline) {
      return errorResponse(res, 400, 'subjectId, title, and deadline are required');
    }

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assignment = await Assignment.create({
      subject: subjectId,
      faculty: facultyProfile._id,
      title,
      description: description || '',
      deadline,
      maxMarks: maxMarks || 10,
    });

    // Notify all enrolled students — fire and forget (don't block response)
    notifyEnrolledStudents(subjectId, assignment).catch(() => {});

    const populated = await Assignment.findById(assignment._id)
      .populate('subject', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });

    return successResponse(res, 201, 'Assignment created', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates in-app notifications for all students enrolled in a subject.
 * Called after assignment creation — runs asynchronously.
 */
const notifyEnrolledStudents = async (subjectId, assignment) => {
  const enrollments = await Enrollment.find({ subject: subjectId, isActive: true })
    .populate({ path: 'student', populate: { path: 'user', select: '_id' } });

  const notifications = enrollments.map((en) => ({
    recipient: en.student.user._id,
    title: 'New Assignment',
    message: `New assignment posted: "${assignment.title}". Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`,
    type: 'assignment',
    relatedId: assignment._id,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

/**
 * PUT /api/assignments/:id
 * Faculty: update their own assignment.
 */
const updateAssignment = async (req, res, next) => {
  try {
    const { title, description, deadline, maxMarks, isActive } = req.body;

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, faculty: facultyProfile._id },
      { title, description, deadline, maxMarks, isActive },
      { new: true, runValidators: true }
    ).populate('subject', 'name code');

    if (!assignment) return errorResponse(res, 404, 'Assignment not found or not yours');
    return successResponse(res, 200, 'Assignment updated', assignment);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/assignments/:id
 * Faculty: soft delete (sets isActive false).
 */
const deleteAssignment = async (req, res, next) => {
  try {
    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, faculty: facultyProfile._id },
      { isActive: false },
      { new: true }
    );

    if (!assignment) return errorResponse(res, 404, 'Assignment not found or not yours');
    return successResponse(res, 200, 'Assignment deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};

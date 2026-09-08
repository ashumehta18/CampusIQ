const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/enrollments
 * Admin: all enrollments (filterable).
 * Student: their own enrollments (subjects they are enrolled in).
 * Faculty: enrollments for their subjects.
 */
const getEnrollments = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { isActive: true };

    if (role === 'student') {
      const student = await Student.findOne({ user: userId });
      if (!student) return errorResponse(res, 404, 'Student profile not found');
      filter.student = student._id;
    } else if (role === 'faculty') {
      // Find subjects taught by this faculty, then find enrollments for those subjects
      const facultyProfile = await Faculty.findOne({ user: userId });
      if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');
      const subjects = await Subject.find({ faculty: facultyProfile._id }).select('_id');
      filter.subject = { $in: subjects.map((s) => s._id) };
    } else {
      // Admin: support optional filters
      if (req.query.student) filter.student = req.query.student;
      if (req.query.subject) filter.subject = req.query.subject;
      if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    }

    const enrollments = await Enrollment.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate({
        path: 'subject',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'faculty', populate: { path: 'user', select: 'name' } },
        ],
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Enrollments fetched', enrollments);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/enrollments
 * Admin only: enroll a student in a subject.
 */
const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, subjectId, academicYear } = req.body;

    if (!studentId || !subjectId || !academicYear) {
      return errorResponse(res, 400, 'studentId, subjectId, and academicYear are required');
    }

    const [student, subject] = await Promise.all([
      Student.findById(studentId),
      Subject.findById(subjectId),
    ]);

    if (!student) return errorResponse(res, 404, 'Student not found');
    if (!subject) return errorResponse(res, 404, 'Subject not found');

    const enrollment = await Enrollment.create({
      student: studentId,
      subject: subjectId,
      academicYear,
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'subject', select: 'name code semester' });

    return successResponse(res, 201, 'Enrollment created', populated);
  } catch (error) {
    // Compound unique index violation
    if (error.code === 11000) {
      return errorResponse(res, 409, 'Student is already enrolled in this subject for this academic year');
    }
    next(error);
  }
};

/**
 * DELETE /api/enrollments/:id
 * Admin only: soft delete (deactivate) an enrollment.
 */
const deactivateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!enrollment) return errorResponse(res, 404, 'Enrollment not found');
    return successResponse(res, 200, 'Enrollment removed', enrollment);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/enrollments/subject/:subjectId
 * Faculty/Admin: get all students enrolled in a specific subject.
 * Used heavily in attendance marking.
 */
const getStudentsBySubject = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      subject: req.params.subjectId,
      isActive: true,
    }).populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    return successResponse(res, 200, 'Students fetched', enrollments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnrollments,
  createEnrollment,
  deactivateEnrollment,
  getStudentsBySubject,
};

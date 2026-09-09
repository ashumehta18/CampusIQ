const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const Subject = require('../models/Subject');
const { successResponse, errorResponse } = require('../utils/response');

const VALID_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

/**
 * POST /api/attendance/bulk
 * Faculty marks attendance for an entire class session.
 * Body: { subjectId, date, records: [{ studentId, status, remarks }] }
 *
 * Uses bulkWrite with upsert so re-submitting the same date updates existing records
 * instead of throwing a duplicate key error.
 */
const markBulkAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, records } = req.body;

    if (!subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return errorResponse(res, 400, 'subjectId, date, and records array are required');
    }

    const facultyProfile = await Faculty.findOne({ user: req.user._id });
    if (!facultyProfile) return errorResponse(res, 404, 'Faculty profile not found');

    const subject = await Subject.findOne({ _id: subjectId, faculty: facultyProfile._id, isActive: true });
    if (!subject) return errorResponse(res, 403, 'You are not assigned to this subject');

    // Validate all statuses before writing anything
    for (const r of records) {
      if (!VALID_STATUSES.includes(r.status)) {
        return errorResponse(res, 400, `Invalid status "${r.status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
      }
    }

    const studentIds = records.map((record) => record.studentId);
    const enrolledStudents = await Enrollment.countDocuments({
      subject: subjectId,
      student: { $in: studentIds },
      isActive: true,
    });
    if (enrolledStudents !== new Set(studentIds.map(String)).size) {
      return errorResponse(res, 400, 'Attendance can only be marked for enrolled students');
    }

    const attendanceDate = new Date(date);
    // Normalize to midnight so date comparisons work correctly
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { student: r.studentId, subject: subjectId, date: attendanceDate },
        update: {
          $set: {
            student: r.studentId,
            subject: subjectId,
            faculty: facultyProfile._id,
            date: attendanceDate,
            status: r.status,
            remarks: r.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    return successResponse(res, 200, `Attendance marked for ${records.length} students`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance
 * Faculty/Admin: get attendance records.
 * Required query: subjectId
 * Optional query: date (returns single session), studentId
 */
const getAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, studentId } = req.query;

    if (!subjectId) return errorResponse(res, 400, 'subjectId query param is required');

    const filter = { subject: subjectId };
    if (studentId) filter.student = studentId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: d, $lt: nextDay };
    }

    const records = await Attendance.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject', 'name code')
      .sort({ date: -1 });

    return successResponse(res, 200, 'Attendance fetched', records);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/my
 * Student: get their own attendance records.
 * Optional query: subjectId
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    const filter = { student: student._id };
    if (req.query.subjectId) filter.subject = req.query.subjectId;

    const records = await Attendance.find(filter)
      .populate('subject', 'name code')
      .sort({ date: -1 });

    return successResponse(res, 200, 'Attendance fetched', records);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/summary
 * Student: attendance percentage per enrolled subject.
 * Derives percentages from records — never stores them.
 *
 * Logic: present + late count as attended. excused and absent do not.
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, 'Student profile not found');

    // Get all active enrollments for this student
    const enrollments = await Enrollment.find({ student: student._id, isActive: true })
      .populate('subject', 'name code');

    const summary = await Promise.all(
      enrollments.map(async (en) => {
        const total = await Attendance.countDocuments({
          student: student._id,
          subject: en.subject._id,
        });
        const attended = await Attendance.countDocuments({
          student: student._id,
          subject: en.subject._id,
          status: { $in: ['PRESENT', 'LATE'] },
        });

        const percentage = total > 0 ? Math.round((attended / total) * 100) : null;

        return {
          subject: en.subject,
          total,
          attended,
          percentage,
          // Rule-based alert — clearly labeled, not ML
          alert: percentage !== null && percentage < 75
            ? { type: 'ATTENDANCE_ALERT', severity: percentage < 60 ? 'HIGH' : 'MEDIUM' }
            : null,
        };
      })
    );

    return successResponse(res, 200, 'Attendance summary fetched', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/subject-summary/:subjectId
 * Faculty/Admin: attendance summary for all students in a subject.
 */
const getSubjectAttendanceSummary = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const enrollments = await Enrollment.find({ subject: subjectId, isActive: true })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    const summary = await Promise.all(
      enrollments.map(async (en) => {
        const total = await Attendance.countDocuments({
          student: en.student._id,
          subject: subjectId,
        });
        const attended = await Attendance.countDocuments({
          student: en.student._id,
          subject: subjectId,
          status: { $in: ['PRESENT', 'LATE'] },
        });

        const percentage = total > 0 ? Math.round((attended / total) * 100) : null;

        return {
          student: en.student,
          total,
          attended,
          percentage,
          needsAttention: percentage !== null && percentage < 75,
        };
      })
    );

    return successResponse(res, 200, 'Subject attendance summary fetched', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/attendance/:id
 * Faculty: correct a single attendance record.
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true, runValidators: true }
    ).populate({ path: 'student', populate: { path: 'user', select: 'name' } });

    if (!record) return errorResponse(res, 404, 'Attendance record not found');
    return successResponse(res, 200, 'Attendance updated', record);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/dates/:subjectId
 * Faculty: get all distinct dates attendance was marked for a subject.
 * Used to populate the date picker on the attendance page.
 */
const getAttendanceDates = async (req, res, next) => {
  try {
    const dates = await Attendance.distinct('date', { subject: req.params.subjectId });
    const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
    return successResponse(res, 200, 'Dates fetched', sorted);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markBulkAttendance,
  getAttendance,
  getMyAttendance,
  getAttendanceSummary,
  getSubjectAttendanceSummary,
  updateAttendance,
  getAttendanceDates,
};

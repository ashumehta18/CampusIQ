const { body, query, param } = require('express-validator');

// ─── Student ────────────────────────────────────────────────────────────────

const createStudentValidator = [
  body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid userId'),
  body('enrollmentNumber').trim().notEmpty().withMessage('Enrollment number is required'),
  body('department').notEmpty().isMongoId().withMessage('Valid department ID is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('batch').trim().notEmpty().withMessage('Batch is required'),
];

// ─── Faculty ────────────────────────────────────────────────────────────────

const createFacultyValidator = [
  body('userId').notEmpty().isMongoId().withMessage('Valid userId is required'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('department').notEmpty().isMongoId().withMessage('Valid department ID is required'),
];

// ─── Department ─────────────────────────────────────────────────────────────

const departmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
];

// ─── Subject ────────────────────────────────────────────────────────────────

const subjectValidator = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('department').notEmpty().isMongoId().withMessage('Valid department ID is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
];

// ─── Enrollment ─────────────────────────────────────────────────────────────

const enrollmentValidator = [
  body('studentId').notEmpty().isMongoId().withMessage('Valid studentId is required'),
  body('subjectId').notEmpty().isMongoId().withMessage('Valid subjectId is required'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
];

// ─── Attendance ──────────────────────────────────────────────────────────────

const bulkAttendanceValidator = [
  body('subjectId').notEmpty().isMongoId().withMessage('Valid subjectId is required'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),
  body('records.*.studentId').notEmpty().isMongoId().withMessage('Each record must have a valid studentId'),
  body('records.*.status')
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
    .withMessage('Status must be PRESENT, ABSENT, LATE, or EXCUSED'),
];

// ─── Assessment ──────────────────────────────────────────────────────────────

const assessmentValidator = [
  body('subjectId').notEmpty().isMongoId().withMessage('Valid subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type')
    .isIn(['Quiz', 'Assignment', 'Midterm', 'Internal', 'Practical', 'Final'])
    .withMessage('Invalid assessment type'),
  body('maxMarks').isInt({ min: 1 }).withMessage('Max marks must be at least 1'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('weightage').optional().isFloat({ min: 0, max: 100 }).withMessage('Weightage must be 0–100'),
];

// ─── Marks ───────────────────────────────────────────────────────────────────

const bulkMarksValidator = [
  body('assessmentId').notEmpty().isMongoId().withMessage('Valid assessmentId is required'),
  body('marks').isArray({ min: 1 }).withMessage('Marks must be a non-empty array'),
  body('marks.*.studentId').notEmpty().isMongoId().withMessage('Each mark must have a valid studentId'),
  body('marks.*.marksObtained')
    .isFloat({ min: 0 })
    .withMessage('marksObtained must be a non-negative number'),
];

// ─── Assignment ───────────────────────────────────────────────────────────────

const assignmentValidator = [
  body('subjectId').notEmpty().isMongoId().withMessage('Valid subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('deadline').notEmpty().isISO8601().withMessage('Valid deadline datetime is required'),
  body('maxMarks').optional().isInt({ min: 1 }).withMessage('Max marks must be at least 1'),
];

// ─── Submission ───────────────────────────────────────────────────────────────

const submissionValidator = [
  body('assignmentId').notEmpty().isMongoId().withMessage('Valid assignmentId is required'),
];

const gradeSubmissionValidator = [
  body('marksAwarded').optional().isFloat({ min: 0 }).withMessage('Marks must be non-negative'),
  body('status')
    .optional()
    .isIn(['graded', 'returned'])
    .withMessage('Status must be graded or returned'),
];

module.exports = {
  createStudentValidator,
  createFacultyValidator,
  departmentValidator,
  subjectValidator,
  enrollmentValidator,
  bulkAttendanceValidator,
  assessmentValidator,
  bulkMarksValidator,
  assignmentValidator,
  submissionValidator,
  gradeSubmissionValidator,
};

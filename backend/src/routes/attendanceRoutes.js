const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  markBulkAttendance,
  getAttendance,
  getMyAttendance,
  getAttendanceSummary,
  getSubjectAttendanceSummary,
  updateAttendance,
  getAttendanceDates,
} = require('../controllers/attendanceController');

// Student routes — must come before generic routes to avoid /:id conflicts
router.get('/my', authenticateUser, authorizeRoles('student'), getMyAttendance);
router.get('/summary', authenticateUser, authorizeRoles('student'), getAttendanceSummary);

// Faculty/Admin routes
router.get(
  '/subject-summary/:subjectId',
  authenticateUser,
  authorizeRoles('faculty', 'admin'),
  getSubjectAttendanceSummary
);
router.get(
  '/dates/:subjectId',
  authenticateUser,
  authorizeRoles('faculty', 'admin'),
  getAttendanceDates
);
router.get('/', authenticateUser, authorizeRoles('faculty', 'admin'), getAttendance);
router.post('/bulk', authenticateUser, authorizeRoles('faculty'), markBulkAttendance);
router.put('/:id', authenticateUser, authorizeRoles('faculty', 'admin'), updateAttendance);

module.exports = router;

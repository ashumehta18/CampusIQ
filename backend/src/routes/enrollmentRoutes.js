const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getEnrollments,
  createEnrollment,
  deactivateEnrollment,
  getStudentsBySubject,
} = require('../controllers/enrollmentController');

// Get students enrolled in a specific subject — faculty/admin
router.get(
  '/subject/:subjectId',
  authenticateUser,
  authorizeRoles('admin', 'faculty'),
  getStudentsBySubject
);

// All roles: get enrollments (filtered by role in controller)
router.get('/', authenticateUser, getEnrollments);

// Admin only
router.post('/', authenticateUser, authorizeRoles('admin'), createEnrollment);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deactivateEnrollment);

module.exports = router;

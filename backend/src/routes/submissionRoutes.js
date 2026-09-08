const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  submitAssignment,
  getMySubmissions,
  getSubmissionsByAssignment,
  gradeSubmission,
  updateSubmission,
} = require('../controllers/submissionController');

// Student routes
router.get('/my', authenticateUser, authorizeRoles('student'), getMySubmissions);
router.post('/', authenticateUser, authorizeRoles('student'), submitAssignment);
router.put('/:id', authenticateUser, authorizeRoles('student'), updateSubmission);

// Faculty routes
router.get('/', authenticateUser, authorizeRoles('faculty', 'admin'), getSubmissionsByAssignment);
router.put('/:id/grade', authenticateUser, authorizeRoles('faculty'), gradeSubmission);

module.exports = router;

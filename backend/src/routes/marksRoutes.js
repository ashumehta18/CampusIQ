const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  enterBulkMarks,
  getMarksByAssessment,
  getMyMarks,
  getMarksSummary,
  updateMark,
  getSubjectMarksSummary,
} = require('../controllers/marksController');

// Student routes — specific paths before generic /:id
router.get('/my', authenticateUser, authorizeRoles('student'), getMyMarks);
router.get('/summary', authenticateUser, authorizeRoles('student'), getMarksSummary);

// Faculty/Admin
router.get(
  '/subject-summary/:subjectId',
  authenticateUser,
  authorizeRoles('faculty', 'admin'),
  getSubjectMarksSummary
);
router.get('/', authenticateUser, authorizeRoles('faculty', 'admin'), getMarksByAssessment);
router.post('/bulk', authenticateUser, authorizeRoles('faculty'), enterBulkMarks);
router.put('/:id', authenticateUser, authorizeRoles('faculty', 'admin'), updateMark);

module.exports = router;

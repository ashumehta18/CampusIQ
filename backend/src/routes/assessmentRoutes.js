const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');

// All authenticated users can view assessments
router.get('/', authenticateUser, getAssessments);
router.get('/:id', authenticateUser, getAssessmentById);

// Faculty only
router.post('/', authenticateUser, authorizeRoles('faculty'), createAssessment);
router.put('/:id', authenticateUser, authorizeRoles('faculty'), updateAssessment);
router.delete('/:id', authenticateUser, authorizeRoles('faculty'), deleteAssessment);

module.exports = router;

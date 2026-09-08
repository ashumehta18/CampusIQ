const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');

// All authenticated users can view assignments (role-filtered in controller)
router.get('/', authenticateUser, getAssignments);
router.get('/:id', authenticateUser, getAssignmentById);

// Faculty only
router.post('/', authenticateUser, authorizeRoles('faculty'), createAssignment);
router.put('/:id', authenticateUser, authorizeRoles('faculty'), updateAssignment);
router.delete('/:id', authenticateUser, authorizeRoles('faculty'), deleteAssignment);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getAllSubjects,
  getMySubjects,
  getSubjectById,
  createSubject,
  updateSubject,
} = require('../controllers/subjectController');

// Faculty: their own assigned subjects — must come before /:id
router.get('/my', authenticateUser, authorizeRoles('faculty'), getMySubjects);

// All authenticated users can view subjects
router.get('/', authenticateUser, getAllSubjects);
router.get('/:id', authenticateUser, getSubjectById);

// Admin only
router.post('/', authenticateUser, authorizeRoles('admin'), createSubject);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateSubject);

module.exports = router;

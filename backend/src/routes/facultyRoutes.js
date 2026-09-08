const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  getAllFaculty,
  getFacultyById,
  createFacultyProfile,
  updateFacultyById,
} = require('../controllers/facultyController');

// Faculty: own profile
router.get('/profile', authenticateUser, authorizeRoles('faculty'), getMyProfile);
router.put('/profile', authenticateUser, authorizeRoles('faculty'), updateMyProfile);

// Admin: manage faculty
router.get('/', authenticateUser, authorizeRoles('admin'), getAllFaculty);
router.get('/:id', authenticateUser, authorizeRoles('admin'), getFacultyById);
router.post('/', authenticateUser, authorizeRoles('admin'), createFacultyProfile);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateFacultyById);

module.exports = router;

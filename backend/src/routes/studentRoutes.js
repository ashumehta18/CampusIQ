const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  createStudentProfile,
  updateStudentById,
} = require('../controllers/studentController');

// Student: own profile
router.get('/profile', authenticateUser, authorizeRoles('student'), getMyProfile);
router.put('/profile', authenticateUser, authorizeRoles('student'), updateMyProfile);

// Admin + Faculty: view students
router.get('/', authenticateUser, authorizeRoles('admin', 'faculty'), getAllStudents);
router.get('/:id', authenticateUser, authorizeRoles('admin', 'faculty'), getStudentById);

// Admin only: create and update student profiles
router.post('/', authenticateUser, authorizeRoles('admin'), createStudentProfile);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateStudentById);

module.exports = router;

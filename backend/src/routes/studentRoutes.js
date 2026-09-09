const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { createStudentValidator } = require('../validators/routeValidators');
const {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  createStudentProfile,
  updateStudentById,
} = require('../controllers/studentController');

router.get('/profile', authenticateUser, authorizeRoles('student'), getMyProfile);
router.put('/profile', authenticateUser, authorizeRoles('student'), updateMyProfile);

router.get('/', authenticateUser, authorizeRoles('admin', 'faculty'), getAllStudents);
router.get('/:id', authenticateUser, authorizeRoles('admin', 'faculty'), validateObjectId, getStudentById);

router.post('/', authenticateUser, authorizeRoles('admin'), createStudentValidator, validate, createStudentProfile);
router.put('/:id', authenticateUser, authorizeRoles('admin'), validateObjectId, updateStudentById);

module.exports = router;

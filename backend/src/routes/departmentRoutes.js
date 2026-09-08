const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} = require('../controllers/departmentController');

// All authenticated users can view departments (needed for profile forms)
router.get('/', authenticateUser, getAllDepartments);
router.get('/:id', authenticateUser, getDepartmentById);

// Admin only: create and update
router.post('/', authenticateUser, authorizeRoles('admin'), createDepartment);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateDepartment);

module.exports = router;

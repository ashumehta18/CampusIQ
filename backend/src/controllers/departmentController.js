const Department = require('../models/Department');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/departments
 * All roles can view departments (needed for dropdowns in forms).
 */
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, 'Departments fetched', departments);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return errorResponse(res, 404, 'Department not found');
    return successResponse(res, 200, 'Department fetched', dept);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/departments
 * Admin only.
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, hodName } = req.body;

    if (!name || !code) {
      return errorResponse(res, 400, 'Name and code are required');
    }

    const dept = await Department.create({ name, code, description, hodName });
    return successResponse(res, 201, 'Department created', dept);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/departments/:id
 * Admin only.
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, hodName, isActive } = req.body;

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, hodName, isActive },
      { new: true, runValidators: true }
    );

    if (!dept) return errorResponse(res, 404, 'Department not found');
    return successResponse(res, 200, 'Department updated', dept);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment };

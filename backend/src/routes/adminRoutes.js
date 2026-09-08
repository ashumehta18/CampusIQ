const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  getSystemStats,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticateUser, authorizeRoles('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deactivateUser);

module.exports = router;

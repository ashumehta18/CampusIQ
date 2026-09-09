const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All routes require authentication — notifications are always personal
router.use(authenticateUser);

// Specific paths must come before /:id
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.get('/', getMyNotifications);
router.put('/:id', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

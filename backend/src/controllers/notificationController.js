const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/notifications
 * Returns notifications for the logged-in user, newest first.
 * Supports ?unreadOnly=true to filter unread.
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const filter = { recipient: req.user._id };
    if (req.query.unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50); // cap at 50 — pagination can be added later

    return successResponse(res, 200, 'Notifications fetched', notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Lightweight endpoint — just returns the count for the sidebar badge.
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    return successResponse(res, 200, 'Unread count fetched', { count });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id
 * Mark a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return errorResponse(res, 404, 'Notification not found');
    return successResponse(res, 200, 'Marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all of the user's notifications as read at once.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a single notification (user clears it).
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notification) return errorResponse(res, 404, 'Notification not found');
    return successResponse(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

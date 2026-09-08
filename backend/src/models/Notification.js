const mongoose = require('mongoose');

/**
 * Notification Model
 * In-app messages targeted to a specific user.
 * isRead tracks whether the user has seen it.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    type: {
      type: String,
      enum: ['assignment', 'marks', 'attendance', 'general', 'deadline'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // optional reference to related document
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

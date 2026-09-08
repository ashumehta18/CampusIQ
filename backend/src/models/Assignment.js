const mongoose = require('mongoose');

/**
 * Assignment Model
 * A task created by faculty with a deadline.
 * Submissions are stored in a separate Submission collection.
 */
const assignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    maxMarks: {
      type: Number,
      default: 10,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ subject: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

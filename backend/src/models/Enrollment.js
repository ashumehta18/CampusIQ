const mongoose = require('mongoose');

/**
 * Enrollment Model
 * Junction between Student and Subject.
 * A student can only be enrolled in a subject once (compound unique index).
 * academicYear tracks which year the enrollment belongs to.
 */
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      // e.g. "2024-2025"
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment for same student + subject + academicYear
enrollmentSchema.index({ student: 1, subject: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

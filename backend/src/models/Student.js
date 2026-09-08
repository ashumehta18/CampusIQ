const mongoose = require('mongoose');

/**
 * Student Model
 * Extended profile for users with role='student'.
 * References User for auth data and Department for academic placement.
 * enrollmentNumber is unique per institution.
 */
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Enrollment number is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
    batch: {
      type: String, // e.g. "2021-2025"
      required: [true, 'Batch is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookup by department and semester
studentSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model('Student', studentSchema);

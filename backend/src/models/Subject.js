const mongoose = require('mongoose');

/**
 * Subject Model
 * A course offered by a department, taught by a faculty member.
 * Enrollments, Attendance, Assessments, and Assignments all reference Subject.
 */
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 6,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);

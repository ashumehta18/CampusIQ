const mongoose = require('mongoose');

/**
 * Attendance Model
 * One record per student per subject per date.
 * Compound unique index prevents duplicate attendance for same day.
 * Percentages are DERIVED from records — never stored here.
 */
const attendanceSchema = new mongoose.Schema(
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
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      required: [true, 'Status is required'],
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student + subject + date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });
// Fast lookup by subject + date (for faculty marking attendance)
attendanceSchema.index({ subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

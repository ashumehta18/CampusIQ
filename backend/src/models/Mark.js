const mongoose = require('mongoose');

/**
 * Mark Model
 * One record per student per assessment.
 * marksObtained is validated against assessment.maxMarks at the controller level.
 * Compound unique index prevents duplicate marks for same student + assessment.
 */
const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    remarks: {
      type: String,
      default: '',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
  },
  { timestamps: true }
);

markSchema.index({ student: 1, assessment: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);

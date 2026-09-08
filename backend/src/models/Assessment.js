const mongoose = require('mongoose');

/**
 * Assessment Model
 * An exam, quiz, or test created by faculty for a subject.
 * Marks are stored in a separate Mark collection referencing this.
 */
const assessmentSchema = new mongoose.Schema(
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
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Quiz', 'Assignment', 'Midterm', 'Internal', 'Practical', 'Final'],
      required: [true, 'Assessment type is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: [1, 'Max marks must be at least 1'],
    },
    weightage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    date: {
      type: Date,
      required: [true, 'Assessment date is required'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

assessmentSchema.index({ subject: 1, type: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);

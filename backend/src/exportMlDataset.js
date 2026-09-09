require('dotenv').config();

const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const Student = require('./models/Student');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Assessment = require('./models/Assessment');
const Mark = require('./models/Mark');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');

const outputPath = path.resolve(__dirname, '../../ml-services/data/student_features.csv');

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const percentage = (numerator, denominator) => (
  denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : ''
);

const exportDataset = async () => {
  await connectDB();

  const [students, enrollments, attendance, assessments, marks, assignments, submissions] = await Promise.all([
    Student.find({ isActive: true }).select('_id enrollmentNumber').lean(),
    Enrollment.find({ isActive: true }).select('student subject').lean(),
    Attendance.find().select('student subject status').lean(),
    Assessment.find().select('_id subject maxMarks').lean(),
    Mark.find().select('student assessment marksObtained').lean(),
    Assignment.find({ isActive: true }).select('_id subject').lean(),
    Submission.find().select('student assignment isLate').lean(),
  ]);

  const enrollmentSubjects = new Map();
  for (const enrollment of enrollments) {
    const studentKey = String(enrollment.student);
    if (!enrollmentSubjects.has(studentKey)) enrollmentSubjects.set(studentKey, new Set());
    enrollmentSubjects.get(studentKey).add(String(enrollment.subject));
  }

  const attendanceByStudent = new Map();
  for (const record of attendance) {
    const studentKey = String(record.student);
    const current = attendanceByStudent.get(studentKey) || { attended: 0, total: 0 };
    current.total += 1;
    if (record.status === 'PRESENT' || record.status === 'LATE') current.attended += 1;
    attendanceByStudent.set(studentKey, current);
  }

  const assessmentsById = new Map(assessments.map((assessment) => [String(assessment._id), assessment]));
  const marksByStudent = new Map();
  for (const mark of marks) {
    const assessment = assessmentsById.get(String(mark.assessment));
    if (!assessment) continue;
    const studentKey = String(mark.student);
    const current = marksByStudent.get(studentKey) || { obtained: 0, maximum: 0, attempted: 0 };
    current.obtained += mark.marksObtained;
    current.maximum += assessment.maxMarks;
    current.attempted += 1;
    marksByStudent.set(studentKey, current);
  }

  const assignmentsBySubject = new Map();
  for (const assignment of assignments) {
    const subjectKey = String(assignment.subject);
    assignmentsBySubject.set(subjectKey, (assignmentsBySubject.get(subjectKey) || 0) + 1);
  }

  const submissionsByStudent = new Map();
  for (const submission of submissions) {
    const studentKey = String(submission.student);
    const current = submissionsByStudent.get(studentKey) || { submitted: 0, late: 0 };
    current.submitted += 1;
    if (submission.isLate) current.late += 1;
    submissionsByStudent.set(studentKey, current);
  }

  const rows = students.map((student) => {
    const studentKey = String(student._id);
    const subjectIds = enrollmentSubjects.get(studentKey) || new Set();
    const assignmentTotal = [...subjectIds].reduce(
      (total, subjectId) => total + (assignmentsBySubject.get(subjectId) || 0),
      0
    );
    const attendanceData = attendanceByStudent.get(studentKey) || { attended: 0, total: 0 };
    const markData = marksByStudent.get(studentKey) || { obtained: 0, maximum: 0, attempted: 0 };
    const submissionData = submissionsByStudent.get(studentKey) || { submitted: 0, late: 0 };

    return {
      student_id: studentKey,
      enrollment_number: student.enrollmentNumber,
      enrolled_subjects: subjectIds.size,
      attendance_percentage: percentage(attendanceData.attended, attendanceData.total),
      average_marks_percentage: percentage(markData.obtained, markData.maximum),
      assessments_attempted: markData.attempted,
      assignments_total: assignmentTotal,
      assignments_submitted: submissionData.submitted,
      late_submissions: submissionData.late,
    };
  });

  const headers = [
    'student_id',
    'enrollment_number',
    'enrolled_subjects',
    'attendance_percentage',
    'average_marks_percentage',
    'assessments_attempted',
    'assignments_total',
    'assignments_submitted',
    'late_submissions',
  ];
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${csv}\n`, 'utf8');
  console.log(`Exported ${rows.length} student feature rows to ${outputPath}`);
  console.log('No target label was generated. Define the future academic outcome before training a model.');
};

exportDataset()
  .catch((error) => {
    console.error(`ML dataset export failed: ${error.message}`);
    process.exitCode = 1;
  });

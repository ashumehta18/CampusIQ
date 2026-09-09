require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Department = require('./models/Department');
const Subject = require('./models/Subject');
const Enrollment = require('./models/Enrollment');

const demoUsers = {
  admin: { name: 'CampusIQ Admin', email: 'admin@campusiq.local', password: 'Admin@123456', role: 'admin' },
  faculty: { name: 'Demo Faculty', email: 'faculty@campusiq.local', password: 'Faculty@123456', role: 'faculty' },
  student: { name: 'Demo Student', email: 'student@campusiq.local', password: 'Student@123456', role: 'student' },
};

const findOrCreateUser = async (userData) => {
  let user = await User.findOne({ email: userData.email });
  if (!user) user = await User.create(userData);
  return user;
};

const seed = async () => {
  await connectDB();

  const [admin, facultyUser, studentUser] = await Promise.all(
    Object.values(demoUsers).map(findOrCreateUser)
  );

  const department = await Department.findOneAndUpdate(
    { code: 'CSE' },
    { name: 'Computer Science and Engineering', code: 'CSE', description: 'Demo department for local development.' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const faculty = await Faculty.findOneAndUpdate(
    { user: facultyUser._id },
    {
      user: facultyUser._id,
      employeeId: 'FAC-DEMO-001',
      department: department._id,
      designation: 'Lecturer',
      specialization: 'Software Engineering',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const student = await Student.findOneAndUpdate(
    { user: studentUser._id },
    {
      user: studentUser._id,
      enrollmentNumber: 'CSE-DEMO-001',
      department: department._id,
      semester: 8,
      batch: '2022-2026',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const subject = await Subject.findOneAndUpdate(
    { code: 'CSE-DEMO-401' },
    {
      name: 'Software Engineering',
      code: 'CSE-DEMO-401',
      department: department._id,
      faculty: faculty._id,
      semester: 8,
      credits: 4,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Enrollment.findOneAndUpdate(
    { student: student._id, subject: subject._id, academicYear: '2025-2026' },
    { student: student._id, subject: subject._id, academicYear: '2025-2026' },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log('CampusIQ demo data is ready.');
  console.log('Admin:   admin@campusiq.local / Admin@123456');
  console.log('Faculty: faculty@campusiq.local / Faculty@123456');
  console.log('Student: student@campusiq.local / Student@123456');
  console.log(`Seeded by ${admin.email}.`);
  process.exitCode = 0;
};

seed().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});

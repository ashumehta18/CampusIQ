import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const facultyNav = [
  { label: 'Dashboard', path: '/faculty/dashboard', icon: '🏠' },
  { label: 'Profile', path: '/faculty/profile', icon: '👤' },
  { label: 'My Subjects', path: '/faculty/subjects', icon: '📚' },
  { label: 'Students', path: '/faculty/students', icon: '👥' },
  { label: 'Attendance', path: '/faculty/attendance', icon: '📋' },
  { label: 'Assessments', path: '/faculty/assessments', icon: '📝' },
  { label: 'Marks', path: '/faculty/marks', icon: '🎯' },
  { label: 'Assignments', path: '/faculty/assignments', icon: '📌' },
  { label: 'Performance', path: '/faculty/performance', icon: '📊' },
];

const FacultyLayout = () => (
  <DashboardLayout navItems={facultyNav}>
    <Outlet />
  </DashboardLayout>
);

export default FacultyLayout;

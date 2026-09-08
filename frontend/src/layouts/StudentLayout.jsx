import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
  { label: 'Profile', path: '/student/profile', icon: '👤' },
  { label: 'Subjects', path: '/student/subjects', icon: '📚' },
  { label: 'Attendance', path: '/student/attendance', icon: '📋' },
  { label: 'Assessments', path: '/student/assessments', icon: '📝' },
  { label: 'Marks', path: '/student/marks', icon: '🎯' },
  { label: 'Assignments', path: '/student/assignments', icon: '📌' },
  { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
];

const StudentLayout = () => (
  <DashboardLayout navItems={studentNav}>
    <Outlet />
  </DashboardLayout>
);

export default StudentLayout;

import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Students', path: '/admin/students', icon: '🎓' },
  { label: 'Faculty', path: '/admin/faculty', icon: '👨‍🏫' },
  { label: 'Departments', path: '/admin/departments', icon: '🏛️' },
  { label: 'Subjects', path: '/admin/subjects', icon: '📚' },
  { label: 'Enrollments', path: '/admin/enrollments', icon: '📋' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📊' },
];

const AdminLayout = () => (
  <DashboardLayout navItems={adminNav}>
    <Outlet />
  </DashboardLayout>
);

export default AdminLayout;

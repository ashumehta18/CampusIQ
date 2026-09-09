import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import AdminLayout from './layouts/AdminLayout';

// Dashboard pages (stubs — filled in later phases)
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePending from './pages/student/ProfilePending';
import StudentProfile from './pages/student/StudentProfile';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentMarks from './pages/student/StudentMarks';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentNotifications from './pages/student/StudentNotifications';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultySubjects from './pages/faculty/FacultySubjects';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAssessments from './pages/faculty/FacultyAssessments';
import FacultyPerformance from './pages/faculty/FacultyPerformance';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Common pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" />
          <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/student/pending"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfilePending />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']} requiresProfile>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assessments" element={<StudentAssessments />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Faculty routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="profile" element={<FacultyProfile />} />
            <Route path="subjects" element={<FacultySubjects />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="assessments" element={<FacultyAssessments />} />
            <Route path="performance" element={<FacultyPerformance />} />
            <Route path="assignments" element={<FacultyAssignments />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

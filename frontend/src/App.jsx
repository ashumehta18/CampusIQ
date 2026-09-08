import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
import StudentProfile from './pages/student/StudentProfile';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

// Common pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

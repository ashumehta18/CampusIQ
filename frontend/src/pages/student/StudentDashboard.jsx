import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
      <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        Phase 10 — Dashboard content will be added here (attendance summary, marks, assignments).
      </div>
    </div>
  );
};

export default StudentDashboard;

import { useAuth } from '../../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h2>
      <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
        Phase 10 — Dashboard content will be added here (subjects, attendance, student performance).
      </div>
    </div>
  );
};

export default FacultyDashboard;

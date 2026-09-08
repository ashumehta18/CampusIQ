import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-700">
        Phase 10 — Dashboard content will be added here (system stats, departments, users).
      </div>
    </div>
  );
};

export default AdminDashboard;

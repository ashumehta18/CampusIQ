import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * DashboardLayout — shared sidebar + topbar layout for all roles.
 * navItems: array of { label, path, icon } passed per role.
 */
const DashboardLayout = ({ navItems, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const roleColors = {
    student: 'bg-blue-600',
    faculty: 'bg-green-600',
    admin: 'bg-purple-600',
  };

  const sidebarColor = roleColors[user?.role] || 'bg-gray-800';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 ${sidebarColor} text-white flex flex-col`}>
        <div className="px-6 py-5 border-b border-white/20">
          <h1 className="text-xl font-bold">CampusIQ</h1>
          <p className="text-xs text-white/70 mt-0.5 capitalize">{user?.role} Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/20">
          <div className="px-3 py-2 text-xs text-white/70 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

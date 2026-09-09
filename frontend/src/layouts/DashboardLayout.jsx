import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const DashboardLayout = ({ navItems, children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  // Role-specific accent for active nav item glow
  const roleAccent = {
    student: 'from-amber-800 to-stone-900',
    faculty: 'from-amber-900 to-amber-800',
    admin: 'from-stone-900 to-amber-900',
  };

  const gradient = roleAccent[user?.role] || 'from-stone-900 to-amber-900';

  const roleLabel = {
    student: 'Student Portal',
    faculty: 'Faculty Portal',
    admin: 'Admin Portal',
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: '#fdfaf7' }}>
      {/* Sidebar */}
      <aside
        className={`w-64 bg-gradient-to-b ${gradient} flex flex-col shrink-0`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.18)' }}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-900 font-black text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #f5e6d3, #e8c9a0)' }}
            >
              IQ
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-wide">CampusIQ</h1>
              <p className="text-amber-200/60 text-xs mt-0.5">{roleLabel[user?.role]}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-amber-100/70 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span
                  className="text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none font-semibold"
                  style={{ background: '#c0392b' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-amber-900 shrink-0"
              style={{ background: 'linear-gradient(135deg, #f5e6d3, #d4a574)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-amber-200/50 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-100/70 hover:bg-white/8 hover:text-white transition-all duration-150"
          >
            <span className="text-base w-5 text-center shrink-0">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b"
          style={{ background: 'rgba(253,250,247,0.92)', backdropFilter: 'blur(8px)', borderColor: '#ede8e1' }}
        >
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
              {roleLabel[user?.role]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-amber-900"
              style={{ background: 'linear-gradient(135deg, #f5e6d3, #d4a574)' }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-stone-700">{user?.name}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

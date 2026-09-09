import { useAuth } from '../../context/AuthContext';

const ProfilePending = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#fdfaf7' }}>
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl" style={{ background: '#f5e6d3' }}>
          🎓
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a0522d' }}>
          Profile setup pending
        </p>
        <h1 className="mt-3 text-3xl font-bold text-stone-800">Your account is ready</h1>
        <p className="mt-4 text-sm leading-6 text-stone-500">
          Hi {user?.name?.split(' ')[0] || 'there'}, your login account was created successfully.
          An administrator still needs to assign your university enrollment number, department,
          semester, and batch before academic data can appear here.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={logout}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ background: '#8b4513' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePending;

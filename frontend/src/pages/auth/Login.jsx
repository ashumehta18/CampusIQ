import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#fdfaf7' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #5c2e0a 0%, #a0522d 50%, #c4854a 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-amber-900 text-sm"
            style={{ background: 'linear-gradient(135deg, #f5e6d3, #e8c9a0)' }}
          >
            IQ
          </div>
          <span className="text-white font-bold text-lg tracking-wide">CampusIQ</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Academic<br />Intelligence<br />Platform
          </h2>
          <p className="text-amber-200/70 text-sm leading-relaxed max-w-xs">
            Manage attendance, assessments, assignments, and academic performance — all in one place.
          </p>
        </div>

        <div className="flex gap-3">
          {['Students', 'Faculty', 'Admin'].map((r) => (
            <div
              key={r}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-amber-900"
              style={{ background: 'rgba(245,230,211,0.25)', color: '#f5e6d3' }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #a0522d, #c4854a)', color: '#fdf3e7' }}
            >
              IQ
            </div>
            <span className="font-bold text-stone-800 text-lg">CampusIQ</span>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-1">Sign in</h1>
          <p className="text-stone-400 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@university.edu"
                className="w-full rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 transition"
                style={{
                  border: '1.5px solid #ede8e1',
                  background: '#fdfaf7',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#a0522d')}
                onBlur={(e) => (e.target.style.borderColor = '#ede8e1')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 transition"
                style={{
                  border: '1.5px solid #ede8e1',
                  background: '#fdfaf7',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#a0522d')}
                onBlur={(e) => (e.target.style.borderColor = '#ede8e1')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8b4513, #a0522d)' }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'linear-gradient(135deg, #723a0f, #8b4513)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'linear-gradient(135deg, #8b4513, #a0522d)')}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#a0522d' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

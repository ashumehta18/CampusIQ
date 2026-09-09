import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const inputStyle = {
  border: '1.5px solid #ede8e1',
  background: '#fdfaf7',
  outline: 'none',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      
      // Navigate safely according to returned user role
      const userRole = user?.role || form.role;
      if (userRole === 'admin') navigate('/admin/dashboard');
      else if (userRole === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      console.error('Registration error details:', err);
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@university.edu' },
    { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters', minLength: 6 },
  ];

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
            Join the<br />Campus<br />Network
          </h2>
          <p className="text-amber-200/70 text-sm leading-relaxed max-w-xs">
            Create your account and get instant access to your academic dashboard.
          </p>
        </div>

        <div className="space-y-2 text-amber-200/60 text-xs">
          <p>✓ Real-time attendance tracking</p>
          <p>✓ Assessment & marks management</p>
          <p>✓ Assignment submission portal</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #a0522d, #c4854a)', color: '#fdf3e7' }}
            >
              IQ
            </div>
            <span className="font-bold text-stone-800 text-lg">CampusIQ</span>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-1">Create account</h1>
          <p className="text-stone-400 text-sm mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ label, name, type, placeholder, minLength }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  minLength={minLength}
                  className="w-full rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 transition"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#a0522d')}
                  onBlur={(e) => (e.target.style.borderColor = '#ede8e1')}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 text-sm text-stone-800 transition"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#a0522d')}
                onBlur={(e) => (e.target.style.borderColor = '#ede8e1')}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #8b4513, #a0522d)' }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'linear-gradient(135deg, #723a0f, #8b4513)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'linear-gradient(135deg, #8b4513, #a0522d)')}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#a0522d' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
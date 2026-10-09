import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!form.email) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Account created! Let\'s set up your profile. 🚀');
      navigate('/dashboard/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 6) score++;
    if (form.password.length >= 10) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">SkillBridge <span className="text-gradient">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400 text-sm">Start your career readiness journey today — free forever</p>
        </div>

        <div className="card-elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                className="input-field"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  className="input-field pr-12"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel}</p>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className="input-field pr-12"
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

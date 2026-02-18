// LoginPage.jsx — FIXED
// Change: Added welcome popup after successful login.
//   - Normal user: "Welcome, <Username>!"
//   - Admin user:  "Welcome Admin"

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../../components/common/DarkModeToggle';

// ── Welcome Toast ──────────────────────────────────────────────────────────────
const WelcomeToast = ({ message }) => (
  <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in slide-in-from-top-4 duration-300">
    <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl font-semibold text-base min-w-[240px] justify-center">
      <span className="text-2xl">👋</span>
      {message}
    </div>
  </div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);

      // Determine role for popup message
      const isAdmin =
        Array.isArray(userData?.roles) &&
        userData.roles.some(r => r.roleName === 'ADMIN');

      const message = isAdmin
        ? 'Welcome Admin'
        : `Welcome, ${userData?.userName || 'User'}!`;

      setToast(message);

      // Wait for toast to be visible, then navigate
      setTimeout(() => navigate('/home'), 1800);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <WelcomeToast message={toast} />}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-5 py-20">
        {/* Floating dark mode toggle */}
        <div className="fixed top-5 right-5 z-50">
          <DarkModeToggle />
        </div>
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">Sign in to continue to InfoCircle</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="you@example.com" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Enter your password" required
              />
            </div>

            <button
              type="submit" disabled={loading || !!toast}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : toast ? '✅ Redirecting…' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
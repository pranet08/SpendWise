import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTrendingUp } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

export const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // Trigger login process
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate inputs
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock Login Context Call
    const res = login(email, password);
    if (res.success) {
      navigate('/'); // Redirect to Dashboard homepage
    }
  };

  // Autocomplete demo details for reviewers
  const handleQuickFill = () => {
    setEmail('alex.mercer@spendwise.io');
    setPassword('demopass123');
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo and branding title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-xl shadow-brand-500/20 mb-3">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">SpendWise</h2>
          <p className="text-sm text-slate-400 mt-1.5">Track your expenses, budgets, and savings goals</p>
        </div>

        {/* Login glassmorphism card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Sign In</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.email ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                    errors.password ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                  {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
            </div>

            {/* Sign in submission button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-300 mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all duration-200"
            >
              ⚡ Auto-Fill Demo Credentials
            </button>
          </div>

          {/* Route redirect link */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

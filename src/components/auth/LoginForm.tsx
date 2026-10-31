import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { CicrLogo } from '../common/CicrLogo';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your name, email, or username and password.');
      return;
    }

    setLoading(true);
    const res = await signIn({ identifier: identifier.trim(), password });
    setLoading(false);

    if (res.success) {
      showToast('success', 'Authenticated Successfully', 'Welcome back to CICR Inventory!');
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-[#0c0918] border border-purple-900/40 rounded-3xl p-7 sm:p-8 shadow-[0_0_50px_-10px_rgba(147,51,234,0.35)] relative overflow-hidden text-slate-200">
      {/* Brand Header with 2nd Image as Logo */}
      <div className="flex flex-col items-center text-center mb-6">
        <CicrLogo size={64} className="mb-3" />
        <h1 className="text-xl font-bold text-white tracking-tight">CICR Inventory</h1>
        <p className="text-[10px] tracking-[0.2em] font-semibold text-zinc-400 uppercase mt-1">
          CREATIVE & INNOVATIVE CELL IN ROBOTICS
        </p>
      </div>

      {/* Segmented Tab Switcher (Matching Screenshot 1) */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#120d22] border border-purple-900/30 mb-6">
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#f1ece1] text-[#0d091b] font-bold text-xs shadow-md transition-all cursor-default"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-zinc-400 hover:text-white font-medium text-xs transition-colors"
        >
          <span className="text-base font-light leading-none">+</span>
          <span>Register</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Input */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email, Username, or Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your name, email, or username"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-xs text-white placeholder-zinc-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-300">Password</label>
            <button
              type="button"
              onClick={() => setForgotOpen(!forgotOpen)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Forgot Password?</span>
            </button>
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-xs text-white placeholder-zinc-500 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {forgotOpen && (
          <div className="p-3 rounded-xl bg-[#140f26] border border-purple-900/40 text-[11px] text-zinc-300">
            For password reset assistance, please contact the CICR administrator or re-register with your college email.
          </div>
        )}

        {/* Authenticate Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-purple-glow w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-5 cursor-pointer disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating with Backend...' : 'Authenticate'}</span>
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="text-center mt-6">
        <p className="text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-white hover:underline font-semibold underline-offset-2 transition-colors ml-1"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Hash,
  Phone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { CicrLogo } from '../common/CicrLogo';
import { compressImageToBase64 } from '../../lib/imageUtils';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Picture Upload
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const avatarInitial = fullName.trim() ? fullName.trim().charAt(0).toUpperCase() : 'U';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageToBase64(file, 256, 0.85);
      setAvatarUrl(base64);
      showToast('success', 'Profile Photo Added', 'Photo successfully previewed and ready for registration.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process image.';
      showToast('error', 'Image Error', msg);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !collegeEmail.trim() || !password) {
      setErrorMsg('Please fill in your full name, college email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    // Role is assigned by admins from the admin portal; signups default strictly to 'member'
    const res = await signUp({
      email: collegeEmail.trim(),
      password,
      full_name: fullName.trim(),
      enrollment_no: enrollmentNo.trim(),
      phone: contactNumber.trim(),
      role: 'member',
      avatar_url: avatarUrl || undefined,
    });
    setLoading(false);

    if (res.success) {
      showToast(
        'info',
        'Request Submitted for Approval',
        'Your registration has been sent to the Admin Portal. Once approved by an admin, you will be able to log in!'
      );
      onSwitchToLogin();
    } else {
      setErrorMsg(res.error || 'Registration failed in backend.');
    }
  };

  return (
    <div className="w-full max-w-[620px] bg-[#0c0918] border border-purple-900/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_-10px_rgba(147,51,234,0.35)] relative overflow-hidden text-slate-200">
      {/* Brand Header - Compact */}
      <div className="flex flex-col items-center text-center mb-3">
        <CicrLogo size={38} className="mb-1.5" />
        <h1 className="text-lg font-bold text-white tracking-tight leading-tight">CICR Inventory</h1>
        <p className="text-[9px] tracking-[0.2em] font-semibold text-zinc-400 uppercase mt-0.5">
          CREATIVE & INNOVATIVE CELL IN ROBOTICS
        </p>
      </div>

      {/* Segmented Tab Switcher - Compact */}
      <div className="grid grid-cols-2 p-0.5 rounded-xl bg-[#120d22] border border-purple-900/30 mb-3">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#f1ece1] text-[#0d091b] font-bold text-xs shadow-md transition-all cursor-default"
        >
          <span className="text-sm font-light leading-none">+</span>
          <span>Register</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 text-xs">
        {/* Profile Picture Upload & Preview - Sleek Horizontal Strip */}
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-[#080512] border border-[#241a3d]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md ring-1 ring-purple-500/40 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  avatarInitial
                )}
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-white leading-tight block">Profile Photo</span>
              <span className="text-[9px] text-zinc-400 leading-tight block truncate">Optional avatar preview</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-medium text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>{avatarUrl ? 'Change' : 'Upload'}</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 2 Boxes Side-by-Side Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Box 1 (Row 1 Left): Full Name */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Full Name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Your Name"
                className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Box 2 (Row 1 Right): Email ID */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Email ID</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type="text"
                required
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
                placeholder="Enter your College Email"
                className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Box 3 (Row 2 Left): Enrollment Number */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Enrollment Number</label>
            <div className="relative">
              <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type="text"
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="Enter your Enrollment Number"
                className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Box 4 (Row 2 Right): Contact Number */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Contact Number</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your Contact Number"
                className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Box 5 (Row 3 Left): Password */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                className="w-full pl-8 pr-8 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 sm:top-2.5 p-0.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Box 6 (Row 3 Right): Confirm Password */}
          <div>
            <label className="block text-zinc-300 font-medium text-[11px] mb-0.5">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 text-zinc-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your Password"
                className="w-full pl-8 pr-8 py-1.5 sm:py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 text-xs outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2 sm:top-2.5 p-0.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Notice on Approval - Compact */}
        <p className="text-[10px] text-amber-300/80 bg-amber-950/20 border border-amber-900/30 py-1.5 px-2.5 rounded-xl leading-snug">
          ℹ️ <strong>Account Approval:</strong> Registration request will be routed to Admin Portal for administrator approval before login.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-purple-glow w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md"
        >
          <span className="text-sm font-light leading-none">+</span>
          <span>{loading ? 'Submitting Request...' : 'Submit Registration Request'}</span>
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="text-center mt-2.5">
        <p className="text-[11px] text-zinc-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-white hover:underline font-semibold underline-offset-2 transition-colors ml-1 cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

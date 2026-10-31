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
    <div className="w-full max-w-[500px] bg-[#0c0918] border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_-10px_rgba(147,51,234,0.35)] relative overflow-hidden text-slate-200">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <CicrLogo size={56} className="mb-2.5" />
        <h1 className="text-xl font-bold text-white tracking-tight">CICR Inventory</h1>
        <p className="text-[10px] tracking-[0.2em] font-semibold text-zinc-400 uppercase mt-0.5">
          CREATIVE & INNOVATIVE CELL IN ROBOTICS
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#120d22] border border-purple-900/30 mb-5">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#f1ece1] text-[#0d091b] font-bold text-xs shadow-md transition-all cursor-default"
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

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Profile Picture Upload & Preview */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#080512] border border-[#241a3d]">
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/40 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                avatarInitial
              )}
            </div>

            {/* Quick Upload Hover Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title="Upload photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block">Profile Picture</span>
            <span className="text-[10px] text-zinc-400 block mb-1.5">
              Upload your photo or use initial avatar
            </span>
            <div className="flex items-center gap-2">
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
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter Your Name"
              className="w-full pl-9 pr-3 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Email ID */}
        <div>
          <label className="block text-zinc-300 font-medium mb-1">Email ID</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              required
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              placeholder="Enter your College Email"
              className="w-full pl-9 pr-3 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Row: Enrollment Number & Contact Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Enrollment Number</label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="Enter your Enrollment Number"
                className="w-full pl-9 pr-3 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Contact Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your Contact Number"
                className="w-full pl-9 pr-3 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                className="w-full pl-9 pr-9 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-3 p-0.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your Password"
                className="w-full pl-9 pr-9 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-3 p-0.5 text-zinc-500 hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Notice on Approval */}
        <p className="text-[11px] text-amber-300/80 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl">
          ℹ️ <strong>Account Approval:</strong> After submitting, your registration request will be routed to the Admin Portal. An administrator must approve your account before you can log in.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-purple-glow w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
        >
          <span className="text-base font-light leading-none">+</span>
          <span>{loading ? 'Submitting Request...' : 'Submit Registration Request'}</span>
        </button>
      </form>

      {/* Footer Switcher */}
      <div className="text-center mt-4">
        <p className="text-xs text-zinc-400">
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

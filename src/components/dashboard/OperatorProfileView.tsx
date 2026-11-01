import React, { useRef } from 'react';
import { AnimatedFileUpload } from '../ui/animated-file-upload';
import {
  User,
  Camera,
  X,
  Mail,
  Hash,
  Phone,
  ShieldCheck,
  Key,
  Save,
  Bug,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface OperatorProfileViewProps {
  userName: string;
  userEmail?: string;
  roleName: string;
  editName: string;
  setEditName: (name: string) => void;
  editEnrollment: string;
  setEditEnrollment: (roll: string) => void;
  editPhone: string;
  setEditPhone: (phone: string) => void;
  editAvatarUrl: string;
  setEditAvatarUrl: (url: string) => void;
  savingProfile: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
  onOpenChangePassword: () => void;
  onRemoveAvatar: () => void;
}

export const OperatorProfileView: React.FC<OperatorProfileViewProps> = ({
  userName,
  userEmail,
  roleName,
  editName,
  setEditName,
  editEnrollment,
  editPhone,
  editAvatarUrl,
  setEditAvatarUrl,
  savingProfile,
  onSaveProfile,
  onOpenChangePassword,
  onRemoveAvatar,
}) => {
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setEditAvatarUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title & Clearance Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <User className="w-5 h-5 text-blue-600 dark:text-purple-400" />
            Operator Profile &amp; Verification Details
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage your personal profile and view locked laboratory identity credentials
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Identity
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/40 text-xs font-extrabold uppercase">
            {roleName}
          </span>
        </div>
      </div>

      {/* 2 Boxes Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* BOX 1 (LEFT): Profile Identity, Avatar & Actions */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-purple-400" />
              Operator Identity &amp; Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Customize your profile photo and display name
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#14141c] border border-slate-200 dark:border-zinc-800">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 dark:ring-purple-500/30 overflow-hidden">
                {editAvatarUrl ? (
                  <img
                    src={editAvatarUrl}
                    alt={editName || userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (editName || userName || 'U').charAt(0).toUpperCase()
                )}
              </div>

              <button
                type="button"
                onClick={() => profileFileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Upload profile photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Change</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
              <input
                ref={profileFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileAvatarChange}
                className="hidden"
              />
              <div className="w-full">
                <AnimatedFileUpload
                  variant="compact"
                  multiple={false}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  maxFiles={1}
                  dropTitle={editAvatarUrl ? 'Change Photo' : 'Upload Photo'}
                  dropSubtitle="Drop picture or click to select"
                  onFilesSelected={(files) => {
                    if (files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setEditAvatarUrl(ev.target.result as string);
                      };
                      reader.readAsDataURL(files[0]);
                    }
                  }}
                  className="w-full"
                />
              </div>
              {editAvatarUrl && (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-rose-500/20 text-slate-700 dark:text-zinc-400 hover:text-rose-500 border border-slate-300 dark:border-zinc-700 text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Avatar</span>
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSaveProfile} className="space-y-4 text-xs">
            {/* Full Name (Editable) */}
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none font-semibold text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 dark:shadow-purple-950/40 transition-colors disabled:opacity-50 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenChangePassword}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700 text-xs"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Official Bug / Error Submission Google Form Button */}
            <button
              type="button"
              onClick={() =>
                window.open(
                  'https://docs.google.com/forms/d/e/1FAIpQLScF-vaE7NEi-teLfHsB3FkIkW2ggAzRLV3nr7jM0rp1pP5w8g/viewform',
                  '_blank'
                )
              }
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
            >
              <Bug className="w-4 h-4" />
              <span>Submit Bugs &amp; Error Report (Google Form)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ========================================================= */}
        {/* BOX 2 (RIGHT): Institutional & Locked Academic Details */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Verified Academic &amp; Contact Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Permanent institutional identifiers registered with the laboratory
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          </div>

          {/* Locked Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Security Protocol:</strong> Email, Enrollment Number, and Contact Number cannot be changed. These credentials are tied to your college records and loan accountability.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Email ID (CANNOT BE CHANGED) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>College Email ID</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Cannot be changed
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="email"
                  disabled
                  value={userEmail || ''}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-100 dark:bg-[#09090d] border border-slate-200 dark:border-zinc-800/80 rounded-xl text-slate-700 dark:text-zinc-300 font-mono text-xs outline-none cursor-not-allowed select-none"
                />
                <Lock className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-amber-500" />
              </div>
            </div>

            {/* Enrollment Number (CANNOT BE CHANGED) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Enrollment Number</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Cannot be changed
                </span>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  disabled
                  value={editEnrollment || 'Registered with CICR'}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-100 dark:bg-[#09090d] border border-slate-200 dark:border-zinc-800/80 rounded-xl text-slate-700 dark:text-zinc-300 font-mono text-xs outline-none cursor-not-allowed select-none font-semibold"
                />
                <Lock className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-amber-500" />
              </div>
            </div>

            {/* Contact Number (CANNOT BE CHANGED) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Contact Number</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Cannot be changed
                </span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  disabled
                  value={editPhone || 'Registered with CICR'}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-100 dark:bg-[#09090d] border border-slate-200 dark:border-zinc-800/80 rounded-xl text-slate-700 dark:text-zinc-300 font-mono text-xs outline-none cursor-not-allowed select-none font-semibold"
                />
                <Lock className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-amber-500" />
              </div>
            </div>

            {/* Assigned Laboratory Role */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Assigned Laboratory Role</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  disabled
                  value={roleName}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-100 dark:bg-[#09090d] border border-slate-200 dark:border-zinc-800/80 rounded-xl text-blue-700 dark:text-purple-300 font-bold outline-none cursor-not-allowed uppercase font-mono tracking-wider text-xs"
                />
                <Lock className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

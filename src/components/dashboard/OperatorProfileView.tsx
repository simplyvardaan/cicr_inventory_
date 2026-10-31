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
  setEditEnrollment,
  editPhone,
  setEditPhone,
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
    <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-purple-400" />
            Operator Profile Details
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage your verified student identity and laboratory credentials
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/40 text-xs font-extrabold uppercase">
          {roleName}
        </span>
      </div>

      {/* Avatar Circle Display with Photo Upload */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#14141c] border border-slate-200 dark:border-zinc-800">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-2 ring-blue-500/30 dark:ring-purple-500/40 overflow-hidden">
            {editAvatarUrl ? (
              <img src={editAvatarUrl} alt={editName || userName} className="w-full h-full object-cover" />
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

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white block truncate">
              {editName || userName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/30 text-[10px] font-bold uppercase">
              {roleName}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono mt-0.5 truncate">
            {userEmail}
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Club Account</span>
          </span>

          {/* Upload / Remove Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
            <input
              ref={profileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileAvatarChange}
              className="hidden"
            />
            <div className="w-full sm:w-auto">
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
                className="max-w-xs"
              />
            </div>
            {editAvatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-rose-500/20 text-slate-600 dark:text-zinc-400 hover:text-rose-500 border border-slate-300 dark:border-zinc-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={onSaveProfile} className="space-y-4 text-xs">
        {/* Full Name */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Email ID (Read-only) */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Email ID</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="email"
              disabled
              value={userEmail || ''}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 dark:bg-[#09090d] border border-slate-200 dark:border-zinc-800/60 rounded-xl text-zinc-500 outline-none cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Enrollment Number */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Enrollment Number</label>
          <div className="relative">
            <Hash className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              value={editEnrollment}
              onChange={(e) => setEditEnrollment(e.target.value)}
              placeholder="e.g. 992501030399"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Contact Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="e.g. 7428938113"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Laboratory Role */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Laboratory Role</label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              disabled
              value={roleName}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 dark:bg-[#09090d] border-2 border-slate-200 dark:border-zinc-800/60 rounded-xl text-blue-700 dark:text-purple-300 font-bold outline-none cursor-not-allowed uppercase font-mono tracking-wider"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-auth-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
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
  );
};

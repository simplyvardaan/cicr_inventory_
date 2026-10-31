import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../common/Toast';
import { RoleBadge, BorrowStatusBadge } from '../common/Badge';
import { User, Mail, IdCard, Phone, Save, Boxes, Calendar, LogOut, CheckCircle2 } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { requests } = useInventory();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [rollNumber, setRollNumber] = useState(profile?.roll_number || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <User className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Not Signed In</h3>
        <p className="text-xs text-slate-400">Please sign in to view your profile and borrowed equipment.</p>
      </div>
    );
  }

  // Filter requests initiated by this user
  const myRequests = requests.filter(
    (r) => r.user_id === user.id || r.user_email === user.email
  );

  const activeBorrowed = myRequests.filter((r) => r.status === 'approved');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      full_name: fullName,
      roll_number: rollNumber,
      phone,
    });
    setSaving(false);

    if (res.success) {
      showToast('success', 'Profile Updated', 'Your details have been saved.');
    } else {
      showToast('error', 'Update Failed', res.error);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Profile Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-cyan-400">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-white">{profile?.full_name || 'Member'}</h2>
              {profile?.role && <RoleBadge role={profile.role} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-cyan-300 mt-2 font-mono">
              {profile?.roll_number && <span>ID: {profile.roll_number}</span>}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Edit Profile Form */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Member Information
          </h3>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">College Roll / ID</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="23BCS1088"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>

        {/* Right: My Borrowed Items */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              My Equipment Borrow History
            </h3>
            <span className="text-xs text-slate-400">{myRequests.length} total requests</span>
          </div>

          {activeBorrowed.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                You currently have <strong>{activeBorrowed.length}</strong> active component checkout{activeBorrowed.length > 1 ? 's' : ''}.
              </span>
            </div>
          )}

          {myRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              You haven&apos;t requested or borrowed any components yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{req.item_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                        x{req.quantity}
                      </span>
                      <BorrowStatusBadge status={req.status} />
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Project: <span className="text-slate-300 font-medium">{req.project_name}</span>
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 flex sm:flex-col items-center sm:items-end justify-between">
                    <span>Expected Return:</span>
                    <strong className="text-slate-200">{req.expected_return_date}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


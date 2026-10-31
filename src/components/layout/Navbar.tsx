import React from 'react';
import { Database, User, LogOut, LogIn, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { RoleBadge } from '../common/Badge';
import { CicrLogo } from '../common/CicrLogo';

interface NavbarProps {
  onOpenSchemaModal: () => void;
  onOpenAuthModal: () => void;
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSchemaModal,
  onOpenAuthModal,
  onToggleSidebar,
  setActiveTab,
}) => {
  const { user, profile, signOut } = useAuth();
  const { isLiveDatabase } = useInventory();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070510]/85 backdrop-blur-xl border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <CicrLogo size={38} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  CICR
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 tracking-wider">
                  INVENTORY
                </span>
              </div>
              <p className="hidden sm:block text-[9px] text-zinc-400 tracking-wider uppercase font-semibold">
                Creative & Innovative Cell in Robotics
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSchemaModal}
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isLiveDatabase
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50'
                : 'bg-purple-950/40 text-purple-300 border-purple-800/70 hover:bg-purple-900/50'
            }`}
            title="Click to view Supabase connection & SQL details"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveDatabase ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400 animate-pulse'
                }`}
              />
              {isLiveDatabase ? 'Supabase Live' : 'Backend Ready'}
            </span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#0f0b1e] hover:bg-[#181131] border border-purple-900/40 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs">
                  {profile?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-200">
                      {profile?.full_name || 'Member'}
                    </span>
                    {profile?.role && <RoleBadge role={profile.role} />}
                  </div>
                  <span className="text-[10px] text-zinc-400 block -mt-0.5">
                    {profile?.roll_number || ''}
                  </span>
                </div>
              </button>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-purple-glow flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

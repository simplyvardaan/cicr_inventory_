import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { motionTransitions } from '../../lib/motion-tokens';
import {
  LayoutGrid,
  Boxes,
  Layers,
  Bell,
  ScrollText,
  Code2,
  Key,
  LogOut,
  Cpu,
  Radar,
  Compass,
  Zap,
  Wrench,
  ChevronDown,
} from 'lucide-react';

export type ActiveView =
  | 'dashboard'
  | 'inventory'
  | 'cart'
  | 'review-requests'
  | 'logs'
  | 'developers'
  | 'profile';

interface BottomNavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenChangePassword: () => void;
  pendingAccountsCount?: number;
}

// Custom [ ⚡ ] Power icon
const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`inline-flex items-center font-mono text-[11px] font-bold tracking-tight shrink-0 ${className}`}>
    [<Zap className="w-3 h-3 inline mx-0.5" />]
  </span>
);

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeView,
  setActiveView,
  activeCategory = 'all',
  onSelectCategory,
  onOpenChangePassword,
  pendingAccountsCount = 0,
}) => {
  const { user, profile, signOut } = useAuth();
  const { requests } = useInventory();

  // State for Inventory category sub-bar
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const getInitial = () => {
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.email;
    return name ? name.charAt(0).toUpperCase() : 'M';
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member';

  const roleName = (
    profile?.role ||
    user?.user_metadata?.role ||
    (isAdmin ? 'ADMIN' : 'MEMBER')
  ).toUpperCase();

  const handleSelectCategory = (catKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    setActiveView('inventory');
    setSubmenuOpen(false);
  };

  const categoryItems = [
    { key: 'all', label: 'All Assets', icon: Layers },
    { key: 'mcu', label: 'Micro', icon: Cpu },
    { key: 'sensors', label: 'Sensors', icon: Radar },
    { key: 'actuators', label: 'Actuators', icon: Compass },
    { key: 'power', label: 'Power', icon: PowerIcon },
    { key: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
      {/* Docked Centered Floating Navbar with EasyUI Pill Navigation Design */}
      <nav className="relative flex justify-center px-2 py-2 sm:p-3 pointer-events-none" ref={navContainerRef}>
        <div className="pointer-events-auto relative flex items-center justify-between gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#0c0c14]/95 backdrop-blur-2xl border border-[#252538] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85)] max-w-4xl w-full">
          
          {/* Main Segmented Pill Tabs */}
          <div role="tablist" className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            
            {/* 1. Dashboard Tab */}
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeView === 'dashboard'}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView('dashboard');
                setSubmenuOpen(false);
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeView === 'dashboard' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeView === 'dashboard' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-purple-600/25 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                />
              )}
              <LayoutGrid className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="relative z-10 hidden sm:inline">Dashboard</span>
            </motion.button>

            {/* 2. Inventory Tab with Submenu Indicator */}
            <div className="relative flex items-center">
              <motion.button
                type="button"
                role="tab"
                aria-selected={activeView === 'inventory'}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (activeView === 'inventory') {
                    setSubmenuOpen((prev) => !prev);
                  } else {
                    setActiveView('inventory');
                    setSubmenuOpen(true);
                  }
                }}
                className={`relative flex items-center gap-1.5 sm:gap-2 pl-3 sm:pl-3.5 pr-2 sm:pr-2.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeView === 'inventory' ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {activeView === 'inventory' && (
                  <motion.span
                    layoutId="easyui-pill-active-dock"
                    transition={motionTransitions.springMorph}
                    className="absolute inset-0 rounded-full bg-purple-600/25 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                  />
                )}
                <Boxes className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-purple-400" />
                <span className="relative z-10 hidden sm:inline">Inventory</span>
                <ChevronDown
                  className={`relative z-10 w-3 h-3 transition-transform duration-200 ${
                    submenuOpen && activeView === 'inventory' ? 'rotate-180 text-purple-300' : 'text-zinc-500'
                  }`}
                />
              </motion.button>

              {/* Fluid Morphing Submenu Bar (Floats right above Inventory) */}
              <AnimatePresence>
                {activeView === 'inventory' && submenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={motionTransitions.springGentle}
                    className="absolute bottom-full mb-3 left-0 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-1 rounded-full border border-[#252538] bg-[#0c0c14]/95 backdrop-blur-2xl p-1 shadow-2xl shadow-black z-50 whitespace-nowrap overflow-x-auto max-w-[90vw]"
                  >
                    {categoryItems.map((cat) => {
                      const isSelected = activeCategory === cat.key;
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.key}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelectCategory(cat.key)}
                          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isSelected && (
                            <motion.span
                              layoutId="easyui-pill-cat-indicator"
                              transition={motionTransitions.springMorph}
                              className="absolute inset-0 rounded-full bg-[#1e1b2e] border border-purple-500/50 shadow-sm"
                            />
                          )}
                          <Icon className={`relative z-10 w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-300' : 'text-zinc-500'}`} />
                          <span className="relative z-10">{cat.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Requests Tab */}
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeView === 'review-requests'}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView('review-requests');
                setSubmenuOpen(false);
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeView === 'review-requests' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeView === 'review-requests' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-purple-600/25 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                />
              )}
              <Bell className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="relative z-10 hidden md:inline">Requests</span>
              {pendingCount > 0 && (
                <span className="relative z-10 px-1.5 py-0.2 rounded-full bg-[#2ee59d] text-black font-extrabold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </motion.button>

            {/* 4. Logs Tab (Admin Only) */}
            {isAdmin && (
              <motion.button
                type="button"
                role="tab"
                aria-selected={activeView === 'logs'}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveView('logs');
                  setSubmenuOpen(false);
                }}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeView === 'logs' ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {activeView === 'logs' && (
                  <motion.span
                    layoutId="easyui-pill-active-dock"
                    transition={motionTransitions.springMorph}
                    className="absolute inset-0 rounded-full bg-purple-600/25 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                  />
                )}
                <ScrollText className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="relative z-10 hidden sm:inline">Logs</span>
                {pendingAccountsCount > 0 && (
                  <span className="relative z-10 px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                    {pendingAccountsCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* 5. Team (Meet Developers) Tab */}
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeView === 'developers'}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView('developers');
                setSubmenuOpen(false);
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeView === 'developers' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeView === 'developers' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-purple-600/25 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                />
              )}
              <Code2 className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="relative z-10 hidden xl:inline">Meet Developers</span>
              <span className="relative z-10 hidden md:inline xl:hidden">Team</span>
            </motion.button>
          </div>

          {/* Right Section: Divider & User Profile Capsule */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
            {/* Elegant Vertical Divider */}
            <div className="h-6 w-px bg-zinc-800/90 mx-1 shrink-0" />

            {/* User Profile Pill */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView('profile');
                setSubmenuOpen(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full transition-colors cursor-pointer ${
                activeView === 'profile'
                  ? 'bg-purple-600/20 border border-purple-500/50'
                  : 'hover:bg-zinc-800/60 border border-transparent'
              }`}
              title="View Profile"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#171722] border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-inner">
                {profile?.avatar_url &&
                (profile.avatar_url.startsWith('data:image') || profile.avatar_url.startsWith('http')) ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  getInitial()
                )}
              </div>
              <div className="text-left hidden lg:block">
                <span className="block text-xs font-bold text-white leading-tight truncate max-w-[85px]">
                  {displayName}
                </span>
                <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider block truncate max-w-[85px]">
                  {roleName}
                </span>
              </div>
            </motion.button>

            {/* Change Password Key Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onOpenChangePassword}
              className="w-7 h-7 rounded-full bg-[#151520] hover:bg-[#20202e] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Change Password"
            >
              <Key className="w-3.5 h-3.5" />
            </motion.button>

            {/* Sign Out Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => signOut()}
              className="w-7 h-7 rounded-full bg-[#151520] hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-800/60 border border-zinc-800 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </div>

        </div>
      </nav>
    </div>
  );
};

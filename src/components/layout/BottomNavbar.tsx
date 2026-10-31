import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { motionTransitions } from '../../lib/motion-tokens';
import {
  LayoutGrid,
  Boxes,
  Bell,
  ScrollText,
  Code2,
  ChevronDown,
  LogOut,
  Cpu,
  Radio,
  Compass,
  Wrench,
  Zap,
} from 'lucide-react';

export type ActiveView = 'dashboard' | 'inventory' | 'review-requests' | 'logs' | 'developers' | 'profile';

interface BottomNavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenChangePassword: () => void;
  pendingAccountsCount?: number;
}

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
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.role === 'admin';
  const isLead = profile?.role === 'lead';
  const roleName = isAdmin ? 'ADMIN' : isLead ? 'LEAD' : 'MEMBER';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    return 'U';
  };

  const handleSelectCategory = (key: string) => {
    if (onSelectCategory) {
      onSelectCategory(key);
    }
    setActiveView('inventory');
    setSubmenuOpen(false);
  };

  const categoryItems = [
    { key: 'all', label: 'All Catalog', icon: Boxes },
    { key: 'microcontrollers', label: 'Microcontrollers', icon: Cpu },
    { key: 'sensors', label: 'Sensors', icon: Radio },
    { key: 'actuators', label: 'Actuators', icon: Compass },
    { key: 'power', label: 'Power', icon: PowerIcon },
    { key: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
      {/* Docked Centered Floating Navbar with Cool Aesthetic Glassmorphism */}
      <nav className="relative flex justify-center px-2 py-2 sm:p-3 pointer-events-none" ref={navContainerRef}>
        <div className="pointer-events-auto relative inline-flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/90 dark:bg-[#0c0c14]/90 backdrop-blur-2xl border-2 border-slate-200/90 dark:border-[#252538] shadow-[0_12px_36px_-6px_rgba(15,23,42,0.14)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85)] max-w-fit w-auto transition-all">
          
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
                activeView === 'dashboard'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {activeView === 'dashboard' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-md shadow-blue-600/30 dark:shadow-purple-900/40"
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
                  activeView === 'inventory'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {activeView === 'inventory' && (
                  <motion.span
                    layoutId="easyui-pill-active-dock"
                    transition={motionTransitions.springMorph}
                    className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-md shadow-blue-600/30 dark:shadow-purple-900/40"
                  />
                )}
                <Boxes className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeView === 'inventory' ? 'text-white' : 'text-blue-600 dark:text-purple-400'}`} />
                <span className="relative z-10 hidden sm:inline">Inventory</span>
                <ChevronDown
                  className={`relative z-10 w-3 h-3 transition-transform duration-200 ${
                    submenuOpen && activeView === 'inventory' ? 'rotate-180 text-white' : 'text-slate-400 dark:text-zinc-500'
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
                    className="absolute bottom-full mb-3 left-0 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-1 rounded-full border-2 border-slate-200 dark:border-[#252538] bg-white/95 dark:bg-[#0c0c14]/95 backdrop-blur-2xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black z-50 whitespace-nowrap overflow-x-auto max-w-[90vw]"
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
                            isSelected
                              ? 'text-white font-bold'
                              : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                          }`}
                        >
                          {isSelected && (
                            <motion.span
                              layoutId="easyui-pill-cat-indicator"
                              transition={motionTransitions.springMorph}
                              className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-sm"
                            />
                          )}
                          <Icon className={`relative z-10 w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-purple-400'}`} />
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
                activeView === 'review-requests'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {activeView === 'review-requests' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-md shadow-blue-600/30 dark:shadow-purple-900/40"
                />
              )}
              <Bell className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="relative z-10 hidden md:inline">Requests</span>
              {pendingCount > 0 && (
                <span className={`relative z-10 px-1.5 py-0.2 rounded-full font-black text-[10px] ${activeView === 'review-requests' ? 'bg-white text-blue-600 dark:text-purple-600' : 'bg-blue-600 dark:bg-purple-600 text-white'}`}>
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
                  activeView === 'logs'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {activeView === 'logs' && (
                  <motion.span
                    layoutId="easyui-pill-active-dock"
                    transition={motionTransitions.springMorph}
                    className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-md shadow-blue-600/30 dark:shadow-purple-900/40"
                  />
                )}
                <ScrollText className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="relative z-10 hidden sm:inline">Logs</span>
                {pendingAccountsCount > 0 && (
                  <span className="relative z-10 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black text-[10px] shadow-sm">
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
                activeView === 'developers'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {activeView === 'developers' && (
                <motion.span
                  layoutId="easyui-pill-active-dock"
                  transition={motionTransitions.springMorph}
                  className="absolute inset-0 rounded-full bg-blue-600 dark:bg-purple-600 shadow-md shadow-blue-600/30 dark:shadow-purple-900/40"
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
            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

            {/* User Profile Pill */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onOpenChangePassword();
                setSubmenuOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-300 dark:hover:border-zinc-700"
              title="Change Password / Account Settings"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 dark:bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-sm">
                {profile?.avatar_url &&
                (profile.avatar_url.startsWith('data:image') || profile.avatar_url.startsWith('http')) ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  getInitial()
                )}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                  {displayName}
                </span>
                <span className="text-[9px] font-black text-blue-600 dark:text-purple-400 uppercase tracking-wider block whitespace-nowrap">
                  {roleName}
                </span>
              </div>
            </motion.button>

            {/* Sign Out Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => signOut()}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#151520] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
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

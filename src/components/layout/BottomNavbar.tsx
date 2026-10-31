import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import {
  LayoutGrid,
  Boxes,
  Layers,
  Bell,
  Shield,
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

// Custom [ ⚡ ] Power icon matching Screenshot 1 exactly
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

  // State for Inventory category dropup menu
  const [dropupOpen, setDropupOpen] = useState(false);
  const inventoryMenuRef = useRef<HTMLDivElement>(null);

  // Close dropup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inventoryMenuRef.current &&
        !inventoryMenuRef.current.contains(event.target as Node)
      ) {
        setDropupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Strict Admin check: dynamically checks user profile and metadata role
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
    setDropupOpen(false);
  };

  // 6 specific category items matching Screenshot 1 exactly
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
      {/* Docked Centered Floating Navbar - Compact & Perfectly Aligned */}
      <nav className="relative flex justify-center px-2 py-2 sm:p-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl sm:rounded-3xl bg-[#0c0c12]/98 backdrop-blur-3xl border border-[#252538] shadow-2xl shadow-black max-w-3xl w-full justify-between">
          
          {/* Navigation Tabs - Compact on mobile, expanded on desktop */}
          <div className="flex items-center gap-1 sm:gap-1.5 py-0.5 min-w-0">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => {
                setActiveView('dashboard');
                setDropupOpen(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-md shadow-black/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
              }`}
              title="Dashboard"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Combined Inventory Button with Dedicated Dropdown Trigger */}
            <div className="relative shrink-0" ref={inventoryMenuRef}>
              <div
                className={`flex items-stretch rounded-xl sm:rounded-2xl transition-all border ${
                  activeView === 'inventory'
                    ? 'bg-purple-600/20 border-purple-500/50 shadow-md shadow-black/50'
                    : 'bg-transparent hover:bg-zinc-800/60 border-transparent'
                }`}
              >
                {/* Left Side: Clicking name or icon directly shows the Inventory view */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('all');
                    setActiveView('inventory');
                    setDropupOpen(false);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 pl-2 pr-1.5 sm:pl-3 sm:pr-2 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    activeView === 'inventory'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="View All Inventory"
                >
                  <Boxes className={`w-4 h-4 shrink-0 ${activeView === 'inventory' ? 'text-purple-300' : 'text-purple-400'}`} />
                  <span className="hidden sm:inline">Inventory</span>
                </button>

                {/* Right Side: Dedicated Dropdown Button (Dropup menu opens ONLY when clicked!) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropupOpen((prev) => !prev);
                  }}
                  className={`flex items-center justify-center px-1.5 sm:px-2 py-1.5 rounded-r-xl sm:rounded-r-2xl transition-colors cursor-pointer border-l ${
                    activeView === 'inventory'
                      ? 'border-purple-500/30 hover:bg-purple-500/20'
                      : 'border-white/10 hover:bg-white/10'
                  } ${
                    dropupOpen
                      ? 'text-purple-300 bg-white/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Filter Categories"
                  aria-label="Filter Categories"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropupOpen ? 'rotate-180 text-purple-300' : 'text-zinc-400'
                    }`}
                  />
                </button>
              </div>

              {/* Top-Side Category Dropup Menu - Crisp Dark Shadow, No Purple Bleed */}
              {dropupOpen && (
                <div className="absolute bottom-full mb-3 left-0 sm:left-1/2 sm:-translate-x-1/2 w-48 sm:w-56 bg-[#0e0e15] backdrop-blur-2xl border border-[#2d2d42] rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-black z-[100] animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
                  <div className="space-y-1">
                    {categoryItems.map((cat) => {
                      const isSelected = activeView === 'inventory' && activeCategory === cat.key;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleSelectCategory(cat.key)}
                          className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/25 text-white border border-purple-500/60 font-bold shadow-sm shadow-black/40'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                          }`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                              isSelected ? 'text-purple-300' : 'text-zinc-400'
                            }`}
                          />
                          <span className="font-medium text-xs sm:text-sm">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Review Requests */}
            <button
              type="button"
              onClick={() => {
                setActiveView('review-requests');
                setDropupOpen(false);
              }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeView === 'review-requests'
                  ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-md shadow-black/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
              }`}
              title="Requests"
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#2ee59d] text-black font-extrabold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Audit & Management Logs (ONLY VISIBLE TO ADMIN ACCOUNTS) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveView('logs');
                  setDropupOpen(false);
                }}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeView === 'logs'
                    ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-md shadow-black/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                }`}
                title="Management & 7-Day Activity Logs"
              >
                <ScrollText className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Logs</span>
                {pendingAccountsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                    {pendingAccountsCount}
                  </span>
                )}
              </button>
            )}

            {/* Meet Developers */}
            <button
              type="button"
              onClick={() => {
                setActiveView('developers');
                setDropupOpen(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeView === 'developers'
                  ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-md shadow-black/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
              }`}
              title="Meet the Developers"
            >
              <Code2 className="w-4 h-4 shrink-0" />
              <span className="hidden xl:inline">Meet Developers</span>
              <span className="hidden md:inline xl:hidden">Team</span>
            </button>
          </div>

          {/* User Capsule on Right - Compact on mobile so it never goes off-screen */}
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2.5 border-l border-zinc-800/80 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveView('profile');
                setDropupOpen(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                activeView === 'profile'
                  ? 'bg-[#1b1b26] border border-purple-500/40'
                  : 'hover:bg-zinc-800/50 border border-transparent'
              }`}
              title="My Profile"
            >
              {/* Avatar Circle */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#171722] border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {profile?.avatar_url && (profile.avatar_url.startsWith('data:image') || profile.avatar_url.startsWith('http')) ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  getInitial()
                )}
              </div>

              {/* User Name & Role (visible on lg+) */}
              <div className="text-left hidden lg:block">
                <span className="block text-xs font-bold text-white leading-tight truncate max-w-[80px]">
                  {displayName}
                </span>
                <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider block truncate max-w-[80px]">
                  {roleName}
                </span>
              </div>
            </button>

            {/* Change Password Key Button */}
            <button
              type="button"
              onClick={onOpenChangePassword}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#171720] hover:bg-[#232330] border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Change Password"
            >
              <Key className="w-3 h-3" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => signOut()}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#171720] hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-800 border border-zinc-800 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>

        </div>
      </nav>
    </div>
  );
};

import React from 'react';
import { AirportMatrixClock } from '../ui/airport-matrix-clock';
import { ActiveView } from '../layout/BottomNavbar';
import { CartItem } from '../inventory/RequestCartModal';
import {
  Layers,
  ShoppingBag,
  Code2,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface DashboardOverviewProps {
  userName: string;
  roleName: string;
  cart: CartItem[];
  setActiveView: (view: ActiveView) => void;
  onOpenCartModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  userName,
  roleName,
  cart,
  setActiveView,
  onOpenCartModal,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Hero Greeting & Live Matrix Airport Clock Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-widest text-blue-600 dark:text-purple-400 uppercase">
              {roleName} DASHBOARD
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {getGreeting()}, {userName}
          </h1>
        </div>

        {/* Airport Matrix Live Departure Clock */}
        <div className="shrink-0 w-full lg:w-auto max-w-full">
          <AirportMatrixClock
            cities={['new-delhi']}
            format="24h"
            showSeconds={true}
            updateInterval={1000}
            showCountry={true}
            showControls={false}
            className="w-full sm:min-w-[340px] md:min-w-[420px]"
          />
        </div>
      </div>

      {/* 4 Interactive Hub Cards (Auto-fills wide screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Component Vault */}
        <div
          onClick={() => setActiveView('inventory')}
          className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-mono">
                CATALOG
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
              Component Vault
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Browse and search the repository of microcontrollers, sensors, actuators, and hardware components.
            </p>
          </div>
          <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-emerald-400 transition-colors">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Request Cart */}
        <div
          onClick={onOpenCartModal}
          className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-mono">
                HARDWARE CART
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
              Request Cart
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Review staged components, inspect loan allocations, and dispatch 1-go consolidated hardware requisitions.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              {cart.length} items loaded
            </span>
            <div className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Meet The Developers */}
        <div
          onClick={() => setActiveView('developers')}
          className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-purple-950/70 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-mono">
                THE CREATORS
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
              Meet The Developers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Explore the engineering milestones, founding prototype era, and current development team.
            </p>
          </div>
          <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: My Profile */}
        <div
          onClick={() => setActiveView('profile')}
          className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-purple-950/70 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-mono">
                OPERATOR HUD
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
              My Profile
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Inspect credentials, verified student tier, active hardware checkouts, and security controls.
            </p>
          </div>
          <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

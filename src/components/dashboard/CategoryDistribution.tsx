import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Cpu, Radio, Zap, BatteryCharging, Wrench, Layers, Box } from 'lucide-react';

interface CategoryDistributionProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ onSelectCategory }) => {
  const { items } = useInventory();

  const categoryIcons: Record<string, React.ReactNode> = {
    'Microcontrollers & SBCs': <Cpu className="w-4 h-4 text-purple-400" />,
    'Sensors & Modules': <Radio className="w-4 h-4 text-purple-300" />,
    'Motors & Drivers': <Zap className="w-4 h-4 text-amber-400" />,
    'Power & Batteries': <BatteryCharging className="w-4 h-4 text-emerald-400" />,
    'Tools & Fabrication': <Wrench className="w-4 h-4 text-rose-400" />,
    'Electronic Components': <Layers className="w-4 h-4 text-purple-300" />,
    'Mechanical & Chassis': <Box className="w-4 h-4 text-orange-400" />,
  };

  // Group items
  const counts: Record<string, { totalItems: number; totalQty: number; availQty: number }> = {};
  items.forEach((item) => {
    if (!counts[item.category]) {
      counts[item.category] = { totalItems: 0, totalQty: 0, availQty: 0 };
    }
    counts[item.category].totalItems += 1;
    counts[item.category].totalQty += item.total_qty || 0;
    counts[item.category].availQty += item.available_qty || 0;
  });

  const categories = Object.keys(counts).sort((a, b) => counts[b].totalQty - counts[a].totalQty);

  return (
    <div className="p-5 rounded-3xl bg-[#0c0819]/80 border border-purple-900/30 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Lab Equipment by Category</h3>
          <p className="text-xs text-zinc-400">Stock distribution across robotics domains</p>
        </div>
        <span className="text-xs text-purple-300 font-semibold">{categories.length} categories</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const data = counts[cat];
          const pct = Math.round((data.availQty / (data.totalQty || 1)) * 100);

          return (
            <div
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="p-3.5 rounded-2xl bg-[#080512] border border-purple-950/70 hover:border-purple-600/40 hover:bg-[#100b22] cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#140f28] border border-purple-900/40 group-hover:scale-105 transition-transform">
                    {categoryIcons[cat] || <Box className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {cat}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-zinc-400">
                  {data.availQty}/{data.totalQty}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#16102a] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    pct > 50 ? 'bg-gradient-to-r from-purple-600 to-white' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400">
                <span>{data.totalItems} distinct items</span>
                <span>{pct}% available</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

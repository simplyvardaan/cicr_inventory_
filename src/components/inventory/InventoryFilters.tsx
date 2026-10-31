import React from 'react';
import { Search, Filter, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../../lib/sampleData';

interface InventoryFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (v: 'grid' | 'table') => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="space-y-3 p-4 rounded-3xl bg-[#0c0819]/80 border border-purple-900/30">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-xs text-white placeholder-zinc-500 transition-all outline-none"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#080512] rounded-xl border border-purple-900/30 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/40'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/40'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Category */}
        <div className="flex items-center gap-1.5 bg-[#080512] px-3 py-1.5 rounded-xl border border-purple-900/30 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer pr-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0c0819] text-zinc-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 bg-[#080512] px-3 py-1.5 rounded-xl border border-purple-900/30 text-xs">
          <span className="text-zinc-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer pr-2"
          >
            <option value="All" className="bg-[#0c0819]">All Statuses</option>
            <option value="In Stock" className="bg-[#0c0819]">In Stock</option>
            <option value="Low Stock" className="bg-[#0c0819]">Low Stock</option>
            <option value="Out of Stock" className="bg-[#0c0819]">Out of Stock</option>
            <option value="Maintenance" className="bg-[#0c0819]">Maintenance</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 bg-[#080512] px-3 py-1.5 rounded-xl border border-purple-900/30 text-xs ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer pr-2"
          >
            <option value="name" className="bg-[#0c0819]">Sort by Name</option>
            <option value="available_qty" className="bg-[#0c0819]">Sort by Available Quantity</option>
            <option value="created_at" className="bg-[#0c0819]">Recently Added</option>
          </select>
        </div>
      </div>
    </div>
  );
};

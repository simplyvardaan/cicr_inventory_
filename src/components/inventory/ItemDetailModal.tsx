import React from 'react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/Badge';
import { DragToConfirm } from '../ui/drag-to-confirm';
import {
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Layers,
  FileText,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onBorrow: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onBorrow,
}) => {
  const { requests } = useInventory();
  if (!item) return null;

  const itemRequests = requests.filter((r) => r.item_id === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/15 max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={item.status} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h3>
            <p className="text-xs text-blue-600 dark:text-purple-400 font-bold">{item.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-bold">Available Units</span>
              <span className="text-2xl font-black text-blue-600 dark:text-purple-400">{item.available_qty}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-bold">Total Stock</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{item.total_qty}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-bold">Min Threshold</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{item.min_threshold}</span>
            </div>
          </div>

          {/* Location & Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-purple-400 shrink-0" />
              <span><strong>Storage Location:</strong> {item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
              <Layers className="w-4 h-4 text-blue-600 dark:text-purple-400 shrink-0" />
              <span><strong>Category Domain:</strong> {item.category}</span>
            </div>
            {item.datasheet_url && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-purple-400 shrink-0" />
                <a
                  href={item.datasheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-purple-400 hover:underline font-bold"
                >
                  View Technical Datasheet
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-blue-600 dark:text-purple-400" />
                <span>Description &amp; Specifications</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Recent Requisitions on this Item */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Activity ({itemRequests.length})
            </h4>
            {itemRequests.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-500 italic">No requisition records for this component.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {itemRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#120d24] border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{req.user_name}</span>
                      <span className="text-slate-500 dark:text-zinc-500"> ({req.quantity} units)</span>
                      <span className="text-slate-500 dark:text-zinc-500"> • {req.project_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 transition-colors"
          >
            Close
          </button>

          {item.available_qty > 0 ? (
            <div className="w-full sm:w-64">
              <DragToConfirm
                size="sm"
                label="Slide to Request Item"
                confirmedLabel="Item Selected!"
                actionType="confirm"
                variant="default"
                onConfirm={() => {
                  setTimeout(() => {
                    onClose();
                    onBorrow(item);
                  }, 400);
                }}
              />
            </div>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-red-50 text-red-700 border-2 border-red-300 cursor-not-allowed"
            >
              <span>Out of Stock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

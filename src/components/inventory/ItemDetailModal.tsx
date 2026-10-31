import React from 'react';
import { InventoryItem } from '../../types/inventory';
import { StatusBadge } from '../common/Badge';
import { X, MapPin, ExternalLink, ArrowRightCircle, Cpu } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DragToConfirm } from '../ui/drag-to-confirm';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onBorrow: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onBorrow }) => {
  const { requests } = useInventory();
  if (!item) return null;

  const itemRequests = requests.filter((r) => r.item_id === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0918] border border-purple-900/40 rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(147,51,234,0.35)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={item.status} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{item.name}</h3>
            <p className="text-xs text-purple-400 font-medium">{item.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#080512] border border-purple-900/30">
              <span className="text-[11px] text-zinc-400 block">Available Units</span>
              <span className="text-2xl font-black text-white">{item.available_qty}</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                of {item.total_qty} total
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080512] border border-purple-900/30">
              <span className="text-[11px] text-zinc-400 block">Min Alert Level</span>
              <span className="text-2xl font-black text-amber-400">{item.min_threshold}</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">threshold</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#080512] border border-purple-900/30 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Storage Lab
                </span>
                <span className="text-xs font-semibold text-zinc-200">{item.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#080512] p-4 rounded-2xl border border-purple-900/30">
                {item.description}
              </p>
            </div>
          )}

          {/* Datasheet Link */}
          {item.datasheet_url && (
            <div>
              <a
                href={item.datasheet_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#140f26] hover:bg-[#1f173b] border border-purple-800/50 text-purple-300 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Official Manufacturer Datasheet / Pinout</span>
              </a>
            </div>
          )}

          {/* Borrow History for this item */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Recent Lab Issuance History
            </h4>
            {itemRequests.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No borrow requests logged for this item yet.</p>
            ) : (
              <div className="space-y-2">
                {itemRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-[#080512] border border-purple-900/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200">{req.user_name}</span>
                      <span className="text-zinc-500"> • {req.project_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {req.quantity}x unit{req.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with EasyUI Drag to Confirm */}
        <div className="pt-4 border-t border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-[#140f26] hover:bg-[#1f173b] text-zinc-300 transition-colors"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 text-zinc-500 cursor-not-allowed"
            >
              <span>Out of Stock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

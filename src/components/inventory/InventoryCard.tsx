import React from 'react';
import { InventoryItem } from '../../types/inventory';
import { StatusBadge } from '../common/Badge';
import { MapPin, Edit, Trash2, ArrowRightCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface InventoryCardProps {
  item: InventoryItem;
  onSelect: (item: InventoryItem) => void;
  onBorrow: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onSelect,
  onBorrow,
  onEdit,
  onDelete,
}) => {
  const { isLeadOrAdmin } = useAuth();
  const availablePct = Math.round((item.available_qty / (item.total_qty || 1)) * 100);

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-[#0c0819]/85 border border-purple-900/30 hover:border-purple-600/50 transition-all p-5 group shadow-xl hover:shadow-2xl hover:shadow-purple-950/40 space-y-4">
      {/* Top Header Row: Category, Location, and Status Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-900/50">
            {item.category}
          </span>
          {item.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-[#120b24] px-2.5 py-0.5 rounded-lg border border-purple-900/30">
              <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate max-w-[120px]">{item.location}</span>
            </span>
          )}
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Body info */}
      <div onClick={() => onSelect(item)} className="cursor-pointer space-y-1.5 flex-1">
        <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {item.name}
        </h4>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {item.description || 'No detailed description provided for this component.'}
        </p>
      </div>

      {/* Stock status indicator */}
      <div className="pt-2 border-t border-purple-950/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Available Stock:</span>
          <span className="font-bold text-white">
            <span className={item.available_qty <= item.min_threshold ? 'text-amber-400' : 'text-purple-300'}>
              {item.available_qty}
            </span>{' '}
            / {item.total_qty}
          </span>
        </div>

        <div className="w-full bg-[#16102a] h-1.5 rounded-full overflow-hidden border border-purple-950">
          <div
            className={`h-full transition-all duration-300 ${
              availablePct > 40
                ? 'bg-gradient-to-r from-purple-600 to-white'
                : availablePct > 15
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${availablePct}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {item.datasheet_url ? (
            <a
              href={item.datasheet_url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              title="View Datasheet"
            >
              <span>Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : <div />}

          <button
            onClick={() => onSelect(item)}
            className="text-[11px] text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            Details →
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-purple-950 flex items-center gap-2">
          <button
            onClick={() => onBorrow(item)}
            disabled={item.available_qty <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              item.available_qty > 0 ? 'btn-purple-glow' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <ArrowRightCircle className="w-3.5 h-3.5" />
            <span>{item.available_qty > 0 ? 'Borrow Item' : 'Out of Stock'}</span>
          </button>

          {isLeadOrAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
                title="Edit Item"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

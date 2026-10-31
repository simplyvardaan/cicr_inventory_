import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ActivityAction } from '../../types/inventory';
import { CheckCircle2, PlusCircle, RefreshCw, XCircle, Clock, FileEdit, Trash2, LogIn } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const { logs } = useInventory();

  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'CREATE_ITEM':
        return {
          icon: <PlusCircle className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'UPDATE_ITEM':
        return {
          icon: <FileEdit className="w-4 h-4 text-purple-300" />,
          color: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        };
      case 'DELETE_ITEM':
        return {
          icon: <Trash2 className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      case 'BORROW_REQUEST':
        return {
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'BORROW_APPROVED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-purple-300" />,
          color: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
        };
      case 'BORROW_REJECTED':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      case 'ITEM_RETURNED':
        return {
          icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      default:
        return {
          icon: <LogIn className="w-4 h-4 text-zinc-400" />,
          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0c0819]/80 border border-purple-900/30 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Lab Activity & Audit Trail</h3>
          <p className="text-xs text-zinc-400">Chronological history of club items & borrowings</p>
        </div>
        <span className="text-xs text-zinc-500">{logs.length} logged events</span>
      </div>

      <div className="divide-y divide-purple-950/60 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">No activity recorded yet.</div>
        ) : (
          logs.slice(0, 10).map((log) => {
            const badge = getActionBadge(log.action);
            return (
              <div key={log.id} className="py-3 flex items-start gap-3 group">
                <div className={`p-1.5 rounded-xl border shrink-0 mt-0.5 ${badge.color}`}>
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {log.user_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{log.details}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

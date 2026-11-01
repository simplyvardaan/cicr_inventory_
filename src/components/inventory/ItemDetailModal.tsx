import React, { useState } from 'react';
import { InventoryItem, isReturnRequested } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { StatusBadge } from '../common/Badge';
import { DragToConfirm } from '../ui/drag-to-confirm';
import {
  X,
  MapPin,
  ExternalLink,
  Layers,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Pencil,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onBorrow: (item: InventoryItem) => void;
  isAdmin?: boolean;
  onEdit?: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onBorrow,
  isAdmin,
  onEdit,
}) => {
  const { user } = useAuth();
  const { requests, requestItemReturn } = useInventory();
  const { showToast } = useToast();

  const [submittingReturnId, setSubmittingReturnId] = useState<string | null>(null);
  const [confirmReturnId, setConfirmReturnId] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState('');

  if (!item) return null;

  const itemRequests = requests.filter((r) => r.item_id === item.id);

  // Active loans strictly belonging to the currently logged in user
  const myActiveLoans = requests.filter(
    (r) =>
      r.item_id === item.id &&
      r.status === 'approved' &&
      ((user?.id && r.user_id === user.id) ||
        (user?.email && r.user_email?.toLowerCase() === user.email.toLowerCase()))
  );

  const handleConfirmReturn = async (requestId: string) => {
    setSubmittingReturnId(requestId);
    const res = await requestItemReturn(requestId, returnNote.trim() || undefined);
    setSubmittingReturnId(null);
    setConfirmReturnId(null);
    setReturnNote('');

    if (res.success) {
      showToast(
        'success',
        'Return Request Sent to Admin',
        'Your return request has been submitted to the Admin Portal. Once an admin approves it, the component will be restocked.'
      );
    } else {
      showToast('error', 'Return Request Failed', res.error || 'Failed to submit return request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f0e1a] border-2 border-slate-200 dark:border-[#201d33] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-900/20 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Mini Bar: Status Badge + Stock Count + Close X */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={item.status} />
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60">
              {item.available_qty} / {item.total_qty} Available
            </span>
            {myActiveLoans.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-purple-900/50 dark:text-purple-300 border border-blue-200 dark:border-purple-700">
                <PackageCheck className="w-3 h-3 text-blue-600 dark:text-purple-400" />
                <span>Issued to You</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body in Exact Order: Name -> Description -> Category -> Slide -> Edit -> Activity */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 no-scrollbar text-xs">
          {/* 1. Component Name */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {item.name}
            </h2>
          </div>

          {/* 2. Description */}
          <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
            {item.description || 'Standard laboratory hardware component for robotics projects and experimental prototyping.'}
          </div>

          {/* 3. Category & Hardware Specs Metadata */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {/* Category Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{item.category}</span>
            </span>

            {/* Storage Location Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800/80 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60">
              <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-purple-400 shrink-0" />
              <span>{item.location}</span>
            </span>

            {/* Datasheet Link */}
            {item.datasheet_url && (
              <a
                href={item.datasheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800/50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Datasheet</span>
              </a>
            )}
          </div>

          {/* User's Active Issued Loans (for return workflow if issued to user) */}
          {myActiveLoans.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-[#16102a] border border-blue-200 dark:border-purple-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Your Active Checkout
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-600/10 text-blue-700 dark:bg-purple-500/20 dark:text-purple-300 border border-blue-300 dark:border-purple-700/60">
                  {myActiveLoans.reduce((sum, l) => sum + l.quantity, 0)} Units in Possession
                </span>
              </div>

              {myActiveLoans.map((loan) => {
                const isReturning = isReturnRequested(loan);
                const isConfirming = confirmReturnId === loan.id;

                return (
                  <div
                    key={loan.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#0d091e] border border-blue-100 dark:border-purple-900/40 space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{loan.quantity}x {loan.item_name}</span>
                          <span className="text-blue-600 dark:text-purple-400 font-semibold font-mono text-[11px]">
                            ({loan.project_name})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Issued: {loan.borrow_date || 'Recently'}</span>
                          <span>&bull;</span>
                          <span>Expected Return: <strong className="text-slate-700 dark:text-zinc-300">{loan.expected_return_date}</strong></span>
                        </div>
                      </div>

                      {!isConfirming && (
                        <div>
                          {isReturning ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Return Request Sent (Awaiting Admin)</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmReturnId(loan.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return Component</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isConfirming && (
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                        <div className="flex items-start gap-1.5 text-slate-700 dark:text-zinc-300 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <span>Clearance request will be dispatched to Admin Portal.</span>
                        </div>
                        <input
                          type="text"
                          value={returnNote}
                          onChange={(e) => setReturnNote(e.target.value)}
                          placeholder="Optional return notes (condition, shelf)..."
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmReturnId(null);
                              setReturnNote('');
                            }}
                            className="px-3 py-1 text-slate-600 dark:text-zinc-400 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmReturn(loan.id)}
                            disabled={submittingReturnId === loan.id}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{submittingReturnId === loan.id ? 'Submitting...' : 'Send Return Request'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Slide to Request Item */}
          <div className="pt-1">
            {item.available_qty > 0 ? (
              <div className="w-full">
                <DragToConfirm
                  size="lg"
                  label="Slide to Request Item"
                  confirmedLabel="Item Selected!"
                  actionType="confirm"
                  variant="default"
                  onConfirm={() => {
                    setTimeout(() => {
                      onClose();
                      onBorrow(item);
                    }, 350);
                  }}
                />
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-2xl bg-red-50 dark:bg-rose-950/30 border border-red-200 dark:border-rose-900/60 text-center font-bold text-xs text-red-700 dark:text-rose-300">
                Out of Stock — 0 Units Currently Available
              </div>
            )}
          </div>

          {/* 5. Edit (Admin Clearance Only) */}
          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#18142b] dark:hover:bg-[#231e3b] dark:text-purple-300 border border-slate-300 dark:border-purple-800/60 shadow-sm transition-all cursor-pointer active:scale-98"
              title="Edit Component (Admin Clearance)"
            >
              <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
              <span>Edit Component</span>
            </button>
          )}

          {/* 6. Recent Activity */}
          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
              <span>Recent Activity ({itemRequests.length})</span>
            </div>

            {itemRequests.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-1">
                No requisition records for this component.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar pr-1">
                {itemRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-[#14141c] border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div className="truncate min-w-0 pr-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {req.user_name}
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400"> ({req.quantity} units)</span>
                      <span className="text-slate-400 dark:text-zinc-500"> | {req.project_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

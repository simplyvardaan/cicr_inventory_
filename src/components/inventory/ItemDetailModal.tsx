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
  Calendar,
  ExternalLink,
  Layers,
  FileText,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
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
        'Your return request has been submitted to the Admin Portal. Once an admin inspects and approves it, the component will be restocked.'
      );
    } else {
      showToast('error', 'Return Request Failed', res.error || 'Failed to submit return request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/15 max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={item.status} />
              {myActiveLoans.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-700 dark:bg-purple-900/50 dark:text-purple-300 border border-blue-300 dark:border-purple-700">
                  <PackageCheck className="w-3 h-3 text-blue-600 dark:text-purple-400" />
                  <span>Issued to You</span>
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h3>
            <p className="text-xs text-blue-600 dark:text-purple-400 font-bold">{item.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-bold">Available Units</span>
              <span className="text-2xl font-black text-blue-600 dark:text-purple-400">{item.available_qty}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-bold">Total Stock</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{item.total_qty}</span>
            </div>
          </div>

          {/* ACTIVE ISSUED LOANS (Visible ONLY to the borrower who issued it) */}
          {myActiveLoans.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#150e2c] border-2 border-blue-200 dark:border-purple-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 dark:text-purple-400" />
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
                    className="p-3 rounded-xl bg-white dark:bg-[#0d091e] border border-blue-100 dark:border-purple-900/40 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{loan.quantity}x {loan.item_name}</span>
                          <span className="text-blue-600 dark:text-purple-400 font-semibold font-mono text-[11px]">
                            ({loan.project_name})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Issued: {loan.borrow_date || 'Recently'}</span>
                          <span>&bull;</span>
                          <span>Expected Return: <strong className="text-slate-700 dark:text-zinc-300">{loan.expected_return_date}</strong></span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {!isConfirming && (
                        <div>
                          {isReturning ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[11px] animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Return Request Sent (Awaiting Admin)</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmReturnId(loan.id)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return Component</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Confirmation Prompt */}
                    {isConfirming && (
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                        <div className="flex items-start gap-2 text-slate-700 dark:text-zinc-300 text-[11px]">
                          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <span>
                            Returning this component will send a clearance request to the <strong>Admin Portal</strong>. An administrator will inspect and approve the return before stock is updated.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={returnNote}
                          onChange={(e) => setReturnNote(e.target.value)}
                          placeholder="Optional return notes (e.g., condition, drawer returned to)..."
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:border-blue-500 dark:focus:border-purple-500"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmReturnId(null);
                              setReturnNote('');
                            }}
                            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmReturn(loan.id)}
                            disabled={submittingReturnId === loan.id}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{submittingReturnId === loan.id ? 'Submitting...' : 'Send Return Request to Admin'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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
                      <span className="text-slate-500 dark:text-zinc-500"> | {req.project_name}</span>
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

        {/* Footer: Prominent DragToConfirm or Status */}
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
          {item.available_qty > 0 ? (
            <div className="w-full max-w-md sm:max-w-lg">
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
                  }, 400);
                }}
              />
            </div>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm bg-red-50 text-red-700 border-2 border-red-300 cursor-not-allowed shadow-sm"
            >
              <span>Out of Stock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

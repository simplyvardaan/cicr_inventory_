import React, { useState } from 'react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { X, Send, Calendar, AlertCircle, LogIn, Sparkles } from 'lucide-react';

interface BorrowModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const { submitBorrowRequest } = useInventory();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    .toISOString()
    .split('T')[0];
  const [expectedReturnDate, setExpectedReturnDate] = useState(defaultDate);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!projectName.trim() || !purpose.trim()) {
      setErrorMsg('Please specify the Project Name and Purpose.');
      return;
    }

    if (quantity < 1 || quantity > item.available_qty) {
      setErrorMsg(`Quantity must be between 1 and ${item.available_qty}`);
      return;
    }

    if (!expectedReturnDate) {
      setErrorMsg('Please select an expected return date.');
      return;
    }

    setLoading(true);
    const res = await submitBorrowRequest({
      itemId: item.id,
      quantity,
      projectName: projectName.trim(),
      purpose: purpose.trim(),
      expectedReturnDate,
    });
    setLoading(false);

    if (res.success) {
      showToast(
        'success',
        'Request Submitted!',
        `Your request for ${quantity}x "${item.name}" has been logged for lab admin approval.`
      );
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to submit borrow request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0918] border border-purple-900/40 rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(147,51,234,0.35)] overflow-hidden">
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div>
            <h3 className="text-base font-bold text-white">Borrow Equipment Request</h3>
            <p className="text-xs text-zinc-400">
              Submit component requisition to CICR Lab Inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Component Card */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#080512] border border-purple-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-purple-300 block">{item.category}</span>
            <h4 className="text-sm font-bold text-white">{item.name}</h4>
            <span className="text-xs text-zinc-400">{item.location}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Available</span>
            <span className="text-lg font-black text-purple-200">{item.available_qty}</span>
            <span className="text-[10px] text-zinc-500 block">units</span>
          </div>
        </div>

        {!user ? (
          <div className="p-5 rounded-2xl bg-[#120d24] border border-purple-800/40 text-center space-y-3">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Sign In Required</h4>
            <p className="text-xs text-zinc-300">
              Please sign in with your college credentials before requesting equipment.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="btn-purple-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Borrow</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#080512] border border-purple-900/30 text-zinc-300 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Borrower Profile</span>
                <span className="font-semibold text-white">{profile?.full_name || user.email}</span>
              </div>
              <span className="text-[11px] text-purple-300 font-mono">
                {profile?.roll_number || ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  Quantity Required (Max {item.available_qty})
                </label>
                <input
                  type="number"
                  min="1"
                  max={item.available_qty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  required
                  value={expectedReturnDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Project / Hackathon Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Autonomous Maze Rover, Drone Swarm"
                className="w-full px-3 py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Purpose & Brief Usage Description *
              </label>
              <textarea
                rows={2}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe how the component will be integrated in your project..."
                className="w-full px-3 py-2 bg-[#080512] border border-[#241a3d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-white placeholder-zinc-500 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-purple-900/30 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#140f26] hover:bg-[#1f173b] text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-purple-glow flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Confirm Borrow Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

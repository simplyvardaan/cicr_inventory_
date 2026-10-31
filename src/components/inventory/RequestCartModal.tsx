import React, { useState } from 'react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { DragToConfirm } from '../ui/drag-to-confirm';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Calendar,
  Send,
  Boxes,
  Clock
} from 'lucide-react';

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface RequestCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const RequestCartModal: React.FC<RequestCartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const { user, profile } = useAuth();
  const { submitBorrowRequest } = useInventory();
  const { showToast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [purpose, setPurpose] = useState('');
  
  // Default expected return date: 7 days from today
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [returnDate, setReturnDate] = useState(defaultDate.toISOString().split('T')[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalUnits = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleDispatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your hardware cart is empty.');
      return;
    }

    if (!projectName.trim() || !purpose.trim() || !returnDate) {
      setErrorMsg('Please provide a Project Name, Purpose, and Expected Return Date.');
      return;
    }

    setIsSubmitting(true);
    try {
      let failureCount = 0;
      for (const cartItem of cart) {
        const res = await submitBorrowRequest({
          itemId: cartItem.item.id,
          quantity: cartItem.quantity,
          projectName: projectName.trim(),
          purpose: purpose.trim(),
          expectedReturnDate: returnDate,
        });

        if (!res.success) {
          failureCount++;
        }
      }

      if (failureCount === 0) {
        showToast(
          'success',
          'Consolidated Requisition Dispatched!',
          `Successfully submitted request for ${totalUnits} hardware component(s).`
        );
        onClearCart();
        onClose();
      } else {
        showToast(
          'warning',
          'Partial Submission',
          `Some items could not be requested. Please check requests queue.`
        );
      }
    } catch {
      setErrorMsg('Failed to dispatch requisition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f0f14] border border-[#232330] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-[#2ee59d] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">Hardware Request Cart</h3>
              <p className="text-xs text-zinc-400">
                {cart.length} unique component(s) • {totalUnits} total units staged
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
              <Boxes className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-300 font-semibold text-sm">Hardware cart is empty</p>
              <p className="text-zinc-500">
                Browse the Component Vault and click &quot;+ Add to Cart&quot; to stage equipment for loan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-semibold">
                <span>STAGED HARDWARE</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#14141c] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {item.available_qty} In Vault
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                    <p className="text-zinc-400 text-[11px] truncate">{item.location}</p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-white text-xs">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= item.available_qty}
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Loan Details Form */}
              <form onSubmit={handleDispatch} className="pt-3 border-t border-zinc-800 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Project / Competition Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Autonomous Maze Rover"
                      className="w-full px-3.5 py-2.5 bg-[#14141c] border border-zinc-800 focus:border-purple-500 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Expected Return Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#14141c] border border-zinc-800 focus:border-purple-500 rounded-xl text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Purpose / Technical Scope *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Specify project requirements, lab session testing, or breadboard assembly..."
                    className="w-full px-3.5 py-2.5 bg-[#14141c] border border-zinc-800 focus:border-purple-500 rounded-xl text-white outline-none resize-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-[#14141c] border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Borrower Identity:</span>
                  <strong className="text-white">
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'} ({user?.email})
                  </strong>
                </div>

                <div className="pt-4 flex justify-center items-center w-full">
                  <DragToConfirm
                    size="md"
                    label={isSubmitting ? 'Dispatching Requisition...' : 'Slide to Dispatch Requisition'}
                    confirmedLabel="Requisition Dispatched!"
                    actionType="submit"
                    variant="default"
                    className="w-full max-w-sm mx-auto"
                    disabled={isSubmitting || cart.length === 0}
                    onConfirm={() => {
                      handleDispatch();
                    }}
                  />
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};


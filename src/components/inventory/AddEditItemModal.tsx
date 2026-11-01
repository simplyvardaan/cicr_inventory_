import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory, ItemStatus } from '../../types/inventory';
import { CATEGORIES } from '../../lib/sampleData';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { X, Save, AlertCircle, Pencil, PlusCircle } from 'lucide-react';

interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: InventoryItem | null;
}

export const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const { addItem, updateItem } = useInventory();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Microcontrollers & SBCs');
  const [totalQty, setTotalQty] = useState(1);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = !!initialItem;

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setCategory(initialItem.category || 'Microcontrollers & SBCs');
      setTotalQty(Number(initialItem.total_qty ?? 0));
      setDescription(initialItem.description || '');
    } else {
      setName('');
      setCategory('Microcontrollers & SBCs');
      setTotalQty(1);
      setDescription('');
    }
    setErrorMsg('');
  }, [initialItem, isOpen]);

  if (!isOpen || !isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAdmin) {
      setErrorMsg('Admin clearance required to edit or create components.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Component Name is required.');
      return;
    }

    if (totalQty < 0) {
      setErrorMsg('Total units cannot be negative.');
      return;
    }

    setLoading(true);

    // Calculate available units and status based on current active loans
    const currentlyIssued = isEditing && initialItem
      ? Math.max(0, (initialItem.total_qty ?? 0) - (initialItem.available_qty ?? 0))
      : 0;

    const calculatedAvailable = Math.max(0, totalQty - currentlyIssued);

    const calculatedStatus: ItemStatus =
      calculatedAvailable <= 0
        ? 'Out of Stock'
        : totalQty > 0 && calculatedAvailable / totalQty < 0.5
        ? 'Low Stock'
        : 'In Stock';

    if (isEditing && initialItem) {
      const res = await updateItem(initialItem.id, {
        name: name.trim(),
        category,
        total_qty: Number(totalQty),
        available_qty: Number(calculatedAvailable),
        description: description.trim(),
        status: calculatedStatus,
        min_threshold: Number(initialItem.min_threshold ?? 2),
        location: initialItem.location || '',
        condition: initialItem.condition || 'Good',
        datasheet_url: initialItem.datasheet_url,
      });

      setLoading(false);
      if (res.success) {
        showToast(
          'success',
          'Component Updated',
          `"${name}" details & stock levels have been updated.`
        );
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to update component');
      }
    } else {
      const res = await addItem({
        name: name.trim(),
        category,
        total_qty: Number(totalQty),
        available_qty: Number(totalQty),
        min_threshold: 2,
        description: description.trim(),
        status: calculatedStatus,
        location: '',
        condition: 'Good',
      });

      setLoading(false);
      if (res.success) {
        showToast('success', 'Component Added', `"${name}" added to catalog.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to add component');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0c0a17] border border-zinc-800 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="select-none bg-[#131024] border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {isEditing ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Component' : 'Add Component'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isEditing ? 'Admin clearance: modify component specifications' : 'Register equipment into the catalog'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body: Exact Requested Order: Name -> Domain -> Total Units -> Description */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs no-scrollbar">
          {/* 1. Name */}
          <div>
            <label className="block font-bold text-zinc-200 mb-1.5 text-xs">
              Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HC-SR04 Ultrasonic Distance Sensor"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-zinc-800 focus:border-purple-500 rounded-xl text-white placeholder-zinc-500 font-semibold text-xs outline-none transition-colors"
            />
          </div>

          {/* 2. Domain (Category) */}
          <div>
            <label className="block font-bold text-zinc-200 mb-1.5 text-xs">
              Domain <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full px-3.5 py-2.5 bg-[#141224] border border-zinc-800 focus:border-purple-500 rounded-xl text-white font-semibold text-xs outline-none transition-colors cursor-pointer"
            >
              {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                <option key={c} value={c} className="bg-[#141224] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Total Units */}
          <div>
            <label className="block font-bold text-zinc-200 mb-1.5 text-xs">
              Total Units <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={totalQty}
              onChange={(e) => {
                const raw = e.target.value;
                const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                setTotalQty(val);
              }}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-zinc-800 focus:border-purple-500 rounded-xl text-white font-mono font-bold text-xs outline-none transition-colors"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Set 0 to mark component as out of stock / depleted
            </span>
          </div>

          {/* 4. Description */}
          <div>
            <label className="block font-bold text-zinc-200 mb-1.5 text-xs">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Component specifications, details, or project notes..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-zinc-800 focus:border-purple-500 rounded-xl text-white placeholder-zinc-500 font-medium text-xs outline-none resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Component'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

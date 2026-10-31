import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { CATEGORIES } from '../../lib/sampleData';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../common/Toast';
import { X, Save, AlertCircle, PlusCircle } from 'lucide-react';

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
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Microcontrollers & SBCs');
  const [location, setLocation] = useState('');
  const [totalQty, setTotalQty] = useState(1);
  const [availableQty, setAvailableQty] = useState(1);
  const [minThreshold, setMinThreshold] = useState(2);
  const [description, setDescription] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = !!initialItem;

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setLocation(initialItem.location);
      setTotalQty(initialItem.total_qty);
      setAvailableQty(initialItem.available_qty);
      setMinThreshold(initialItem.min_threshold);
      setDescription(initialItem.description || '');
      setDatasheetUrl(initialItem.datasheet_url || '');
    } else {
      setName('');
      setCategory('Microcontrollers & SBCs');
      setLocation('Lab 2, Cabinet A1');
      setTotalQty(5);
      setAvailableQty(5);
      setMinThreshold(2);
      setDescription('');
      setDatasheetUrl('');
    }
    setErrorMsg('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !location.trim()) {
      setErrorMsg('Please enter component name and storage location.');
      return;
    }

    if (totalQty < 0 || availableQty < 0) {
      setErrorMsg('Quantities cannot be negative.');
      return;
    }

    if (availableQty > totalQty) {
      setErrorMsg('Available quantity cannot exceed total quantity.');
      return;
    }

    setLoading(true);

    const calculatedStatus: InventoryItem['status'] =
      availableQty <= 0 ? 'Out of Stock' : availableQty <= minThreshold ? 'Low Stock' : 'In Stock';

    if (isEditing && initialItem) {
      const res = await updateItem(initialItem.id, {
        name: name.trim(),
        category,
        location: location.trim(),
        total_qty: Number(totalQty),
        available_qty: Number(availableQty),
        min_threshold: Number(minThreshold),
        status: calculatedStatus,
        description: description.trim(),
        datasheet_url: datasheetUrl.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        showToast('success', 'Item Updated', `"${name}" details have been updated.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to update item');
      }
    } else {
      const res = await addItem({
        name: name.trim(),
        category,
        location: location.trim(),
        total_qty: Number(totalQty),
        available_qty: Number(availableQty),
        min_threshold: Number(minThreshold),
        status: calculatedStatus,
        description: description.trim(),
        datasheet_url: datasheetUrl.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        showToast('success', 'Item Added', `"${name}" added to CICR inventory.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to add item');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/15 max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-purple-950/60 text-blue-600 dark:text-purple-400 border border-blue-200 dark:border-purple-800">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Lab Component' : 'Add New Equipment / Part'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEditing ? 'Modify specifications or stock' : 'Register items in the CICR database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
          {/* Name */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-zinc-200 mb-1">
              Component Name <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ESP32 Development Board"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#14141c] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="block font-bold text-slate-900 dark:text-zinc-200 mb-1">
                Category <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#14141c] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#0c0918] text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block font-bold text-slate-900 dark:text-zinc-200 mb-1">
                Lab Storage Location <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lab 2, Cabinet A1, Bin 4"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#14141c] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none transition-all"
              />
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080512] border-2 border-slate-200 dark:border-zinc-800">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Total Qty</label>
              <input
                type="number"
                min="0"
                required
                value={totalQty}
                onChange={(e) => setTotalQty(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-2 bg-white dark:bg-[#120d24] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-lg text-slate-900 dark:text-white font-black outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Available Qty</label>
              <input
                type="number"
                min="0"
                required
                value={availableQty}
                onChange={(e) => setAvailableQty(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-2 bg-white dark:bg-[#120d24] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-lg text-blue-600 dark:text-purple-400 font-black outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Min Alert Qty</label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-2 bg-white dark:bg-[#120d24] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-lg text-amber-600 dark:text-amber-400 font-black outline-none"
              />
            </div>
          </div>

          {/* Datasheet URL */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-zinc-200 mb-1">Datasheet URL (Optional)</label>
            <input
              type="url"
              value={datasheetUrl}
              onChange={(e) => setDatasheetUrl(e.target.value)}
              placeholder="https://docs.espressif.com/..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#14141c] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-zinc-200 mb-1">Description &amp; Specs</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pins, voltage ratings, communication protocols, suitable projects..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#14141c] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none resize-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white shadow-md shadow-blue-600/25 dark:shadow-purple-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Component' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

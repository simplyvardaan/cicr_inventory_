import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory, ItemStatus } from '../../types/inventory';
import { CATEGORIES } from '../../lib/sampleData';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../common/Toast';
import { X, Save, AlertCircle, PlusCircle, Pencil, Info } from 'lucide-react';

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
  const [condition, setCondition] = useState('Good');
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
      setTotalQty(Number(initialItem.total_qty ?? 0));
      setAvailableQty(Number(initialItem.available_qty ?? 0));
      setMinThreshold(Number(initialItem.min_threshold ?? 2));
      setCondition(initialItem.condition || 'Good');
      setDescription(initialItem.description || '');
      setDatasheetUrl(initialItem.datasheet_url || '');
    } else {
      setName('');
      setCategory('Microcontrollers & SBCs');
      setLocation('Lab 2, Cabinet A1');
      setTotalQty(5);
      setAvailableQty(5);
      setMinThreshold(2);
      setCondition('Good');
      setDescription('');
      setDatasheetUrl('');
    }
    setErrorMsg('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Component name is required.');
      return;
    }

    if (!location.trim()) {
      setErrorMsg('Please specify lab storage location.');
      return;
    }

    if (totalQty < 0 || availableQty < 0) {
      setErrorMsg('Stock quantities cannot be negative.');
      return;
    }

    if (availableQty > totalQty) {
      setErrorMsg('Available units cannot exceed total stock.');
      return;
    }

    setLoading(true);

    const calculatedStatus: ItemStatus =
      availableQty <= 0
        ? 'Out of Stock'
        : totalQty > 0 && availableQty / totalQty < 0.5
        ? 'Low Stock'
        : 'In Stock';

    if (isEditing && initialItem) {
      const res = await updateItem(initialItem.id, {
        name: name.trim(),
        category,
        location: location.trim(),
        total_qty: Number(totalQty),
        available_qty: Number(availableQty),
        min_threshold: Number(minThreshold),
        condition: condition.trim() || 'Good',
        status: calculatedStatus,
        description: description.trim(),
        datasheet_url: datasheetUrl.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        showToast(
          'success',
          'Component Updated',
          `"${name}" details & stock levels have been updated in the database.`
        );
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to update component');
      }
    } else {
      const res = await addItem({
        name: name.trim(),
        category,
        location: location.trim(),
        total_qty: Number(totalQty),
        available_qty: Number(availableQty),
        min_threshold: Number(minThreshold),
        condition: condition.trim() || 'Good',
        status: calculatedStatus,
        description: description.trim(),
        datasheet_url: datasheetUrl.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        showToast('success', 'Component Added', `"${name}" added to CICR catalog.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to add component');
      }
    }
  };

  const calculatedStatusPreview =
    availableQty <= 0
      ? 'Out of Stock (Depleted)'
      : totalQty > 0 && availableQty / totalQty < 0.5
      ? 'Low Stock'
      : 'In Stock';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-purple-950/60 dark:text-purple-300 border border-blue-200 dark:border-purple-800/60 shrink-0">
              {isEditing ? <Pencil className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                {isEditing ? 'Edit Lab Component' : 'Add New Equipment / Part'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {isEditing
                  ? 'Admin clearance: modify specifications, stock quantities & location'
                  : 'Register a hardware component into the CICR inventory database'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs no-scrollbar">
          {/* Component Name */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">
              Component Name <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HC-SR04 Ultrasonic Distance Sensor"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-semibold outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">
                Category Domain <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white font-semibold outline-none transition-colors"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#14141c] text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Location */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">
                Lab Storage Location <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sensors Bay - Rack S3, Box 1"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-semibold outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quantities Card with 0 Support */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                Inventory Stock Levels
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                Set 0 to mark depleted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Total Stock Units <span className="text-red-500">*</span>
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
                    if (availableQty > val) {
                      setAvailableQty(val);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a1a24] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white font-mono font-black text-sm outline-none"
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  Total owned by laboratory
                </span>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Available for Checkout <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalQty}
                  required
                  value={availableQty}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                    setAvailableQty(Math.min(totalQty, val));
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a1a24] border-2 border-slate-300 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-blue-600 dark:text-purple-400 font-mono font-black text-sm outline-none"
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  Currently on the shelf
                </span>
              </div>
            </div>

            {/* Calculated Status Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Auto-Evaluated Status:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono border ${
                  availableQty <= 0
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                    : totalQty > 0 && availableQty / totalQty < 0.5
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                {calculatedStatusPreview}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Condition */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">Physical Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white font-semibold outline-none transition-colors"
              >
                <option value="Good">Good — Operational</option>
                <option value="New">New — Unused</option>
                <option value="Fair">Fair — Usable with minor wear</option>
                <option value="Needs Check">Needs Testing / Calibration</option>
              </select>
            </div>

            {/* Datasheet URL */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">
                Datasheet / Docs URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={datasheetUrl}
                onChange={(e) => setDatasheetUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-semibold outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description & Specifications */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">
              Description &amp; Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pinouts, operational voltage, communication protocols, pin mapping or project notes..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium outline-none resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white shadow-md shadow-blue-600/25 dark:shadow-purple-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : isEditing ? 'Update Component' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

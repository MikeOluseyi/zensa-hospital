"use client";

import { useState } from "react";
import { X, PackagePlus, Loader2, Hash, Banknote, Tag, FileText } from "lucide-react";
import api from "@/lib/api";
import type { InventoryItem } from "@/services/inventory";


interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestockInventoryModal({ item, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [costPrice, setCostPrice] = useState(item.costPrice || 0);
  const [sellingPrice, setSellingPrice] = useState(item.sellingPrice || 0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (quantity <= 0) return;

    setSaving(true);
    try {
      await api.patch(`/inventory/${item.id}/add-stock`, {
        quantity,
        costPrice,
        sellingPrice,
        notes,
      });
      onSuccess();
    } catch {
      alert("Failed to restock item.");
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <PackagePlus size={18} className="text-blue-600" />
            Restock {item.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {/* Current Stock */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Current Stock</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{item.quantity}</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Hash size={12} className="inline mr-1" />
              Quantity To Add <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="0"
              required
              autoFocus
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Banknote size={12} className="inline mr-1" />
                Cost Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Tag size={12} className="inline mr-1" />
                Selling Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice || ""}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <FileText size={12} className="inline mr-1" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || quantity <= 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Restock"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

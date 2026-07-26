"use client";

import { useState } from "react";
import api from "@/lib/api";
import { X, Plus, Package, Save, Loader2, Tag, Hash, Boxes, DollarSign, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface InventoryForm {
  name: string;
  type: "MEDICATION" | "SUPPLY" | "EQUIPMENT" | "CONSUMABLE" | "";
  sku: string;
  quantity: number;
  saleUnit: string;
  baseUnit: string;
  unitsPerSaleUnit: number;
  reorderLevel: number;
  sellingPrice: number;
  supplier: string;
  expiryDate: string;
}

export default function AddInventoryModal({ onClose, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InventoryForm>({
    name: "",
    type: "",
    sku: "",
    quantity: 0,
    saleUnit: "",
    baseUnit: "",
    unitsPerSaleUnit: 1,
    reorderLevel: 10,
    sellingPrice: 0,
    supplier: "",
    expiryDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof InventoryForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Item name is required";
    if (!form.type) newErrors.type = "Type is required";
    if (!form.saleUnit.trim()) newErrors.saleUnit = "Sale unit required";
    if (!form.baseUnit.trim()) newErrors.baseUnit = "Base unit required";
    if (form.unitsPerSaleUnit <= 0) newErrors.unitsPerSaleUnit = "Units per sale unit must be greater than zero";
    if (form.quantity < 0) newErrors.quantity = "Quantity cannot be negative";
    if (form.reorderLevel < 0) newErrors.reorderLevel = "Reorder level cannot be negative";
    if (form.sellingPrice < 0) newErrors.unitPrice = "Price cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit() {
    if (!validate()) return;

    setSaving(true);
    try {
      await api.post("/inventory", form);
      onSuccess();
    } catch (err) {
      console.error("Failed to add inventory item:", err);
      alert("Failed to add item. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Add Inventory Item
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a new item to hospital inventory</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Tag size={14} className="inline mr-1 text-slate-400" />
                Item Name *
              </label>
              <input
                placeholder="e.g. Paracetamol 500mg"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`${inputClass} ${errors.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>
                <Hash size={14} className="inline mr-1 text-slate-400" />
                SKU / Code
              </label>
              <input
                placeholder="e.g. PAR-500"
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Type & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Boxes size={14} className="inline mr-1 text-slate-400" />
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className={`${inputClass} ${errors.type ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              >
                <option value="">Select type</option>
                <option value="MEDICATION">Medication</option>
                <option value="SUPPLY">Supply</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="CONSUMABLE">Consumable</option>
              </select>
              {errors.type && <p className={errorClass}>{errors.type}</p>}
            </div>
            <div>
              <div className="grid grid-cols-3 gap-4">

  <div>

    <label className={labelClass}>
      Sale Unit
    </label>

    <input
      value={form.saleUnit}
      onChange={(e)=>
        handleChange(
          "saleUnit",
          e.target.value
        )
      }
      placeholder="Card"
      className={inputClass}
    />

  </div>

  <div>

    <label className={labelClass}>
      Base Unit
    </label>

    <input
      value={form.baseUnit}
      onChange={(e)=>
        handleChange(
          "baseUnit",
          e.target.value
        )
      }
      placeholder="Tablet"
      className={inputClass}
    />

  </div>

  <div>
    <label className={labelClass}>
      Qty / Sale Unit
    </label>
    <input
      type="number"
      value={form.unitsPerSaleUnit}
      onChange={(e)=>
        handleChange(
          "unitsPerSaleUnit",
          Number(e.target.value)
        )
      }
      className={inputClass}
    />
  </div>
  </div>
              {errors.unit && <p className={errorClass}>{errors.unit}</p>}
            </div>
          </div>

          {/* Quantity & Reorder Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                className={`${inputClass} ${errors.quantity ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
              {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
            </div>
            <div>
              <label className={labelClass}>
                <AlertTriangle size={14} className="inline mr-1 text-slate-400" />
                Reorder Level
              </label>
              <input
                type="number"
                min={0}
                placeholder="10"
                value={form.reorderLevel}
                onChange={(e) => handleChange("reorderLevel", parseInt(e.target.value) || 0)}
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">Alert when stock falls below this</p>
            </div>
          </div>

          {/* Unit Price & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <DollarSign size={14} className="inline mr-1 text-slate-400" />
                Selling Price (₦)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={(e) => handleChange("sellingPrice", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Supplier</label>
              <input
                placeholder="e.g. Emzor Pharmaceuticals"
                value={form.supplier}
                onChange={(e) => handleChange("supplier", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className={labelClass}>Expiry Date (if applicable)</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Item
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import AddInventoryModal from "@/components/inventory/AddInventoryModal";
import RestockInventoryModal from "@/components/inventory/RestockInventoryModal";
import type { InventoryItem, InventoryImportItem } from "@/services/inventory";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Boxes,
  Beaker,
  Pill,
  Bandage,
  Archive,
  PackagePlus,
  Upload,
  FileSpreadsheet,
  FileJson,
  X,
  Download,
} from "lucide-react";


const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MEDICATION: Pill,
  SUPPLY: Boxes,
  EQUIPMENT: Beaker,
  CONSUMABLE: Bandage,
};

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  MEDICATION: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  SUPPLY: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  EQUIPMENT: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  CONSUMABLE: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filtered, setFiltered] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    let result = items;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.supplier?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter((i) => i.type === typeFilter);
    }

    setFiltered(result);
  }, [search, typeFilter, items]);

  async function loadInventory() {
    try {
      setLoading(true);
      const res = await api.get("/inventory");
      setItems(res.data);
      setFiltered(res.data);
    } catch {
      alert("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  const lowStock = items.filter((i) => i.quantity <= i.reorderLevel).length;
  const totalValue = items.reduce((sum, i) => sum + (i.sellingPrice || 0) * i.quantity, 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200" };
    }
    if (item.quantity <= item.reorderLevel) {
      return { label: "Low Stock", color: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, format: "csv" | "json") {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let payload: unknown[];

      if (format === "json") {
        payload = JSON.parse(text);
        if (!Array.isArray(payload)) throw new Error("JSON must be an array of items");
      } else {
        // Simple CSV parser
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        payload = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
          const row: Record<string, string | number> = {};
          headers.forEach((h, i) => {
            const val = values[i] ?? "";
            row[h] = isNaN(Number(val)) || val === "" ? val : Number(val);
          });
          return row;
        });
      }

      const res = await api.post("/inventory/bulk-import", {
  items: payload,
});

const {
  createdCount,
  updatedCount,
  failedCount,
  failed,
} = res.data;

if (failedCount > 0) {
  console.error("Import failures:", failed);
}

alert(
  `Created: ${createdCount}
Updated: ${updatedCount}
Failed: ${failedCount}`
);

if (failedCount > 0) {
  console.table(failed);
}
      await loadInventory();
      setShowImport(false);
    } catch (err: any) {
      alert(err?.message || "Failed to import items. Check file format.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function downloadTemplate(format: "csv" | "json") {
    const template = [
      {
        name: "Paracetamol 500mg",
        type: "MEDICATION",
        sku: "PAR-500",
        quantity: 100,
        saleUnit: "Card",
        baseUnit: "Tablet",
        unitsPerSaleUnit: 12,
        reorderLevel: 20,
        costPrice: 500,
        sellingPrice: 750,
        supplier: "Emzor Pharmaceuticals",
        expiryDate: "2027-06-30",
      },
    ];

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === "json") {
      content = JSON.stringify(template, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else {
      const headers = Object.keys(template[0]).join(",");
      const values = Object.values(template[0]).join(",");
      content = `${headers}\n${values}`;
      mimeType = "text/csv";
      extension = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_template.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} items · {lowStock} low stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">In Stock</p>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            {items.filter((i) => i.quantity > i.reorderLevel).length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">{lowStock}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Value</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">₦{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name or supplier..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        >
          <option value="ALL">All Types</option>
          <option value="MEDICATION">Medication</option>
          <option value="SUPPLY">Supply</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="CONSUMABLE">Consumable</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package size={32} />
                      <p className="text-sm font-medium text-slate-600">
                        {search || typeFilter !== "ALL" ? "No items match your filters" : "No inventory items"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const status = getStockStatus(item);
                  const TypeIcon = typeIcons[item.type] || Package;
                  const typeStyle = typeStyles[item.type] || typeStyles.CONSUMABLE;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${typeStyle.bg} flex items-center justify-center`}>
                            <TypeIcon size={14} className={typeStyle.text} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.expiryDate && (
                              <p className="text-xs text-slate-500">
                                Expires {new Date(item.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{item.quantity}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.quantity <= item.reorderLevel ? "bg-red-500" : "bg-emerald-500"}`}
                              style={{ width: `${Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium">{item.saleUnit}</div>
                          <div className="text-xs text-slate-500">
                            {item.unitsPerSaleUnit} {item.baseUnit} per {item.saleUnit}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.sellingPrice ? `₦${item.sellingPrice.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.supplier || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRestockItem(item)}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <PackagePlus size={12} />
                            Restock
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Archive item?")) return;
                              try {
                                await api.patch(`/inventory/${item.id}/archive`);
                                loadInventory();
                              } catch {
                                alert("Failed to archive item.");
                              }
                            }}
                            className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Archive size={12} />
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddInventoryModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            loadInventory();
            setShowAdd(false);
          }}
        />
      )}

      {restockItem && (
        <RestockInventoryModal
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onSuccess={() => {
            setRestockItem(null);
            loadInventory();
          }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowImport(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" />
                Import Inventory
              </h2>
              <button
                onClick={() => setShowImport(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* CSV Import */}
              <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <FileSpreadsheet size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">CSV Spreadsheet</p>
                    <p className="text-xs text-slate-500">Upload an Excel/CSV file</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, "csv")}
                  className="hidden"
                  id="csv-upload"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="csv-upload"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    {importing ? "Importing..." : "Upload CSV"}
                  </label>
                  <button
                    onClick={() => downloadTemplate("csv")}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={14} />
                    Template
                  </button>
                </div>
              </div>

              {/* JSON Import */}
              <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <FileJson size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">JSON File</p>
                    <p className="text-xs text-slate-500">Upload a JSON array of items</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileUpload(e, "json")}
                  className="hidden"
                  id="json-upload"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="json-upload"
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    {importing ? "Importing..." : "Upload JSON"}
                  </label>
                  <button
                    onClick={() => downloadTemplate("json")}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={14} />
                    Template
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Download a template to see the expected format. All items will be validated before import.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

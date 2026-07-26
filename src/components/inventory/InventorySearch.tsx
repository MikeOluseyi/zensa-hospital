"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Package, CheckCircle2, AlertTriangle, Loader2, Pill, Boxes, Beaker, Bandage } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  type: "MEDICATION" | "SUPPLY" | "EQUIPMENT" | "CONSUMABLE";
  quantity: number;
  saleUnit: string;
  baseUnit: string;
  unitsPerSaleUnit: number;
  sellingPrice: number | null;
  sku: string | null;
}

interface Props {
  onSelect: (item: InventoryItem) => void;
  placeholder?: string;
  filterType?: "MEDICATION" | "SUPPLY" | "EQUIPMENT" | "CONSUMABLE";
}

const typeIcons: Record<string, any> = {
  MEDICATION: Pill,
  SUPPLY: Boxes,
  EQUIPMENT: Beaker,
  CONSUMABLE: Bandage,
};

const typeStyles: Record<string, { bg: string; text: string }> = {
  MEDICATION: { bg: "bg-blue-50", text: "text-blue-600" },
  SUPPLY: { bg: "bg-amber-50", text: "text-amber-600" },
  EQUIPMENT: { bg: "bg-purple-50", text: "text-purple-600" },
  CONSUMABLE: { bg: "bg-green-50", text: "text-green-600" },
};

export default function InventorySearch({ onSelect, placeholder = "Search inventory...", filterType }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/inventory/search?q=${encodeURIComponent(query)}${filterType ? `&type=${filterType}` : ""}`);
        setResults(res.data);
      } catch (err) {
        console.error("Inventory search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filterType]);

  const handleSelect = (item: InventoryItem) => {
    onSelect(item);
    setQuery(item.name);
    setResults([]);
    setSelected(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(false);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { icon: AlertTriangle, color: "text-red-500", label: "Out of stock" };
    if (quantity <= 10) return { icon: AlertTriangle, color: "text-amber-500", label: "Low stock" };
    return { icon: CheckCircle2, color: "text-emerald-500", label: "In stock" };
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full border rounded-lg pl-9 pr-10 py-2.5 text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
            ${selected ? "border-emerald-300 bg-emerald-50/30" : "border-slate-300"}
          `}
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
        )}
        {selected && !loading && (
          <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
        )}
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {results.map((item) => {
            const TypeIcon = typeIcons[item.type] || Package;
            const typeStyle = typeStyles[item.type] || typeStyles.CONSUMABLE;
            const stock = getStockStatus(item.quantity);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${typeStyle.bg} flex items-center justify-center`}>
                      <TypeIcon size={14} className={typeStyle.text} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.sku ?? "No SKU"} · {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {item.quantity} {item.saleUnit}
                    </p>
                    <div className={`flex items-center gap-1 text-xs ${stock.color}`}>
                      <stock.icon size={10} />
                      {stock.label}
                    </div>
                  </div>
                </div>
                {item.sellingPrice != null && (
                  <p className="text-xs text-slate-500 mt-1 ml-11">
                    ₦{item.sellingPrice.toLocaleString()} per {item.saleUnit}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {query.length >= 2 && !loading && results.length === 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-slate-500">No items found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, FileText, CheckCircle2, Loader2, AlertCircle, Hash } from "lucide-react";

interface ICD10Item {
  id: string;
  code: string;
  description: string;
  category?: string;
}

interface Props {
  value?: string;
  onSelect: (item: ICD10Item) => void;
  placeholder?: string;
}

export default function ICD10Search({ value, onSelect, placeholder = "Search ICD-10 code or description..." }: Props) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<ICD10Item[]>([]);
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
        const res = await api.get(`/icd10/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error("ICD-10 search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: ICD10Item) => {
    setQuery(`${item.code} — ${item.description}`);
    setResults([]);
    setSelected(true);
    onSelect(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSelected(false);
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
        {query && !loading && !selected && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <AlertCircle size={16} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
          </div>
          {results.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Hash size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    {item.category && (
                      <span className="text-xs text-slate-500">{item.category}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-2">{item.description}</p>
                </div>
                <FileText size={16} className="text-slate-300 shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {query.length >= 2 && !loading && results.length === 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Search size={24} />
            <p className="text-sm text-slate-500">No ICD-10 codes found for "{query}"</p>
            <p className="text-xs text-slate-400">Try searching by code (e.g. A00) or description</p>
          </div>
        </div>
      )}
    </div>
  );
}
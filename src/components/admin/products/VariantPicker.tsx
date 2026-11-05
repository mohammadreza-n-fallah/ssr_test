"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { useList } from "@/lib/admin";
import { formatPriceToman } from "@/lib/utils";
import type { AdminVariant } from "@/types/admin";

/** Searchable variant selector (by SKU / product name). */
export default function VariantPicker({
  onSelect,
  selectedLabel,
}: {
  onSelect: (v: AdminVariant) => void;
  selectedLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data } = useList<AdminVariant>("variants", { search: q || undefined, page_size: 15 }, { enabled: q.length > 1 });

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selectedLabel || "جستجوی محصول یا کد تنوع..."}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
        />
      </div>
      {open && q.length > 1 && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {(data?.results ?? []).length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-400">نتیجه‌ای یافت نشد</p>
          ) : (
            data?.results.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onSelect(v);
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-right text-sm hover:bg-blue-50"
              >
                <div className="min-w-0">
                  <div className="truncate text-gray-800">{v.product_name}</div>
                  <div className="ltr text-xs text-gray-400">{v.sku}</div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">{formatPriceToman(Number(v.price))}</span>
              </button>
            ))
          )}
        </div>
      )}
      {selectedLabel && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
          <Check className="h-3.5 w-3.5" />
          {selectedLabel}
        </p>
      )}
    </div>
  );
}

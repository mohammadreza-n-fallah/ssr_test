"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/utils";

/** Debounced search box. Calls onSearch with the (English-digit) query. */
export function SearchBox({
  onSearch,
  placeholder = "جستجو...",
  className,
}: {
  onSearch: (q: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

/** Horizontal filter tabs with optional live counts. */
export function FilterTabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
            value === it.value
              ? "bg-[#1e3a8a] text-white font-medium"
              : "text-gray-500 hover:text-gray-900"
          )}
        >
          {it.label}
          {it.count !== undefined && it.count > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-bold",
                value === it.value ? "bg-white/20" : "bg-gray-100 text-gray-500"
              )}
            >
              {toPersianDigits(it.count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function IconButton({
  title,
  onClick,
  children,
  tone = "default",
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger" | "primary";
}) {
  const tones = {
    default: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    danger: "text-gray-400 hover:text-red-600 hover:bg-red-50",
    primary: "text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50",
  };
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn("rounded-lg p-2 transition-colors", tones[tone])}
    >
      {children}
    </button>
  );
}

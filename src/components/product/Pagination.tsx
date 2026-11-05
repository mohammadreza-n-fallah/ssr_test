"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Compact numeric pager. RTL-aware: "next" points left, "previous" right.
export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const push = (p: number | "...") => pages.push(p);

  push(1);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) push("...");
  for (let p = start; p <= end; p++) push(p);
  if (end < totalPages - 1) push("...");
  if (totalPages > 1) push(totalPages);

  const btn =
    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors";

  return (
    <div className="flex items-center justify-center gap-2 mt-8" dir="rtl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${btn} bg-white ring-1 ring-gray-200 text-gray-600 hover:ring-[#1e3a8a] hover:text-[#1e3a8a] shadow-soft disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="صفحه قبل"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btn} ${
              p === currentPage
                ? "bg-gradient-primary text-white shadow-md scale-105"
                : "bg-white ring-1 ring-gray-200 text-gray-600 hover:ring-[#1e3a8a] hover:text-[#1e3a8a] shadow-soft"
            }`}
          >
            {toPersianDigits(p)}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${btn} bg-white ring-1 ring-gray-200 text-gray-600 hover:ring-[#1e3a8a] hover:text-[#1e3a8a] shadow-soft disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

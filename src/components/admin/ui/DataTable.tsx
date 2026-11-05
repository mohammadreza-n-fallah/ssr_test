"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  isLoading?: boolean;
  emptyText?: string;
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  skeletonRows?: number;
}

const ALIGN = { start: "text-right", center: "text-center", end: "text-left" };

export default function DataTable<T>({
  columns,
  rows,
  isLoading,
  emptyText = "موردی یافت نشد",
  rowKey,
  onRowClick,
  actions,
  skeletonRows = 8,
}: DataTableProps<T>) {
  const colCount = columns.length + (actions ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn("px-4 py-3 font-medium", ALIGN[c.align ?? "start"])}
              >
                {c.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-left font-medium">عملیات</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                {Array.from({ length: colCount }).map((__, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : !rows || rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-16 text-center">
                <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-400">{emptyText}</p>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-gray-50 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-blue-50/40"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3.5 text-gray-700",
                      ALIGN[c.align ?? "start"],
                      c.className
                    )}
                  >
                    {c.render
                      ? c.render(row)
                      : String((row as Record<string, unknown>)[c.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td
                    className="px-4 py-3.5 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

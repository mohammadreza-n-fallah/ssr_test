import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  change?: number; // percentage vs previous period
  iconClassName?: string;
}

export default function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  change,
  iconClassName,
}: StatCardProps) {
  const positive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-black text-gray-900 truncate">{value}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            iconClassName ?? "bg-blue-50 text-[#1e3a8a]"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-bold",
              positive ? "text-green-600" : "text-red-600"
            )}
          >
            {positive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {toPersianDigits(Math.abs(change))}٪
          </span>
          <span className="text-gray-400">نسبت به دوره قبل</span>
        </div>
      )}
    </div>
  );
}

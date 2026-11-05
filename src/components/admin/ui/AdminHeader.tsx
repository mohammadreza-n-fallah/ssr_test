"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AdminHeader({
  title,
  subtitle,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#1e3a8a]"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            بازگشت
          </Link>
        )}
        <h1 className="text-2xl font-black text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

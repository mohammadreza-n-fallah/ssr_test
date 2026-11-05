"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MessageSquare, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/blog", label: "نوشته‌ها", icon: FileText, exact: true },
  { href: "/admin/blog/comments", label: "دیدگاه‌ها", icon: MessageSquare },
  { href: "/admin/blog/categories", label: "دسته‌ها", icon: Boxes },
];

export default function BlogTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 w-fit">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors",
              active ? "bg-[#1e3a8a] text-white font-medium" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

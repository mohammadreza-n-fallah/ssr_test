"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Boxes,
  Tag,
  Car,
  Warehouse,
  Ticket,
  Zap,
  Bell,
  FileText,
  Star,
  Headset,
  Truck,
  FileSpreadsheet,
  Store,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import type { CCStats } from "@/types";
import { cn, toPersianDigits } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "needs_human";
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: "",
    items: [{ href: "/admin", label: "داشبورد", icon: LayoutDashboard }],
  },
  {
    title: "فروش",
    items: [
      { href: "/admin/orders", label: "سفارش‌ها", icon: ShoppingCart },
      { href: "/admin/customers", label: "مشتریان", icon: Users },
    ],
  },
  {
    title: "کاتالوگ",
    items: [
      { href: "/admin/products", label: "محصولات", icon: Package },
      { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: Boxes },
      { href: "/admin/brands", label: "برندها", icon: Tag },
      { href: "/admin/vehicles", label: "خودروها", icon: Car },
      { href: "/admin/inventory", label: "انبار و موجودی", icon: Warehouse },
    ],
  },
  {
    title: "بازاریابی",
    items: [
      { href: "/admin/coupons", label: "کدهای تخفیف", icon: Ticket },
      { href: "/admin/flash-sales", label: "فروش ویژه", icon: Zap },
      { href: "/admin/notifications", label: "اعلان‌ها", icon: Bell },
    ],
  },
  {
    title: "محتوا",
    items: [
      { href: "/admin/blog", label: "بلاگ", icon: FileText },
      { href: "/admin/reviews", label: "دیدگاه‌ها", icon: Star },
    ],
  },
  {
    title: "پشتیبانی و تنظیمات",
    items: [
      { href: "/admin/callcenter", label: "مرکز پشتیبانی", icon: Headset, badge: "needs_human" },
      { href: "/admin/shipping", label: "روش‌های ارسال", icon: Truck },
      { href: "/admin/import-export", label: "ورود / خروج", icon: FileSpreadsheet },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

function NeedsHumanBadge() {
  const { data } = useQuery<CCStats>({
    queryKey: ["cc-stats"],
    queryFn: () => api.get("/callcenter/stats/").then((r) => r.data),
    refetchInterval: 30000,
  });
  const count = data?.needs_human ?? 0;
  if (count <= 0) return null;
  return (
    <span className="ms-auto bg-[#f97316] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
      {toPersianDigits(count)}
    </span>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const renderLink = (item: NavItem, compact = false) => {
    const { href, label, icon: Icon, badge } = item;
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors shrink-0",
          isActive(href)
            ? "bg-[#f97316] text-white font-medium"
            : "text-blue-100 hover:bg-blue-800"
        )}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className={compact ? "" : "truncate"}>{label}</span>
        {badge === "needs_human" && !compact && <NeedsHumanBadge />}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#1e3a8a] text-white min-h-screen sticky top-0 max-h-screen overflow-y-auto p-4">
        <Link href="/admin" className="flex items-center gap-2 px-2 py-2 mb-4">
          <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black leading-none">مِین استوریج</div>
            <div className="text-blue-300 text-xs">پنل مدیریت</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {GROUPS.map((group, gi) => (
            <div key={gi} className="mb-1">
              {group.title && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-300/70">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => renderLink(item))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-blue-800 pt-3 mt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100 hover:bg-blue-800 transition-colors"
          >
            <Store className="w-[18px] h-[18px]" />
            <span>مشاهده فروشگاه</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100 hover:bg-red-500/80 transition-colors text-right"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden sticky top-0 z-30 bg-[#1e3a8a] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-black">پنل مدیریت</span>
          </Link>
          <button onClick={handleLogout} aria-label="خروج" className="p-2 hover:bg-blue-800 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {ALL_ITEMS.map((item) => renderLink(item, true))}
        </nav>
      </div>
    </>
  );
}


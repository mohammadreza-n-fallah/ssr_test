"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Car,
  Heart,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const LINKS = [
  { href: "/account", label: "پیشخوان", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "سفارش‌های من", icon: ShoppingBag },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/account/garage", label: "گاراژ من", icon: Car },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white ring-1 ring-gray-100 shadow-card rounded-2xl p-4 sticky top-24">
        {/* User summary */}
        <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.full_name || user?.first_name || "کاربر مِین استوریج"}
            </p>
            <p className="text-xs text-gray-400 ltr">{user?.phone}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(href, exact)
                  ? "bg-gradient-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {user?.is_staff && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1e3a8a] hover:bg-blue-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              پنل مدیریت
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            خروج از حساب
          </button>
        </nav>
      </div>
    </aside>
  );
}


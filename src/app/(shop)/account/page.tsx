"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  Heart,
  Car,
  Gift,
  ChevronLeft,
  Package,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { toList, formatPriceToman, formatDate, toPersianDigits } from "@/lib/utils";
import type { Order, LoyaltyAccount } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function AccountHome() {
  const { user } = useAuthStore();

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["orders", "recent"],
    queryFn: () => api.get("/orders/?page_size=3").then((r) => toList<Order>(r.data)),
  });

  const { data: loyalty } = useQuery<LoyaltyAccount>({
    queryKey: ["loyalty"],
    queryFn: () => api.get("/promotions/loyalty/").then((r) => r.data),
  });

  const { data: wishlistIds } = useQuery<number[]>({
    queryKey: ["wishlist-ids"],
    queryFn: () => api.get("/wishlist/ids/").then((r) => r.data.product_ids ?? []),
  });

  const recentOrders = orders ?? [];

  const stats = [
    {
      label: "سفارش‌ها",
      value: recentOrders.length,
      icon: ShoppingBag,
      href: "/account/orders",
      color: "text-[#1e3a8a] bg-blue-50",
    },
    {
      label: "علاقه‌مندی‌ها",
      value: wishlistIds?.length ?? 0,
      icon: Heart,
      href: "/account/wishlist",
      color: "text-red-500 bg-red-50",
    },
    {
      label: "امتیاز وفاداری",
      value: loyalty?.balance ?? 0,
      icon: Gift,
      href: "/account/profile",
      color: "text-[#f97316] bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative bg-gradient-primary rounded-2xl p-6 text-white overflow-hidden shadow-card">
        <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/2" />
        <div className="relative">
          <h1 className="text-xl font-bold">
            سلام {user?.first_name || "کاربر عزیز"} 👋
          </h1>
          <p className="text-blue-100/90 text-sm mt-1">به پیشخوان حساب کاربری خود خوش آمدید.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="mt-3 text-2xl font-black text-gray-900">
              {toPersianDigits(s.value)}
            </div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">آخرین سفارش‌ها</h2>
          <Link
            href="/account/orders"
            className="text-sm text-[#1e3a8a] hover:text-[#f97316] flex items-center gap-1"
          >
            مشاهده همه
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Link
              href="/products"
              className="mt-3 inline-block text-[#1e3a8a] text-sm font-medium"
            >
              شروع خرید ←
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-100 hover:ring-[#1e3a8a]/30 hover:bg-blue-50/30 transition-all"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-gray-800 ltr">
                    {order.order_number}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#1e3a8a]">
                    {formatPriceToman(Number(order.total))}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status_display}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/account/garage"
          className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4 flex items-center gap-3 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
        >
          <Car className="w-6 h-6 text-[#1e3a8a]" />
          <span className="text-sm font-medium text-gray-700">گاراژ من</span>
        </Link>
        <Link
          href="/account/addresses"
          className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4 flex items-center gap-3 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
        >
          <ShoppingBag className="w-6 h-6 text-[#1e3a8a]" />
          <span className="text-sm font-medium text-gray-700">آدرس‌های من</span>
        </Link>
      </div>
    </div>
  );
}

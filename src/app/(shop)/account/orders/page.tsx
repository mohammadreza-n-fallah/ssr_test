"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { formatPriceToman, formatDate, toPersianDigits } from "@/lib/utils";
import type { PaginatedResponse, Order } from "@/types";
import Pagination from "@/components/product/Pagination";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["orders", page],
    queryFn: () => api.get(`/orders/?page=${page}&page_size=10`).then((r) => r.data),
  });

  const orders = data?.results ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-5">سفارش‌های من</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl py-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            شروع خرید
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className="block bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4 hover:border-[#1e3a8a]/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-gray-800 ltr">
                      {order.order_number}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status_display}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-xs text-gray-500">
                    {toPersianDigits(order.items?.length ?? 0)} قلم کالا
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1e3a8a]">
                      {formatPriceToman(Number(order.total))}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

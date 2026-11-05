"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Zap, Clock } from "lucide-react";
import api from "@/lib/api";
import { toList, formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { FlashSale } from "@/types";

export default function SalePage() {
  const { data: sales, isLoading } = useQuery<FlashSale[]>({
    queryKey: ["flash-sales"],
    queryFn: () => api.get("/promotions/flash-sales/").then((r) => toList<FlashSale>(r.data)),
  });

  const liveSales = (sales ?? []).filter((s) => s.is_live);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative bg-gradient-to-l from-red-500 via-rose-500 to-orange-500 rounded-2xl px-6 py-6 mb-6 flex items-center gap-3 text-white shadow-card overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full blur-2xl -translate-x-1/4 -translate-y-1/2" />
        <Zap className="w-8 h-8 relative animate-pulse" />
        <div className="relative">
          <h1 className="text-xl font-black">فروش ویژه</h1>
          <p className="text-orange-50 text-sm">تخفیف‌های شگفت‌انگیز، زمان محدود!</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-64" />
          ))}
        </div>
      ) : liveSales.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">⚡</div>
          <p className="text-gray-500">در حال حاضر فروش ویژه‌ای فعال نیست.</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-gradient-primary hover:brightness-110 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all"
          >
            مشاهده همه محصولات
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {liveSales.map((sale) => (
            <section key={sale.id}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-gray-900">{sale.name}</h2>
                <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  فعال
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sale.items.map((item) => {
                  const discount =
                    item.original_price > 0
                      ? Math.round(
                          ((item.original_price - item.sale_price) / item.original_price) * 100
                        )
                      : 0;
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.product_slug}`}
                      className="bg-white ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:ring-red-200 hover:-translate-y-1 rounded-2xl p-4 transition-all duration-300 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {discount > 0 && (
                          <span className="bg-gradient-to-l from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                            {toPersianDigits(discount)}٪
                          </span>
                        )}
                        <Zap className="w-4 h-4 text-orange-500 mr-auto" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {item.product_name}
                      </h3>
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 line-through">
                          {formatPriceToman(item.original_price)}
                        </div>
                        <div className="text-base font-black text-red-500">
                          {formatPriceToman(item.sale_price)}
                        </div>
                      </div>
                      {item.remaining != null && (
                        <p className="text-xs text-gray-400 mt-2">
                          {toPersianDigits(item.remaining)} عدد باقی مانده
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

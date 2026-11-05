"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, TrendingDown } from "lucide-react";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import type { WishlistItem } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export default function WishlistPage() {
  const { ids, fetchIds } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist/").then((r) => toList<WishlistItem>(r.data)),
  });

  // Sync the store IDs so hearts render filled and removals hide items live.
  useEffect(() => {
    if (isAuthenticated) fetchIds();
  }, [isAuthenticated, fetchIds]);

  const items = (data ?? []).filter((item) => ids.includes(item.product.id));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500" />
        علاقه‌مندی‌ها
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl py-16 text-center">
          <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">فهرست علاقه‌مندی‌های شما خالی است.</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              {item.price_dropped && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  <TrendingDown className="w-3.5 h-3.5" />
                  کاهش قیمت
                </span>
              )}
              <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

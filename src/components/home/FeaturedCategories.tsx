"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import type { Category } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  engine: "⚙️",
  brake: "🛑",
  suspension: "🔧",
  electrical: "⚡",
  battery: "🔋",
  oil: "🛢️",
  filter: "🌀",
  ignition: "🔥",
  cooling: "❄️",
};

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/products/categories/").then((r) => toList<Category>(r.data)),
  });

  if (isLoading) {
    return (
      <section className="my-8">
        <div className="h-7 w-48 skeleton rounded-lg mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-28" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-accent" />
          دسته‌بندی‌ها
        </h2>
        <Link href="/products" className="text-[#1e3a8a] hover:text-[#f97316] text-sm font-medium transition-colors">
          همه دسته‌ها ←
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {categories?.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 text-center"
          >
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50 ring-1 ring-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              {CATEGORY_ICONS[cat.slug] || "🔧"}
            </span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-[#1e3a8a] leading-tight line-clamp-2 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

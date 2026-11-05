"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Flame, Star, TrendingUp, type LucideIcon } from "lucide-react";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

type Accent = "blue" | "orange" | "emerald";
type IconKey = "sparkles" | "flame" | "star" | "trending";

// Resolve icons by string key so a Server Component parent can pick one without
// passing a function across the server/client boundary (not serializable).
const ICONS: Record<IconKey, LucideIcon> = {
  sparkles: Sparkles,
  flame: Flame,
  star: Star,
  trending: TrendingUp,
};

// Static class strings (Tailwind can't see dynamically-built class names).
const ACCENTS: Record<Accent, { chip: string; badge: string; bar: string }> = {
  blue: {
    chip: "bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white shadow-elevated",
    badge: "bg-blue-50 text-[#1e3a8a] ring-1 ring-blue-100",
    bar: "bg-gradient-to-l from-[#1e3a8a] to-[#3b82f6]",
  },
  orange: {
    chip: "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-glow",
    badge: "bg-orange-50 text-[#ea580c] ring-1 ring-orange-100",
    bar: "bg-gradient-to-l from-[#f97316] to-[#fb923c]",
  },
  emerald: {
    chip: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-card",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    bar: "bg-gradient-to-l from-emerald-500 to-emerald-400",
  },
};

interface Props {
  title: string;
  subtitle?: string;
  icon: IconKey;
  /** API path returning products (array or paginated). */
  endpoint: string;
  queryKey: string;
  viewAllHref: string;
  accent?: Accent;
  /** Optional small pill next to the title, e.g. "جدید". */
  badge?: string;
  limit?: number;
}

export default function HomeProductSection({
  title,
  subtitle,
  icon,
  endpoint,
  queryKey,
  viewAllHref,
  accent = "blue",
  badge,
  limit = 8,
}: Props) {
  const styles = ACCENTS[accent];
  const Icon = ICONS[icon];

  const { data, isLoading } = useQuery<Product[]>({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then((r) => toList<Product>(r.data)),
  });

  const products = (data ?? []).slice(0, limit);

  return (
    <section className="my-10 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 gap-4">
        <div className="flex items-center gap-3.5">
          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.chip}`}>
            <Icon className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">{title}</h2>
              {badge && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <Link
          href={viewAllHref}
          className="group flex items-center gap-1 text-[#1e3a8a] hover:text-[#f97316] text-sm font-semibold transition-colors whitespace-nowrap"
        >
          مشاهده همه
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Accent underline */}
      <div className={`h-1 w-20 rounded-full mb-6 ${styles.bar}`} />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-80" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">محصولی یافت نشد</div>
      )}
    </section>
  );
}

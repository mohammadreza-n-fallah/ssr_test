"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import type { Brand } from "@/types";

export default function BrandsPage() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["part-brands"],
    queryFn: () => api.get("/products/brands/").then((r) => toList<Brand>(r.data)),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-3">
        <span className="w-1.5 h-7 rounded-full bg-gradient-accent" />
        برندهای قطعات
      </h1>
      <p className="text-sm text-gray-400 mb-6 pr-4">
        قطعات یدکی از معتبرترین برندهای داخلی و خارجی
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-32" />
          ))}
        </div>
      ) : (brands?.length ?? 0) === 0 ? (
        <div className="text-center py-20 text-gray-400">برندی ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands?.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="bg-white ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:ring-[#1e3a8a]/30 hover:-translate-y-1 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 h-32"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={80}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center text-lg font-black">
                  {brand.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 text-center">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

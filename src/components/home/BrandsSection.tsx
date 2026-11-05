"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import type { Brand } from "@/types";

export default function BrandsSection() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["part-brands"],
    queryFn: () => api.get("/products/brands/").then((r) => toList<Brand>(r.data)),
  });

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-accent" />
          برندهای معتبر
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-28 h-16 skeleton rounded-2xl" />
            ))
          : brands?.slice(0, 12).map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="flex items-center justify-center w-28 h-16 bg-white ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:ring-[#1e3a8a]/30 hover:-translate-y-1 rounded-2xl px-3 transition-all duration-300"
              >
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} width={80} height={40} className="object-contain" />
                ) : (
                  <span className="text-sm font-bold text-gray-600">{brand.name}</span>
                )}
              </Link>
            ))}
      </div>
    </section>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Car } from "lucide-react";
import api from "@/lib/api";
import { toList, toPersianDigits } from "@/lib/utils";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export default function ByVehicleResults() {
  const searchParams = useSearchParams();
  const carBrand = searchParams.get("car_brand");
  const carModel = searchParams.get("car_model");
  const carYear = searchParams.get("car_year");
  const category = searchParams.get("category");

  const query = (() => {
    const p = new URLSearchParams();
    if (carBrand) p.set("car_brand", carBrand);
    if (carModel) p.set("car_model", carModel);
    if (carYear) p.set("car_year", carYear);
    if (category) p.set("category", category);
    return p.toString();
  })();

  const hasVehicle = !!(carBrand || carModel || carYear);

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["by-vehicle", query],
    queryFn: () => api.get(`/products/by-vehicle/?${query}`).then((r) => toList<Product>(r.data)),
    enabled: hasVehicle,
  });

  const products = data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative bg-gradient-primary rounded-2xl px-6 py-5 mb-6 flex items-center gap-3 shadow-card overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl -translate-x-1/4 -translate-y-1/2" />
        <div className="relative w-11 h-11 bg-gradient-accent rounded-xl flex items-center justify-center shrink-0 shadow-glow">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div className="relative">
          <h1 className="text-white font-bold text-lg">قطعات سازگار با خودروی شما</h1>
          <p className="text-blue-100/90 text-sm">
            {isLoading
              ? "در حال جستجو..."
              : `${toPersianDigits(products.length)} قطعه سازگار یافت شد`}
          </p>
        </div>
      </div>

      {!hasVehicle ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">ابتدا خودروی خود را انتخاب کنید</p>
          <Link
            href="/"
            className="inline-block bg-gradient-primary hover:brightness-110 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all"
          >
            انتخاب خودرو
          </Link>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-80" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-gray-400">خطا در دریافت محصولات.</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🚗</div>
          <p className="text-gray-500">قطعه‌ای برای این خودرو ثبت نشده است</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-[#1e3a8a] hover:text-[#f97316] text-sm font-medium"
          >
            مشاهده همه محصولات ←
          </Link>
        </div>
      )}
    </div>
  );
}

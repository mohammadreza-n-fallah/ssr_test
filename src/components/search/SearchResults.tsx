"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { PaginatedResponse, Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { toPersianDigits } from "@/lib/utils";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [input, setInput] = useState(q);

  useEffect(() => {
    setInput(q);
  }, [q]);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["search", q],
    queryFn: () =>
      api.get(`/search/?q=${encodeURIComponent(q)}`).then((r) => r.data),
    enabled: q.trim().length > 0,
  });

  const products = data?.results ?? [];
  const count = data?.count ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search box */}
      <form onSubmit={submit} className="mb-6">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="جستجو در قطعات، کد OEM، شماره قطعه..."
            className="w-full bg-white ring-1 ring-gray-200 shadow-soft rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f97316] transition-colors"
            aria-label="جستجو"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {q.trim().length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          عبارتی برای جستجو وارد کنید
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {isLoading
              ? "در حال جستجو..."
              : `${toPersianDigits(count)} نتیجه برای «${q}»`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-80" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-gray-400">
              خطا در جستجو، لطفا دوباره تلاش کنید
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              نتیجه‌ای یافت نشد. عبارت دیگری را امتحان کنید.
            </div>
          )}
        </>
      )}
    </div>
  );
}

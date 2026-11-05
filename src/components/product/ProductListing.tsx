"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import api from "@/lib/api";
import { toList, toPersianDigits } from "@/lib/utils";
import type { PaginatedResponse, Product, Category, Brand } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/product/Pagination";

const PART_TYPES = [
  { value: "original", label: "اصل" },
  { value: "oem", label: "OEM" },
  { value: "aftermarket", label: "بازار" },
];

const SORT_OPTIONS = [
  { value: "-created_at", label: "جدیدترین" },
  { value: "-view_count", label: "پربازدیدترین" },
  { value: "variants__price", label: "ارزان‌ترین" },
  { value: "-variants__price", label: "گران‌ترین" },
];

export default function ProductListing() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const partType = searchParams.get("part_type") || "";
  const ordering = searchParams.get("ordering") || "-created_at";
  const inStock = searchParams.get("in_stock") === "true";
  const isFeatured = searchParams.get("is_featured") === "true";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  // Local price inputs (committed to the URL on "apply").
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  useEffect(() => setPriceMin(minPrice), [minPrice]);
  useEffect(() => setPriceMax(maxPrice), [maxPrice]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/products/categories/").then((r) => toList<Category>(r.data)),
    staleTime: 1000 * 60 * 10,
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["part-brands"],
    queryFn: () => api.get("/products/brands/").then((r) => toList<Brand>(r.data)),
    staleTime: 1000 * 60 * 10,
  });

  // Build the query string the API expects from the current URL params.
  const apiQuery = (() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("page_size", "12");
    p.set("ordering", ordering);
    if (category) p.set("category", category);
    if (brand) p.set("brand", brand);
    if (partType) p.set("part_type", partType);
    if (inStock) p.set("in_stock", "true");
    if (isFeatured) p.set("is_featured", "true");
    if (minPrice) p.set("min_price", minPrice);
    if (maxPrice) p.set("max_price", maxPrice);
    return p.toString();
  })();

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", apiQuery],
    queryFn: () => api.get(`/products/?${apiQuery}`).then((r) => r.data),
  });

  const products = data?.results ?? [];
  const count = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;

  // Update one URL param (resetting to page 1) and navigate.
  const setParam = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    });
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  };

  const goToPage = (next: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(next));
    router.push(`${pathname}?${p.toString()}`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    !!category || !!brand || !!partType || inStock || isFeatured || !!minPrice || !!maxPrice;

  const clearAll = () => router.push(pathname);

  const activeCategoryName = (() => {
    if (!categories) return category;
    for (const c of categories) {
      if (c.slug === category) return c.name;
      const child = c.children?.find((ch) => ch.slug === category);
      if (child) return child.name;
    }
    return category;
  })();

  const FilterPanel = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">دسته‌بندی</h3>
        <div className="space-y-1 max-h-72 overflow-y-auto pl-1">
          <button
            onClick={() => setParam({ category: null })}
            className={`block w-full text-right text-sm px-2 py-1.5 rounded-lg transition-colors ${
              !category ? "text-[#1e3a8a] font-bold" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            همه دسته‌ها
          </button>
          {categories?.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setParam({ category: cat.slug })}
                className={`block w-full text-right text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  category === cat.slug
                    ? "text-[#1e3a8a] font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
              {cat.children && cat.children.length > 0 && (
                <div className="pr-3 border-r border-gray-100 mr-2">
                  {cat.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setParam({ category: child.slug })}
                      className={`block w-full text-right text-xs px-2 py-1.5 rounded-lg transition-colors ${
                        category === child.slug
                          ? "text-[#1e3a8a] font-bold"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">برند قطعه</h3>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            <button
              onClick={() => setParam({ brand: null })}
              className={`block w-full text-right text-sm px-2 py-1.5 rounded-lg transition-colors ${
                !brand ? "text-[#1e3a8a] font-bold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              همه برندها
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setParam({ brand: b.slug })}
                className={`block w-full text-right text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  brand === b.slug
                    ? "text-[#1e3a8a] font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Part type */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">نوع قطعه</h3>
        <div className="flex flex-wrap gap-2">
          {PART_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => setParam({ part_type: partType === pt.value ? null : pt.value })}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                partType === pt.value
                  ? "bg-gradient-primary text-white border-transparent shadow-md"
                  : "border-gray-200 text-gray-600 hover:border-[#1e3a8a]"
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range (toman) */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">محدوده قیمت (تومان)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="از"
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr text-center"
          />
          <span className="text-gray-300">—</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="تا"
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr text-center"
          />
        </div>
        <button
          onClick={() =>
            setParam({
              // Inputs are toman; the API filters on rials (toman × 10).
              min_price: priceMin ? String(Number(priceMin) * 10) : null,
              max_price: priceMax ? String(Number(priceMax) * 10) : null,
            })
          }
          className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition-colors"
        >
          اعمال قیمت
        </button>
      </div>

      {/* Stock toggle */}
      <div>
        <button
          onClick={() => setParam({ in_stock: inStock ? null : "true" })}
          className="flex items-center gap-2 text-sm text-gray-700"
        >
          <span
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              inStock ? "bg-[#1e3a8a] border-[#1e3a8a]" : "border-gray-300"
            }`}
          >
            {inStock && <Check className="w-3.5 h-3.5 text-white" />}
          </span>
          فقط کالاهای موجود
        </button>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-red-500 hover:text-red-600 py-2 border border-red-100 rounded-lg transition-colors"
        >
          حذف همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isFeatured ? "پیشنهادهای ویژه" : activeCategoryName || "همه محصولات"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-400 mt-0.5">{toPersianDigits(count)} کالا</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={ordering}
            onChange={(e) => setParam({ ordering: e.target.value })}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-gradient-primary text-white rounded-xl px-3 py-2 text-sm shadow-lg active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4" />
            فیلتر
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white ring-1 ring-gray-100 shadow-card rounded-2xl p-5 sticky top-24">
            {FilterPanel}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-80" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-gray-400">
              خطا در دریافت محصولات. لطفا دوباره تلاش کنید.
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500">کالایی با این مشخصات یافت نشد</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 text-[#1e3a8a] hover:text-[#f97316] text-sm font-medium"
                >
                  حذف فیلترها
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85%] bg-white h-full overflow-y-auto p-5 shadow-elevated rounded-l-3xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1e3a8a]" />
                فیلترها
              </h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="بستن" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-5 bg-gradient-primary text-white py-3 rounded-xl font-medium shadow-lg active:scale-[0.98] transition-transform"
            >
              نمایش نتایج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useRouter } from "next/navigation";
import { formatPriceToman } from "@/lib/utils";
import type { Product } from "@/types";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { has, toggle } = useWishlistStore();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const inWishlist = has(product.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    await toggle(product.id);
  };

  const variant = product.default_variant;
  const image = product.primary_image;
  const hasDiscount = variant && variant.compare_price && variant.discount_percent > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/auth"); return; }
    if (!variant) return;
    setAdding(true);
    try {
      await addToCart(variant.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:ring-[#1e3a8a]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white pt-[100%] overflow-hidden">
        {image ? (
          <Image
            src={image.image}
            alt={image.alt_text || product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">
            🔧
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 bg-gradient-to-l from-red-500 to-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
            {variant.discount_percent}٪ تخفیف
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label="افزودن به علاقه‌مندی‌ها"
          className={`absolute top-2.5 left-2.5 w-9 h-9 glass rounded-full flex items-center justify-center shadow-soft transition-all duration-300 hover:scale-110 ${
            inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          />
        </button>

        {/* Out of stock */}
        {variant && !variant.is_in_stock && (
          <div className="absolute inset-0 glass flex items-center justify-center">
            <span className="bg-gray-900/90 text-white text-sm font-medium px-3 py-1 rounded-full">
              ناموجود
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Brand + part type */}
        <div className="flex items-center gap-2">
          {product.brand && (
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              {product.brand.name}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            product.part_type === "original"
              ? "bg-green-50 text-green-700"
              : product.part_type === "oem"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-50 text-gray-600"
          }`}>
            {product.part_type === "original" ? "اصل" : product.part_type === "oem" ? "OEM" : "بازار"}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed group-hover:text-[#1e3a8a] transition-colors">
          {product.name}
        </h3>

        {/* OEM code */}
        {product.oem_code && (
          <p className="text-xs text-gray-400 font-mono ltr">{product.oem_code}</p>
        )}

        <div className="flex-1" />

        {/* Price */}
        {variant && (
          <div className="space-y-0.5">
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through">
                {formatPriceToman(Number(variant.compare_price))}
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-[#1e3a8a]">
                {formatPriceToman(Number(variant.price))}
              </span>
              <span className="text-xs text-gray-400 font-medium">تومان</span>
            </div>
          </div>
        )}

        {/* Add to cart */}
        {variant?.is_in_stock ? (
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-gradient-primary hover:brightness-110 disabled:opacity-70 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            {adding ? "در حال افزودن..." : "افزودن به سبد"}
          </button>
        ) : (
          <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-medium">
            ناموجود
          </button>
        )}
      </div>
    </Link>
  );
}

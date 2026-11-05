"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPriceToman, toPersianDigits } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { cart, fetchCart, updateItem, removeItem, clearCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [busyItem, setBusyItem] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && isAuthenticated) fetchCart();
  }, [mounted, isAuthenticated, fetchCart]);

  const changeQty = async (itemId: number, qty: number) => {
    setBusyItem(itemId);
    try {
      await updateItem(itemId, qty);
    } finally {
      setBusyItem(null);
    }
  };

  const remove = async (itemId: number) => {
    setBusyItem(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setBusyItem(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">سبد خرید شما</h1>
        <p className="text-gray-500 mb-6">برای مشاهده سبد خرید و ادامه فرآیند، وارد شوید.</p>
        <Link
          href="/auth?next=/cart"
          className="inline-block bg-gradient-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all"
        >
          ورود / ثبت‌نام
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (isLoading && !cart) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">سبد خرید شما خالی است</h1>
        <p className="text-gray-500 mb-6">هنوز کالایی به سبد خرید اضافه نکرده‌اید.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gradient-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all"
        >
          شروع خرید
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          سبد خرید ({toPersianDigits(cart?.total_items ?? 0)} کالا)
        </h1>
        <button
          onClick={() => clearCart()}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          خالی کردن سبد
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const variant = item.variant_detail;
            const unitPrice = variant?.flash_price ?? Number(variant?.price ?? 0);
            return (
              <div
                key={item.id}
                className="bg-white ring-1 ring-gray-100 shadow-soft hover:shadow-card rounded-2xl p-4 flex gap-4 transition-shadow"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative w-24 h-24 shrink-0 bg-gradient-to-b from-gray-50 to-white ring-1 ring-gray-100 rounded-xl overflow-hidden"
                >
                  {item.product.primary_image ? (
                    <Image
                      src={item.product.primary_image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      🔧
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-[#1e3a8a]"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 font-mono ltr mt-1">{variant?.sku}</p>

                  {!item.is_available && (
                    <span className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      موجودی کافی نیست
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 rounded-xl">
                      <button
                        onClick={() => changeQty(item.id, item.quantity + 1)}
                        disabled={busyItem === item.id || item.quantity >= (variant?.stock ?? 0)}
                        className="p-2 text-gray-500 hover:text-[#1e3a8a] disabled:opacity-40"
                        aria-label="افزایش"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {busyItem === item.id ? "…" : toPersianDigits(item.quantity)}
                      </span>
                      <button
                        onClick={() => changeQty(item.id, item.quantity - 1)}
                        disabled={busyItem === item.id}
                        className="p-2 text-gray-500 hover:text-[#1e3a8a] disabled:opacity-40"
                        aria-label="کاهش"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-left">
                      <div className="font-black text-[#1e3a8a]">
                        {formatPriceToman(unitPrice * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-gray-400">
                          واحد: {formatPriceToman(unitPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => remove(item.id)}
                  disabled={busyItem === item.id}
                  className="text-gray-300 hover:text-red-500 self-start"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white ring-1 ring-gray-100 shadow-card rounded-2xl p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">خلاصه سفارش</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>تعداد کالا</span>
                <span>{toPersianDigits(cart?.total_items ?? 0)} عدد</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>مبلغ کالاها</span>
                <span>{formatPriceToman(Number(cart?.subtotal ?? 0))}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-[#1e3a8a]">
                  {formatPriceToman(Number(cart?.subtotal ?? 0))}
                </span>
              </div>
              <p className="text-xs text-gray-400">هزینه ارسال در مرحله بعد محاسبه می‌شود.</p>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full mt-5 bg-gradient-accent hover:brightness-110 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-glow"
            >
              ادامه فرآیند خرید
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-[#1e3a8a] mt-3"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Truck,
  Tag,
  Gift,
  Check,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPriceToman, toPersianDigits, toList } from "@/lib/utils";
import { IRAN_PROVINCES } from "@/lib/provinces";
import type { Address, ShippingOption, CouponResult, LoyaltyAccount } from "@/types";

const EMPTY_ADDRESS = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState("");

  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/auth?next=/checkout");
      return;
    }
    fetchCart();
    api.get("/auth/addresses/").then((r) => {
      const list = toList<Address>(r.data);
      setAddresses(list);
      const def = list.find((a) => a.is_default) ?? list[0];
      if (def) setSelectedAddress(def.id);
    });
    api.get("/promotions/loyalty/").then((r) => setLoyalty(r.data)).catch(() => {});
  }, [mounted, isAuthenticated, router, fetchCart]);

  const subtotal = Number(cart?.subtotal ?? 0);

  // Fetch shipping quotes whenever the selected address changes.
  const loadShipping = useCallback(
    async (address: Address) => {
      setLoadingShipping(true);
      try {
        const { data } = await api.post("/shipping/quote/", {
          province: address.province,
          city: address.city,
          // Backend expects an integer-rials amount (no decimal places).
          subtotal: Math.round(subtotal),
        });
        const options: ShippingOption[] = data.options ?? [];
        setShippingOptions(options);
        if (options.length > 0) {
          // Default to the cheapest option.
          const cheapest = [...options].sort((a, b) => a.cost - b.cost)[0];
          setSelectedShipping(cheapest.method_id);
        }
      } catch {
        setShippingOptions([]);
      } finally {
        setLoadingShipping(false);
      }
    },
    [subtotal]
  );

  useEffect(() => {
    const addr = addresses.find((a) => a.id === selectedAddress);
    if (addr && subtotal > 0) loadShipping(addr);
  }, [selectedAddress, addresses, subtotal, loadShipping]);

  const shippingCost =
    shippingOptions.find((o) => o.method_id === selectedShipping)?.cost ?? 0;

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const { data } = await api.post("/auth/addresses/", {
        ...newAddress,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, data]);
      setSelectedAddress(data.id);
      setShowAddressForm(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch {
      setError("خطا در ذخیره آدرس. لطفا همه فیلدها را کامل کنید.");
    } finally {
      setSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post("/promotions/coupons/validate/", {
        code: couponCode.trim(),
        shipping_cost: shippingCost,
      });
      setCoupon(data);
    } catch (err: any) {
      setCoupon(null);
      setCouponError(err.response?.data?.detail || "کد تخفیف نامعتبر است");
    }
  };

  // Estimated loyalty discount (backend computes the authoritative amount).
  const pointValue =
    loyalty && loyalty.balance > 0 ? loyalty.balance_rials / loyalty.balance : 0;
  const loyaltyPoints = usePoints && loyalty ? loyalty.balance : 0;
  const loyaltyDiscount = Math.round(loyaltyPoints * pointValue);

  const couponDiscount = coupon?.total_discount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - couponDiscount - loyaltyDiscount);

  const placeOrder = async () => {
    setError("");
    if (!selectedAddress) {
      setError("لطفا یک آدرس انتخاب کنید");
      return;
    }
    setPlacing(true);
    try {
      const { data: order } = await api.post("/orders/create/", {
        address_id: selectedAddress,
        shipping_method_id: selectedShipping,
        coupon_code: coupon?.code || "",
        redeem_points: loyaltyPoints,
        notes,
      });

      // Initiate payment and redirect to the gateway.
      try {
        const { data: pay } = await api.post(`/payments/pay/${order.order_number}/`);
        if (pay.redirect_url) {
          window.location.href = pay.redirect_url;
          return;
        }
      } catch {
        // Gateway unavailable — fall through to the order page.
      }
      router.push(`/account/orders/${order.order_number}?created=1`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطا در ثبت سفارش");
      setPlacing(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (cart && cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">سبد خرید خالی است</h1>
        <p className="text-gray-500 mb-6">برای ثبت سفارش ابتدا کالایی به سبد اضافه کنید.</p>
        <Link
          href="/products"
          className="inline-block bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-medium"
        >
          شروع خرید
        </Link>
      </div>
    );
  }

  const field =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">تکمیل خرید</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Address */}
          <section className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1e3a8a]" />
                آدرس تحویل
              </h2>
              <button
                onClick={() => setShowAddressForm((s) => !s)}
                className="text-sm text-[#1e3a8a] hover:text-[#f97316] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                آدرس جدید
              </button>
            </div>

            {addresses.length === 0 && !showAddressForm && (
              <p className="text-sm text-gray-400 py-2">
                هنوز آدرسی ثبت نکرده‌اید. یک آدرس جدید اضافه کنید.
              </p>
            )}

            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`w-full text-right p-3 rounded-xl border transition-colors ${
                    selectedAddress === addr.id
                      ? "border-[#1e3a8a] bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">
                      {addr.title || addr.receiver_name}
                    </span>
                    {selectedAddress === addr.id && (
                      <Check className="w-4 h-4 text-[#1e3a8a]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {addr.province}، {addr.city}، {addr.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 ltr">
                    {addr.receiver_name} — {addr.receiver_phone}
                  </p>
                </button>
              ))}
            </div>

            {showAddressForm && (
              <form onSubmit={saveAddress} className="mt-4 grid grid-cols-2 gap-3">
                <input
                  className={field}
                  placeholder="عنوان (مثلا منزل)"
                  value={newAddress.title}
                  onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="نام گیرنده"
                  required
                  value={newAddress.receiver_name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, receiver_name: e.target.value })
                  }
                />
                <select
                  className={field}
                  required
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, province: e.target.value })
                  }
                >
                  <option value="">استان</option>
                  {IRAN_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  className={field}
                  placeholder="شهر"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <input
                  className={`${field} col-span-2`}
                  placeholder="نشانی کامل"
                  required
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                />
                <input
                  className={`${field} ltr`}
                  placeholder="کد پستی"
                  value={newAddress.postal_code}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, postal_code: e.target.value })
                  }
                />
                <input
                  className={`${field} ltr`}
                  placeholder="شماره تماس گیرنده"
                  required
                  value={newAddress.receiver_phone}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, receiver_phone: e.target.value })
                  }
                />
                <div className="col-span-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-all"
                  >
                    {savingAddress ? "در حال ذخیره..." : "ذخیره آدرس"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-gray-500 px-4 text-sm"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Shipping */}
          <section className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#1e3a8a]" />
              روش ارسال
            </h2>
            {!selectedAddress ? (
              <p className="text-sm text-gray-400">ابتدا آدرس تحویل را انتخاب کنید.</p>
            ) : loadingShipping ? (
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <LoaderCircle className="w-4 h-4 animate-spin" /> در حال محاسبه...
              </p>
            ) : shippingOptions.length === 0 ? (
              <p className="text-sm text-gray-400">روش ارسالی برای این آدرس یافت نشد.</p>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <button
                    key={opt.method_id}
                    onClick={() => setSelectedShipping(opt.method_id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      selectedShipping === opt.method_id
                        ? "border-[#1e3a8a] bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-right">
                      <span className="font-semibold text-sm text-gray-800">{opt.name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {toPersianDigits(opt.estimated_days_min)} تا{" "}
                        {toPersianDigits(opt.estimated_days_max)} روز کاری
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#1e3a8a]">
                      {opt.free || opt.cost === 0 ? "رایگان" : formatPriceToman(opt.cost)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-3">یادداشت سفارش (اختیاری)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="توضیحات برای ارسال..."
              className={`${field} resize-none`}
            />
          </section>
        </div>

        {/* Right: summary */}
        <div>
          <div className="bg-white ring-1 ring-gray-100 shadow-card rounded-2xl p-5 sticky top-24 space-y-4">
            <h2 className="font-bold text-gray-900">خلاصه سفارش</h2>

            {/* Coupon */}
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4" /> کد تخفیف
              </label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="کد را وارد کنید"
                  className={field}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl text-sm whitespace-nowrap"
                >
                  اعمال
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {coupon && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> کد «{coupon.code}» اعمال شد
                </p>
              )}
            </div>

            {/* Loyalty */}
            {loyalty && loyalty.balance > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="w-4 h-4 accent-[#1e3a8a]"
                />
                <Gift className="w-4 h-4 text-[#f97316]" />
                استفاده از {toPersianDigits(loyalty.balance)} امتیاز (
                {formatPriceToman(loyalty.balance_rials)})
              </label>
            )}

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>مبلغ کالاها</span>
                <span>{formatPriceToman(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>هزینه ارسال</span>
                <span>{shippingCost === 0 ? "—" : formatPriceToman(shippingCost)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>تخفیف کد</span>
                  <span>− {formatPriceToman(couponDiscount)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>تخفیف امتیاز</span>
                  <span>− {formatPriceToman(loyaltyDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-[#1e3a8a] text-lg">{formatPriceToman(total)}</span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={placing || !selectedAddress}
              className="w-full bg-gradient-accent hover:brightness-110 disabled:opacity-60 disabled:hover:brightness-100 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-glow disabled:shadow-none"
            >
              {placing ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" /> در حال ثبت...
                </>
              ) : (
                "ثبت سفارش و پرداخت"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

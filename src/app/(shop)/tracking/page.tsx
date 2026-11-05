"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";

export default function TrackingPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = orderNumber.trim();
    // The order page is auth-guarded; anonymous users are routed to login and
    // then back, since orders are private to each account.
    if (n) router.push(`/account/orders/${encodeURIComponent(n)}`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">پیگیری سفارش</h1>
      <p className="text-gray-500 text-sm mt-2 mb-6">
        شماره سفارش خود را وارد کنید تا وضعیت آن را مشاهده کنید.
      </p>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="مثلا ORD-14030512-XXXX"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr text-center"
        />
        <button
          type="submit"
          className="bg-gradient-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-medium"
        >
          پیگیری
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-4">
        برای مشاهده وضعیت، باید با حساب کاربری ثبت‌کننده سفارش وارد شوید.
      </p>
    </div>
  );
}

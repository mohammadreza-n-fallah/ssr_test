"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart.store";

type Status = "checking" | "success" | "failed";

export default function PaymentVerify() {
  const searchParams = useSearchParams();
  const { fetchCart } = useCartStore();
  const [status, setStatus] = useState<Status>("checking");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [refId, setRefId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const paymentId = searchParams.get("payment_id");
    const authority = searchParams.get("Authority");
    const payStatus = searchParams.get("Status");

    const params = new URLSearchParams();
    if (paymentId) params.set("payment_id", paymentId);
    if (authority) params.set("Authority", authority);
    if (payStatus) params.set("Status", payStatus ?? "");

    api
      .get(`/payments/verify/?${params.toString()}`)
      .then((r) => {
        if (r.data.success) {
          setStatus("success");
          setOrderNumber(r.data.order_number || "");
          setRefId(r.data.ref_id || "");
          fetchCart(); // cart was cleared server-side on order creation
        } else {
          setStatus("failed");
          setMessage(r.data.detail || "پرداخت ناموفق بود");
        }
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(err.response?.data?.detail || "خطا در تایید پرداخت");
      });
  }, [searchParams, fetchCart]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === "checking" && (
        <>
          <LoaderCircle className="w-14 h-14 text-[#1e3a8a] animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-900">در حال بررسی پرداخت...</h1>
          <p className="text-gray-500 text-sm mt-2">لطفا صفحه را نبندید.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">پرداخت موفق بود</h1>
          <p className="text-gray-500 text-sm mt-2">
            سفارش شما با موفقیت ثبت و پرداخت شد.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mt-5 text-sm space-y-1">
            {orderNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">شماره سفارش</span>
                <span className="font-mono font-bold text-gray-800 ltr">{orderNumber}</span>
              </div>
            )}
            {refId && (
              <div className="flex justify-between">
                <span className="text-gray-500">کد پیگیری</span>
                <span className="font-mono text-gray-700 ltr">{refId}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            {orderNumber && (
              <Link
                href={`/account/orders/${orderNumber}`}
                className="flex-1 bg-gradient-primary hover:brightness-110 text-white py-3 rounded-xl font-medium"
              >
                مشاهده سفارش
              </Link>
            )}
            <Link
              href="/products"
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              ادامه خرید
            </Link>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">پرداخت ناموفق</h1>
          <p className="text-gray-500 text-sm mt-2">{message}</p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/account/orders"
              className="flex-1 bg-gradient-primary hover:brightness-110 text-white py-3 rounded-xl font-medium"
            >
              سفارش‌های من
            </Link>
            <Link
              href="/cart"
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              بازگشت به سبد
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

import { Suspense } from "react";
import PaymentVerify from "@/components/checkout/PaymentVerify";

export const metadata = {
  title: "نتیجه پرداخت",
  robots: { index: false, follow: false },
};

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center text-gray-400">
          در حال بررسی پرداخت...
        </div>
      }
    >
      <PaymentVerify />
    </Suspense>
  );
}

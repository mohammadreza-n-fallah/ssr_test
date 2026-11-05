"use client";

import Link from "next/link";
import { Truck, Tag, ArrowLeft } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="my-10 animate-fade-up">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary text-white px-6 py-10 md:px-12 md:py-12 shadow-elevated">
        {/* Ambient blobs */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-orange-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/15 text-orange-200 px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" />
              کد تخفیف WELCOME10
            </span>
            <h3 className="text-2xl md:text-3xl font-black leading-tight mb-2">
              ۱۰٪ تخفیف برای
              <span className="text-gradient-accent"> اولین خرید</span>
            </h3>
            <p className="text-blue-100/90 text-sm md:text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-300 shrink-0" />
              ارسال رایگان برای سفارش‌های بالای ۵ میلیون تومان
            </p>
          </div>

          <Link
            href="/products"
            className="group bg-gradient-accent hover:brightness-110 text-white px-7 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center gap-2 shadow-glow whitespace-nowrap active:scale-95 self-start md:self-auto"
          >
            شروع خرید
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

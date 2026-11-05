"use client";

import Link from "next/link";
import { Search, ArrowLeft, Shield, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative bg-gradient-primary text-white overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      {/* Ambient floating blobs */}
      <div className="absolute top-0 left-0 w-[28rem] h-[28rem] bg-orange-500/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-float" />
      <div className="absolute bottom-0 right-0 w-[26rem] h-[26rem] bg-blue-400/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/15 text-orange-200 px-4 py-1.5 rounded-full text-sm mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            بیش از ۵۰,۰۰۰ قطعه اصل و OEM موجود
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
            قطعه یدکی
            <span className="text-gradient-accent"> خودروت</span>
            <br />
            رو پیدا کن
          </h1>

          <p className="text-blue-100/90 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
            سریع‌ترین جستجو برای پیدا کردن قطعات سازگار با خودرو شما — با کد OEM یا انتخاب مدل خودرو
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="کد OEM، نام قطعه، شماره فنی..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-2xl px-5 py-4 pr-5 text-base focus:outline-none focus:ring-2 focus:ring-[#f97316] shadow-elevated"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-accent hover:brightness-110 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all flex items-center gap-2 shadow-glow whitespace-nowrap active:scale-95"
            >
              <Search className="w-5 h-5" />
              جستجو
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-blue-200 text-sm ml-2">جستجوهای پرطرفدار:</span>
            {["لنت ترمز پراید", "فیلتر روغن پژو", "شمع پراید", "دیسک ترمز"].map((term) => (
              <Link
                key={term}
                href={`/products?search=${encodeURIComponent(term)}`}
                className="text-sm bg-white/10 hover:bg-white/20 ring-1 ring-white/10 text-white px-3 py-1 rounded-full transition-colors backdrop-blur-sm"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative border-t border-white/10 glass-dark">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, title: "ضمانت اصالت کالا", desc: "تمام محصولات دارای گارانتی" },
              { icon: Truck, title: "ارسال سریع", desc: "پیک فوری و پست سراسری" },
              { icon: RotateCcw, title: "۷ روز ضمانت بازگشت", desc: "بدون چون و چرا" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 justify-center">
                <div className="w-11 h-11 bg-orange-500/20 ring-1 ring-orange-400/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-blue-200 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

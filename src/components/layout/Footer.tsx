import Link from "next/link";
import { Car, Phone, Mail, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#0f172a] text-slate-300 mt-auto">
      {/* Accent top edge */}
      <div className="h-1 w-full bg-gradient-to-l from-[#1e3a8a] via-[#f97316] to-[#1e3a8a]" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-black text-white text-lg">مِین استوریج</div>
                <div className="text-xs text-slate-400">فروشگاه قطعات خودرو</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              بزرگترین فروشگاه آنلاین قطعات یدکی خودرو در ایران — اصل و OEM با ضمانت کیفیت
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="تلگرام" className="w-9 h-9 bg-slate-800 hover:bg-gradient-accent hover:scale-110 rounded-lg flex items-center justify-center transition-all duration-300">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" aria-label="اینستاگرام" className="w-9 h-9 bg-slate-800 hover:bg-gradient-accent hover:scale-110 rounded-lg flex items-center justify-center transition-all duration-300">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["همه محصولات", "/products"],
                ["خودروها", "/vehicles"],
                ["برندها", "/brands"],
                ["تخفیف‌ها", "/sale"],
                ["محصولات جدید", "/products?ordering=-created_at"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#f97316] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">خدمات مشتریان</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["پیگیری سفارش", "/tracking"],
                ["راهنمای خرید", "/help/buying"],
                ["شرایط گارانتی", "/help/warranty"],
                ["نحوه بازگشت کالا", "/help/returns"],
                ["سوالات متداول", "/faq"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#f97316] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تماس با ما</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#f97316] shrink-0" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#f97316] shrink-0" />
                <span>info@carpart.ir</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-slate-800 rounded-xl text-xs text-slate-400">
              ساعات پاسخگویی:<br />
              شنبه تا چهارشنبه ۸ تا ۱۷<br />
              پنجشنبه ۸ تا ۱۳
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>© ۱۴۰۴ مِین استوریج — تمامی حقوق محفوظ است</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">حریم خصوصی</Link>
            <Link href="/terms" className="hover:text-slate-300">شرایط استفاده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


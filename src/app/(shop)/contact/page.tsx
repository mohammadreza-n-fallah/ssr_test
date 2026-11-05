import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export const metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با فروشگاه قطعات خودرو مِین استوریج",
};

export default function ContactPage() {
  const items = [
    { icon: Phone, label: "تلفن پشتیبانی", value: "۰۲۱-۱۲۳۴۵۶۷۸" },
    { icon: Mail, label: "ایمیل", value: "info@carpart.ir" },
    { icon: MapPin, label: "نشانی", value: "تهران، خیابان آزادی، پلاک ۱۲۳" },
    { icon: Clock, label: "ساعات کاری", value: "شنبه تا چهارشنبه ۸ تا ۱۷" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">تماس با ما</h1>
      <p className="text-gray-500 mb-8">
        تیم پشتیبانی مِین استوریج آماده پاسخگویی به سوالات شماست.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-l from-[#1e3a8a] to-[#1d4ed8] rounded-2xl p-6 text-white flex items-center gap-4">
        <Send className="w-8 h-8 shrink-0" />
        <div>
          <h2 className="font-bold">پشتیبانی آنلاین</h2>
          <p className="text-blue-200 text-sm mt-1">
            از طریق حساب کاربری خود می‌توانید تیکت پشتیبانی ثبت کنید و پاسخ بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
}


import { Shield, Zap, HeadphonesIcon, Award } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "تضمین اصالت کالا",
    desc: "تمامی محصولات دارای گارانتی اصالت و ضمانت کیفیت هستند",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "ارسال فوری",
    desc: "ارسال پیک فوری در تهران و پست ویژه برای سایر شهرها",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: HeadphonesIcon,
    title: "پشتیبانی ۲۴/۷",
    desc: "تیم متخصص ما همیشه آماده پاسخگویی به سوالات فنی شماست",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Award,
    title: "بهترین قیمت",
    desc: "قیمت‌های رقابتی با امکان مقایسه و تخفیف‌های ویژه",
    color: "from-violet-500 to-violet-600",
  },
];

export default function WhyUsSection() {
  return (
    <section className="my-10 py-10 border-t border-gray-200/70">
      <h2 className="text-2xl font-black text-gray-900 text-center mb-2">چرا مِین استوریج؟</h2>
      <p className="text-sm text-gray-500 text-center mb-8">تجربه‌ای مطمئن و سریع از خرید قطعات خودرو</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {reasons.map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="group text-center bg-white rounded-2xl ring-1 ring-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-6"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


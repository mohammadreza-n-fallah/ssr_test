"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Gift, Copy, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { LoyaltyAccount, ReferralInfo } from "@/types";

export default function ProfilePage() {
  const { user, updateUser, fetchProfile } = useAuthStore();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    national_code: "",
    birth_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        national_code: user.national_code || "",
        birth_date: user.birth_date || "",
      });
    }
  }, [user]);

  const { data: loyalty } = useQuery<LoyaltyAccount>({
    queryKey: ["loyalty"],
    queryFn: () => api.get("/promotions/loyalty/").then((r) => r.data),
  });

  const { data: referral } = useQuery<ReferralInfo>({
    queryKey: ["referral"],
    queryFn: () => api.get("/promotions/referral/").then((r) => r.data),
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = { ...form, birth_date: form.birth_date || null };
      const { data } = await api.patch("/auth/profile/", payload);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchProfile();
    } catch {
      setError("خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = () => {
    if (!referral?.code) return;
    navigator.clipboard.writeText(referral.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const field =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]";

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">اطلاعات حساب</h1>

      {/* Profile form */}
      <form onSubmit={save} className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-[#1e3a8a]" />
          مشخصات فردی
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">نام</label>
            <input
              className={field}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">نام خانوادگی</label>
            <input
              className={field}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">شماره موبایل</label>
            <input
              className={`${field} ltr bg-gray-50 text-gray-400`}
              value={user?.phone || ""}
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ایمیل</label>
            <input
              type="email"
              className={`${field} ltr`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">کد ملی</label>
            <input
              className={`${field} ltr`}
              value={form.national_code}
              onChange={(e) => setForm({ ...form, national_code: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">تاریخ تولد</label>
            <input
              type="date"
              className={`${field} ltr`}
              value={form.birth_date || ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className={`mt-4 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
            saved ? "bg-green-500" : "bg-gradient-primary hover:brightness-110"
          } disabled:opacity-60`}
        >
          {saved ? "ذخیره شد ✓" : saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>

      {/* Loyalty + referral */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-[#f97316]" />
            امتیاز وفاداری
          </h2>
          <div className="text-3xl font-black text-[#1e3a8a]">
            {toPersianDigits(loyalty?.balance ?? 0)}
            <span className="text-sm font-normal text-gray-400"> امتیاز</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            معادل {formatPriceToman(loyalty?.balance_rials ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            مجموع امتیاز کسب‌شده: {toPersianDigits(loyalty?.lifetime_earned ?? 0)}
          </p>
        </div>

        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-3">کد معرف شما</h2>
          {referral ? (
            <>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 font-mono font-bold text-gray-800 ltr text-center">
                  {referral.code}
                </code>
                <button
                  onClick={copyReferral}
                  className="p-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-blue-900"
                  aria-label="کپی"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                با دعوت دوستان، شما و آن‌ها امتیاز هدیه می‌گیرید.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                دعوت موفق: {toPersianDigits(referral.completed_referrals)} نفر — امتیاز
                کسب‌شده: {toPersianDigits(referral.points_earned)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">در حال بارگذاری...</p>
          )}
        </div>
      </div>
    </div>
  );
}

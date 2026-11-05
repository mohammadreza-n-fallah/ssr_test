"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Users, CircleCheckBig } from "lucide-react";
import api from "@/lib/api";
import { apiError } from "@/lib/admin";
import { toast } from "@/components/admin/ui/toast";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import Button from "@/components/admin/ui/Button";
import { TextInput, TextArea, SelectInput, Switch } from "@/components/admin/ui/fields";
import { toPersianDigits } from "@/lib/utils";

const SEGMENTS = [
  { value: "all", label: "همه کاربران" },
  { value: "buyers", label: "خریداران (دارای سفارش پرداخت‌شده)" },
  { value: "verified", label: "کاربران تأییدشده" },
  { value: "staff", label: "کارکنان" },
];
const CATEGORIES = [
  { value: "system", label: "سیستمی" },
  { value: "promo", label: "تخفیف و پیشنهاد" },
  { value: "order", label: "سفارش" },
];

export default function NotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    link: "",
    category: "system",
    segment: "all",
    send_sms: false,
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation<{ sent: number; segment: string }, unknown, typeof form>({
    mutationFn: (data) => api.post("/dashboard/broadcast/", data).then((r) => r.data),
    onSuccess: (d) => toast.success(`اعلان برای ${toPersianDigits(d.sent)} کاربر ارسال شد`),
    onError: (e) => toast.error(apiError(e)),
  });

  const valid = form.title.trim() && form.message.trim();

  return (
    <div className="max-w-2xl mx-auto">
      <AdminHeader title="ارسال اعلان گروهی" subtitle="ارسال پیام درون‌برنامه‌ای (و پیامک) به گروهی از کاربران" />

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <TextInput
          label="عنوان"
          required
          placeholder="مثلاً: جشنواره فروش بهاره"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <TextArea
          label="متن پیام"
          required
          rows={4}
          placeholder="متن کامل اعلان..."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
        <TextInput
          label="لینک (اختیاری)"
          ltr
          placeholder="/products/brake-pad"
          value={form.link}
          onChange={(e) => set("link", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectInput
            label="گروه مخاطب"
            options={SEGMENTS}
            value={form.segment}
            onChange={(v) => set("segment", v)}
          />
          <SelectInput
            label="دسته اعلان"
            options={CATEGORIES}
            value={form.category}
            onChange={(v) => set("category", v)}
          />
        </div>
        <div className="rounded-xl border border-gray-200 px-3.5 py-2.5">
          <Switch
            label="ارسال پیامک همزمان"
            hint="در صورت فعال‌بودن کلید کاوه‌نگار، متن پیام پیامک می‌شود"
            checked={form.send_sms}
            onChange={(v) => set("send_sms", v)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users className="h-4 w-4" />
            ارسال به: {SEGMENTS.find((s) => s.value === form.segment)?.label}
          </span>
          <Button
            icon={<Send className="h-4 w-4" />}
            loading={mut.isPending}
            disabled={!valid}
            onClick={() => mut.mutate(form)}
          >
            ارسال اعلان
          </Button>
        </div>

        {mut.isSuccess && mut.data && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            <CircleCheckBig className="h-5 w-5 shrink-0" />
            اعلان با موفقیت برای {toPersianDigits(mut.data.sent)} کاربر ارسال شد.
          </div>
        )}
      </div>
    </div>
  );
}

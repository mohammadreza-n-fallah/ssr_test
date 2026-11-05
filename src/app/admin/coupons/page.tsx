"use client";

import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { toPersianDigits, formatDate } from "@/lib/utils";
import type { AdminCoupon } from "@/types/admin";

const DISCOUNT_TYPES = [
  { value: "percent", label: "درصدی" },
  { value: "fixed", label: "مبلغ ثابت (ریال)" },
  { value: "free_shipping", label: "ارسال رایگان" },
];

const columns: Column<AdminCoupon>[] = [
  { key: "code", header: "کد", render: (r) => <span className="ltr font-bold text-[#1e3a8a]">{r.code}</span> },
  { key: "discount_type_display", header: "نوع" },
  {
    key: "value",
    header: "مقدار",
    render: (r) =>
      r.discount_type === "percent"
        ? `${toPersianDigits(r.value)}٪`
        : r.discount_type === "fixed"
        ? `${toPersianDigits(Math.floor(Number(r.value) / 10).toLocaleString("en-US"))} ت`
        : "—",
  },
  {
    key: "used_count",
    header: "استفاده",
    align: "center",
    render: (r) => toPersianDigits(`${r.used_count}${r.usage_limit ? "/" + r.usage_limit : ""}`),
  },
  { key: "valid_to", header: "انقضا", render: (r) => (r.valid_to ? formatDate(r.valid_to) : "بدون محدودیت") },
  {
    key: "is_active",
    header: "وضعیت",
    align: "center",
    render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
  },
];

const fields: CrudFieldDef[] = [
  { name: "code", label: "کد تخفیف", type: "text", required: true, ltr: true },
  { name: "discount_type", label: "نوع تخفیف", type: "select", required: true, options: DISCOUNT_TYPES, placeholder: undefined },
  { name: "value", label: "مقدار (درصد یا ریال)", type: "number", hint: "برای ارسال رایگان خالی بگذارید" },
  { name: "description", label: "توضیحات", type: "text", full: true },
  { name: "max_discount", label: "سقف تخفیف (ریال)", type: "number" },
  { name: "min_order_amount", label: "حداقل مبلغ سفارش (ریال)", type: "number" },
  { name: "usage_limit", label: "محدودیت کل استفاده", type: "number", hint: "خالی = نامحدود" },
  { name: "usage_limit_per_user", label: "محدودیت هر کاربر", type: "number", defaultValue: 1 },
  { name: "valid_from", label: "شروع اعتبار", type: "datetime" },
  { name: "valid_to", label: "پایان اعتبار", type: "datetime" },
  { name: "first_order_only", label: "فقط اولین سفارش", type: "switch" },
  { name: "is_active", label: "فعال باشد", type: "switch", defaultValue: true },
];

export default function CouponsPage() {
  return (
    <CrudManager<AdminCoupon>
      resource="coupons"
      title="کدهای تخفیف"
      subtitle="مدیریت کوپن‌ها و کدهای تخفیف فروشگاه"
      singular="کد تخفیف"
      searchPlaceholder="جستجوی کد..."
      columns={columns}
      fields={fields}
      modalSize="lg"
    />
  );
}

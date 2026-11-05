"use client";

import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { useFormOptions } from "@/lib/admin";
import { formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminShippingMethod, AdminShippingZone } from "@/types/admin";

const methodColumns: Column<AdminShippingMethod>[] = [
  { key: "name", header: "نام", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { key: "carrier_display", header: "حامل" },
  { key: "zone_name", header: "منطقه", render: (r) => r.zone_name || "سراسری" },
  { key: "base_cost", header: "هزینه پایه", render: (r) => formatPriceToman(Number(r.base_cost)) },
  {
    key: "days",
    header: "زمان (روز)",
    align: "center",
    render: (r) => toPersianDigits(`${r.estimated_days_min}-${r.estimated_days_max}`),
  },
  {
    key: "is_active",
    header: "وضعیت",
    align: "center",
    render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
  },
];

const zoneColumns: Column<AdminShippingZone>[] = [
  { key: "name", header: "نام منطقه", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  {
    key: "provinces",
    header: "استان‌ها",
    render: (r) => (r.provinces?.length ? toPersianDigits(r.provinces.length) + " استان" : "سراسری"),
  },
  {
    key: "is_default",
    header: "پیش‌فرض",
    align: "center",
    render: (r) => (r.is_default ? <StatusBadge label="پیش‌فرض" tone="blue" /> : "—"),
  },
];

export default function ShippingPage() {
  const { data: opts } = useFormOptions();

  const methodFields: CrudFieldDef[] = [
    { name: "name", label: "نام روش ارسال", type: "text", required: true },
    {
      name: "carrier",
      label: "حامل",
      type: "select",
      required: true,
      placeholder: undefined,
      options: (opts?.carriers ?? []).map((c) => ({ value: c.value, label: c.label })),
    },
    {
      name: "zone",
      label: "منطقه",
      type: "select",
      placeholder: "سراسری",
      options: (opts?.shipping_zones ?? []).map((z) => ({ value: z.id, label: z.name })),
    },
    { name: "base_cost", label: "هزینه پایه (ریال)", type: "number", defaultValue: 0 },
    { name: "per_kg_cost", label: "هزینه هر کیلو (ریال)", type: "number", defaultValue: 0 },
    { name: "free_shipping_threshold", label: "آستانه ارسال رایگان (ریال)", type: "number" },
    { name: "estimated_days_min", label: "حداقل روز", type: "number", defaultValue: 2 },
    { name: "estimated_days_max", label: "حداکثر روز", type: "number", defaultValue: 5 },
    { name: "sort_order", label: "ترتیب", type: "number", defaultValue: 0 },
    { name: "use_carrier_api", label: "اتصال به API حامل", type: "switch" },
    { name: "is_active", label: "فعال باشد", type: "switch", defaultValue: true },
  ];

  const zoneFields: CrudFieldDef[] = [
    { name: "name", label: "نام منطقه", type: "text", required: true },
    { name: "is_default", label: "منطقه پیش‌فرض", type: "switch" },
  ];

  return (
    <div className="space-y-10">
      <CrudManager<AdminShippingMethod>
        resource="shipping-methods"
        title="روش‌های ارسال"
        subtitle="تعرفه و زمان‌بندی ارسال سفارش‌ها"
        singular="روش ارسال"
        columns={methodColumns}
        fields={methodFields}
        modalSize="lg"
      />
      <CrudManager<AdminShippingZone>
        resource="shipping-zones"
        title="مناطق ارسال"
        subtitle="گروه‌بندی استان‌ها برای تعرفه‌های متفاوت"
        singular="منطقه"
        columns={zoneColumns}
        fields={zoneFields}
      />
    </div>
  );
}

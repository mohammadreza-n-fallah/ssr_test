"use client";

import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { toPersianDigits } from "@/lib/utils";
import type { AdminBrand } from "@/types/admin";

const columns: Column<AdminBrand>[] = [
  {
    key: "logo",
    header: "",
    render: (r) =>
      r.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.logo} alt="" className="h-9 w-9 rounded-lg object-contain bg-gray-50 p-0.5" />
      ) : (
        <div className="h-9 w-9 rounded-lg bg-gray-100" />
      ),
  },
  { key: "name", header: "نام برند", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { key: "name_fa", header: "نام فارسی", render: (r) => r.name_fa || "—" },
  { key: "country", header: "کشور", render: (r) => r.country || "—" },
  { key: "product_count", header: "محصولات", align: "center", render: (r) => toPersianDigits(r.product_count) },
  {
    key: "is_active",
    header: "وضعیت",
    align: "center",
    render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
  },
];

const fields: CrudFieldDef[] = [
  { name: "name", label: "نام برند", type: "text", required: true, ltr: true },
  { name: "name_fa", label: "نام فارسی", type: "text" },
  { name: "slug", label: "اسلاگ", type: "text", ltr: true, hint: "خالی بگذارید تا خودکار ساخته شود" },
  { name: "country", label: "کشور سازنده", type: "text" },
  { name: "logo", label: "لوگو", type: "image" },
  { name: "is_active", label: "فعال باشد", type: "switch", defaultValue: true },
];

export default function BrandsPage() {
  return (
    <CrudManager<AdminBrand>
      resource="brands"
      title="برندهای قطعه"
      subtitle="سازندگان قطعات (بوش، NGK، ...)"
      singular="برند"
      searchPlaceholder="جستجوی برند..."
      columns={columns}
      fields={fields}
    />
  );
}

"use client";

import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { useFormOptions } from "@/lib/admin";
import { toPersianDigits } from "@/lib/utils";
import type { AdminCategory } from "@/types/admin";

export default function CategoriesPage() {
  const { data: opts } = useFormOptions();

  const columns: Column<AdminCategory>[] = [
    {
      key: "image",
      header: "",
      render: (r) =>
        r.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-gray-100" />
        ),
    },
    { key: "name", header: "نام", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: "slug", header: "اسلاگ", render: (r) => <span className="ltr text-xs text-gray-500">{r.slug}</span> },
    { key: "parent_name", header: "والد", render: (r) => r.parent_name || "—" },
    {
      key: "product_count",
      header: "محصولات",
      align: "center",
      render: (r) => toPersianDigits(r.product_count),
    },
    {
      key: "is_active",
      header: "وضعیت",
      align: "center",
      render: (r) => (
        <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />
      ),
    },
  ];

  const fields: CrudFieldDef[] = [
    { name: "name", label: "نام دسته‌بندی", type: "text", required: true },
    { name: "name_en", label: "نام انگلیسی", type: "text", ltr: true },
    { name: "slug", label: "اسلاگ", type: "text", ltr: true, hint: "خالی بگذارید تا خودکار ساخته شود" },
    {
      name: "parent",
      label: "دسته والد",
      type: "select",
      placeholder: "بدون والد",
      options: (opts?.categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "icon", label: "آیکون (نام)", type: "text", ltr: true },
    { name: "description", label: "توضیحات", type: "textarea", full: true },
    { name: "image", label: "تصویر", type: "image" },
    { name: "is_active", label: "فعال باشد", type: "switch", defaultValue: true },
    { name: "meta_title", label: "عنوان سئو", type: "text" },
    { name: "meta_description", label: "توضیحات سئو", type: "textarea", full: true },
  ];

  return (
    <CrudManager<AdminCategory>
      resource="categories"
      title="دسته‌بندی‌ها"
      subtitle="ساختار درختی دسته‌بندی محصولات فروشگاه"
      singular="دسته‌بندی"
      searchPlaceholder="جستجوی دسته‌بندی..."
      columns={columns}
      fields={fields}
      modalSize="lg"
    />
  );
}

"use client";

import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import BlogTabs from "@/components/admin/blog/BlogTabs";
import { toPersianDigits } from "@/lib/utils";
import type { AdminBlogCategory } from "@/types/admin";

const columns: Column<AdminBlogCategory>[] = [
  { key: "name", header: "نام", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { key: "slug", header: "اسلاگ", render: (r) => <span className="ltr text-xs text-gray-500">{r.slug}</span> },
  { key: "post_count", header: "نوشته‌ها", align: "center", render: (r) => toPersianDigits(r.post_count) },
  {
    key: "is_active",
    header: "وضعیت",
    align: "center",
    render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
  },
];

const fields: CrudFieldDef[] = [
  { name: "name", label: "نام دسته", type: "text", required: true },
  { name: "name_en", label: "نام انگلیسی", type: "text", ltr: true },
  { name: "slug", label: "اسلاگ", type: "text", ltr: true, hint: "خالی = خودکار" },
  { name: "description", label: "توضیحات", type: "textarea", full: true },
  { name: "is_active", label: "فعال", type: "switch", defaultValue: true },
];

export default function BlogCategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <BlogTabs />
      <CrudManager<AdminBlogCategory>
        resource="blog-categories"
        title="دسته‌های بلاگ"
        subtitle="دسته‌بندی محتوای بلاگ"
        singular="دسته"
        columns={columns}
        fields={fields}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { useList, useCrud, useFormOptions } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Button from "@/components/admin/ui/Button";
import { SearchBox, FilterTabs, IconButton } from "@/components/admin/ui/controls";
import { SelectInput } from "@/components/admin/ui/fields";
import Pagination from "@/components/product/Pagination";
import { cn, formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminProductListItem } from "@/types/admin";

const PART_TYPE: Record<string, string> = { original: "اصل", oem: "OEM", aftermarket: "بازار" };
const TABS = [
  { value: "", label: "همه" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
  { value: "featured", label: "ویژه" },
];

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<AdminProductListItem | null>(null);

  const { data: opts } = useFormOptions();
  const filters: Record<string, boolean | number | string> = {};
  if (tab === "active") filters.is_active = true;
  if (tab === "inactive") filters.is_active = false;
  if (tab === "featured") filters.is_featured = true;
  if (category) filters.category = category;

  const { data, isLoading } = useList<AdminProductListItem>("products", {
    page,
    search: search || undefined,
    ...filters,
  });
  const crud = useCrud("products");

  const columns: Column<AdminProductListItem>[] = [
    {
      key: "name",
      header: "محصول",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.primary_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.primary_image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
          )}
          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900">{r.name}</div>
            <div className="ltr text-xs text-gray-400">{r.sku}</div>
          </div>
        </div>
      ),
    },
    { key: "category_name", header: "دسته", render: (r) => r.category_name || "—" },
    {
      key: "part_type",
      header: "نوع",
      align: "center",
      render: (r) => <StatusBadge label={PART_TYPE[r.part_type] ?? r.part_type} tone="gray" />,
    },
    { key: "price", header: "قیمت", render: (r) => (r.price ? formatPriceToman(r.price) : "—") },
    {
      key: "stock",
      header: "موجودی",
      align: "center",
      render: (r) => (
        <span className={cn("font-bold", r.stock <= 0 ? "text-red-600" : r.stock < 10 ? "text-amber-600" : "text-gray-700")}>
          {toPersianDigits(r.stock)}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />
          {r.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <AdminHeader title="محصولات" subtitle="مدیریت کامل کاتالوگ، تنوع‌ها، تصاویر و سازگاری">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => router.push("/admin/products/new")}>
          محصول جدید
        </Button>
      </AdminHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو با نام، کد، OEM..." className="w-full sm:w-72" />
        <FilterTabs items={TABS} value={tab} onChange={(v) => { setTab(v); setPage(1); }} />
        <SelectInput
          options={(opts?.categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
          placeholder="همه دسته‌ها"
          value={category}
          onChange={(v) => { setCategory(v); setPage(1); }}
          className="w-44"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminProductListItem).id}
        emptyText="محصولی یافت نشد"
        onRowClick={(r) => router.push(`/admin/products/${r.id}`)}
        actions={(r) => (
          <>
            <IconButton title={r.is_active ? "غیرفعال‌کردن" : "فعال‌کردن"} onClick={() => crud.act.mutate({ id: r.id, action: "toggle_active" })}>
              {r.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </IconButton>
            <IconButton title="ویرایش" tone="primary" onClick={() => router.push(`/admin/products/${r.id}`)}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton title="حذف" tone="danger" onClick={() => setDel(r)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      />

      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message={`محصول «${del?.name}» و همه تنوع‌ها و تصاویر آن حذف خواهد شد.`}
      />
    </div>
  );
}

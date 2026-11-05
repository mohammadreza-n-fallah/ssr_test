"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Boxes, Zap } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { IconButton } from "@/components/admin/ui/controls";
import { TextInput, NumberInput, Switch, ImageUpload, Field } from "@/components/admin/ui/fields";
import VariantPicker from "@/components/admin/products/VariantPicker";
import { formatDateTime, formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminFlashSale, AdminFlashSaleItem, AdminVariant } from "@/types/admin";

interface SaleForm {
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  banner: File | null;
}
const emptySale: SaleForm = { name: "", slug: "", start_at: "", end_at: "", is_active: true, banner: null };

export default function FlashSalesPage() {
  const { data, isLoading } = useList<AdminFlashSale>("flash-sales", { page_size: 50 });
  const crud = useCrud("flash-sales", { onDone: () => setEdit(null) });

  const [edit, setEdit] = useState<AdminFlashSale | "new" | null>(null);
  const [del, setDel] = useState<AdminFlashSale | null>(null);
  const [items, setItems] = useState<AdminFlashSale | null>(null);
  const [form, setForm] = useState<SaleForm>(emptySale);

  const openEdit = (s?: AdminFlashSale) => {
    setForm(
      s
        ? { name: s.name, slug: s.slug, start_at: s.start_at?.slice(0, 16) || "", end_at: s.end_at?.slice(0, 16) || "", is_active: s.is_active, banner: null }
        : emptySale
    );
    setEdit(s ?? "new");
  };

  const save = () => {
    const data: Record<string, unknown> = { name: form.name, is_active: form.is_active };
    if (form.slug) data.slug = form.slug;
    if (form.start_at) data.start_at = form.start_at;
    if (form.end_at) data.end_at = form.end_at;
    if (form.banner) data.banner = form.banner;
    if (edit === "new") crud.create.mutate(data);
    else if (edit) crud.update.mutate({ id: edit.id, data });
  };

  const set = (k: keyof SaleForm, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const columns: Column<AdminFlashSale>[] = [
    {
      key: "name",
      header: "کمپین",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-gray-900">
          <Zap className="h-4 w-4 text-[#f97316]" />
          {r.name}
        </span>
      ),
    },
    { key: "start_at", header: "شروع", render: (r) => <span className="text-xs text-gray-500">{formatDateTime(r.start_at)}</span> },
    { key: "end_at", header: "پایان", render: (r) => <span className="text-xs text-gray-500">{formatDateTime(r.end_at)}</span> },
    { key: "items_count", header: "اقلام", align: "center", render: (r) => toPersianDigits(r.items_count) },
    {
      key: "is_active",
      header: "وضعیت",
      align: "center",
      render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <AdminHeader title="فروش ویژه" subtitle="کمپین‌های فروش با زمان و قیمت محدود">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => openEdit()}>
          کمپین جدید
        </Button>
      </AdminHeader>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminFlashSale).id}
        emptyText="کمپینی ثبت نشده است"
        actions={(r) => (
          <>
            <IconButton title="مدیریت اقلام" tone="default" onClick={() => setItems(r)}>
              <Boxes className="h-4 w-4" />
            </IconButton>
            <IconButton title="ویرایش" tone="primary" onClick={() => openEdit(r)}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton title="حذف" tone="danger" onClick={() => setDel(r)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      />

      {/* Create / edit sale */}
      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        title={edit === "new" ? "کمپین جدید" : "ویرایش کمپین"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>انصراف</Button>
            <Button loading={crud.create.isPending || crud.update.isPending} onClick={save}>ذخیره</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput label="نام کمپین" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <TextInput label="اسلاگ" ltr hint="خالی = خودکار" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          <Field label="شروع">
            <input type="datetime-local" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" value={form.start_at} onChange={(e) => set("start_at", e.target.value)} />
          </Field>
          <Field label="پایان">
            <input type="datetime-local" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" value={form.end_at} onChange={(e) => set("end_at", e.target.value)} />
          </Field>
          <ImageUpload label="بنر" value={form.banner} current={edit !== "new" ? edit?.banner : null} onChange={(f) => set("banner", f)} />
          <div className="rounded-xl border border-gray-200 px-3.5 py-2">
            <Switch label="فعال" checked={form.is_active} onChange={(v) => set("is_active", v)} />
          </div>
        </div>
      </Modal>

      {items && <ItemsModal sale={items} onClose={() => setItems(null)} />}

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message={`کمپین «${del?.name}» حذف خواهد شد.`}
      />
    </div>
  );
}

function ItemsModal({ sale, onClose }: { sale: AdminFlashSale; onClose: () => void }) {
  const { data, isLoading } = useList<AdminFlashSaleItem>("flash-sale-items", { flash_sale: sale.id, page_size: 100 });
  const crud = useCrud("flash-sale-items");
  const [variant, setVariant] = useState<AdminVariant | null>(null);
  const [price, setPrice] = useState("");
  const [limit, setLimit] = useState("");

  const add = () => {
    if (!variant || !price) return;
    const data: Record<string, unknown> = { flash_sale: sale.id, variant: variant.id, sale_price: Number(price) };
    if (limit) data.quantity_limit = Number(limit);
    crud.create.mutate(data, {
      onSuccess: () => {
        setVariant(null);
        setPrice("");
        setLimit("");
      },
    });
  };

  return (
    <Modal open onClose={onClose} title={`اقلام کمپین: ${sale.name}`} size="lg">
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
        <VariantPicker onSelect={setVariant} selectedLabel={variant ? `${variant.product_name} — ${variant.sku}` : undefined} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberInput label="قیمت ویژه (ریال)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <NumberInput label="سقف تعداد (اختیاری)" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" icon={<Plus className="h-4 w-4" />} loading={crud.create.isPending} disabled={!variant || !price} onClick={add}>
            افزودن کالا
          </Button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-gray-50">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-gray-400">در حال بارگذاری…</p>
        ) : (data?.results ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">هنوز کالایی به این کمپین اضافه نشده است.</p>
        ) : (
          data?.results.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <div className="truncate text-gray-800">{it.product_name}</div>
                <div className="ltr text-xs text-gray-400">{it.variant_sku}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-medium text-[#f97316]">{formatPriceToman(Number(it.sale_price))}</span>
                <IconButton title="حذف" tone="danger" onClick={() => crud.remove.mutate(it.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

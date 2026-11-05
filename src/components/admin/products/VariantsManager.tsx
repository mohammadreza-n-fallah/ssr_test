"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useList, useCrud, useFormOptions } from "@/lib/admin";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { IconButton } from "@/components/admin/ui/controls";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { TextInput, NumberInput, SelectInput, Switch } from "@/components/admin/ui/fields";
import { formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminVariant } from "@/types/admin";

interface VForm {
  sku: string;
  price: string | number;
  compare_price: string | number;
  stock: string | number;
  low_stock_threshold: string | number;
  part_type: string;
  weight: string | number;
  is_active: boolean;
}
const empty: VForm = { sku: "", price: "", compare_price: "", stock: 0, low_stock_threshold: 5, part_type: "", weight: "", is_active: true };

export default function VariantsManager({ productId }: { productId: number }) {
  const { data, isLoading } = useList<AdminVariant>("variants", { product: productId, page_size: 100 });
  const { data: opts } = useFormOptions();
  const [edit, setEdit] = useState<AdminVariant | "new" | null>(null);
  const [del, setDel] = useState<AdminVariant | null>(null);
  const [form, setForm] = useState<VForm>(empty);
  const crud = useCrud("variants", { onDone: () => setEdit(null) });

  const open = (v?: AdminVariant) => {
    setForm(
      v
        ? {
            sku: v.sku,
            price: v.price,
            compare_price: v.compare_price ?? "",
            stock: v.stock,
            low_stock_threshold: v.low_stock_threshold,
            part_type: v.part_type || "",
            weight: v.weight ?? "",
            is_active: v.is_active,
          }
        : empty
    );
    setEdit(v ?? "new");
  };

  const save = () => {
    const data: Record<string, unknown> = {
      sku: form.sku,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      part_type: form.part_type,
      is_active: form.is_active,
    };
    if (form.compare_price !== "") data.compare_price = Number(form.compare_price);
    if (form.weight !== "") data.weight = Number(form.weight);
    if (edit === "new") crud.create.mutate({ ...data, product: productId });
    else if (edit) crud.update.mutate({ id: edit.id, data });
  };

  const set = (k: keyof VForm, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const columns: Column<AdminVariant>[] = [
    { key: "sku", header: "کد تنوع", render: (r) => <span className="ltr font-medium">{r.sku}</span> },
    {
      key: "price",
      header: "قیمت",
      render: (r) => (
        <div>
          <span className="font-medium">{formatPriceToman(Number(r.price))}</span>
          {r.discount_percent > 0 && <span className="mr-1 text-xs text-[#f97316]">({toPersianDigits(r.discount_percent)}٪)</span>}
        </div>
      ),
    },
    {
      key: "stock",
      header: "موجودی",
      align: "center",
      render: (r) => <span className={r.stock <= 0 ? "font-bold text-red-600" : "font-bold text-gray-700"}>{toPersianDigits(r.stock)}</span>,
    },
    {
      key: "is_active",
      header: "وضعیت",
      align: "center",
      render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => open()}>
          افزودن تنوع
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminVariant).id}
        emptyText="هنوز تنوعی اضافه نشده — برای فروش، حداقل یک تنوع لازم است"
        actions={(r) => (
          <>
            <IconButton title="ویرایش" tone="primary" onClick={() => open(r)}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton title="حذف" tone="danger" onClick={() => setDel(r)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      />

      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        title={edit === "new" ? "افزودن تنوع" : "ویرایش تنوع"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>انصراف</Button>
            <Button loading={crud.create.isPending || crud.update.isPending} onClick={save}>ذخیره</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="کد تنوع (SKU)" required ltr className="col-span-2" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          <NumberInput label="قیمت (ریال)" required value={form.price} onChange={(e) => set("price", e.target.value)} />
          <NumberInput label="قیمت قبل از تخفیف" value={form.compare_price} onChange={(e) => set("compare_price", e.target.value)} />
          <NumberInput label="موجودی" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          <NumberInput label="آستانه هشدار موجودی" value={form.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} />
          <SelectInput
            label="نوع قطعه"
            placeholder="مثل محصول"
            options={(opts?.part_types ?? []).map((p) => ({ value: p.value, label: p.label }))}
            value={form.part_type}
            onChange={(v) => set("part_type", v)}
          />
          <NumberInput label="وزن (کیلوگرم)" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          <div className="col-span-2 rounded-xl border border-gray-200 px-3.5 py-2">
            <Switch label="فعال" checked={form.is_active} onChange={(v) => set("is_active", v)} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message="این تنوع حذف خواهد شد."
      />
    </div>
  );
}

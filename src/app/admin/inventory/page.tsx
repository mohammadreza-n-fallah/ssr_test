"use client";

import { useState } from "react";
import { Warehouse as WarehouseIcon, Boxes, History, Plus, Minus, SlidersHorizontal } from "lucide-react";
import { useList, useCrud, useFormOptions } from "@/lib/admin";
import CrudManager, { type CrudFieldDef } from "@/components/admin/CrudManager";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import { SearchBox, IconButton } from "@/components/admin/ui/controls";
import { SelectInput, NumberInput, TextInput } from "@/components/admin/ui/fields";
import Pagination from "@/components/product/Pagination";
import { cn, formatDateTime, toPersianDigits } from "@/lib/utils";
import type { AdminStockItem, AdminStockMovement, AdminWarehouse } from "@/types/admin";

const warehouseColumns: Column<AdminWarehouse>[] = [
  { key: "name", header: "نام انبار", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { key: "code", header: "کد", render: (r) => <span className="ltr text-xs text-gray-500">{r.code}</span> },
  { key: "city", header: "شهر", render: (r) => `${r.province} / ${r.city}` },
  { key: "priority", header: "اولویت", align: "center", render: (r) => toPersianDigits(r.priority) },
  { key: "stock_items_count", header: "اقلام", align: "center", render: (r) => toPersianDigits(r.stock_items_count) },
  {
    key: "is_active",
    header: "وضعیت",
    align: "center",
    render: (r) => <StatusBadge label={r.is_active ? "فعال" : "غیرفعال"} status={r.is_active ? "active" : "inactive"} />,
  },
];

const warehouseFields: CrudFieldDef[] = [
  { name: "name", label: "نام انبار", type: "text", required: true },
  { name: "code", label: "کد انبار", type: "text", required: true, ltr: true, hint: "یکتا، مثلاً tehran-1" },
  { name: "province", label: "استان", type: "text", required: true },
  { name: "city", label: "شهر", type: "text", required: true },
  { name: "address", label: "آدرس", type: "textarea", full: true },
  { name: "priority", label: "اولویت تأمین", type: "number", defaultValue: 10, hint: "کمتر = اولویت بالاتر" },
  { name: "is_active", label: "فعال", type: "switch", defaultValue: true },
  { name: "ships_orders", label: "ارسال سفارش از این انبار", type: "switch", defaultValue: true },
];

export default function InventoryPage() {
  const [tab, setTab] = useState<"warehouses" | "stock" | "movements">("warehouses");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 w-fit">
        <TabBtn active={tab === "warehouses"} onClick={() => setTab("warehouses")} icon={WarehouseIcon} label="انبارها" />
        <TabBtn active={tab === "stock"} onClick={() => setTab("stock")} icon={Boxes} label="موجودی" />
        <TabBtn active={tab === "movements"} onClick={() => setTab("movements")} icon={History} label="تراکنش‌ها" />
      </div>

      {tab === "warehouses" && (
        <CrudManager<AdminWarehouse>
          resource="warehouses"
          title="انبارها"
          subtitle="مدیریت مراکز توزیع و موجودی"
          singular="انبار"
          columns={warehouseColumns}
          fields={warehouseFields}
          modalSize="lg"
        />
      )}
      {tab === "stock" && <StockTab />}
      {tab === "movements" && <MovementsTab />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Boxes; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors",
        active ? "bg-[#1e3a8a] text-white font-medium" : "text-gray-500 hover:text-gray-900"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StockTab() {
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [page, setPage] = useState(1);
  const [adjust, setAdjust] = useState<AdminStockItem | null>(null);
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");

  const { data: opts } = useFormOptions();
  const { data, isLoading } = useList<AdminStockItem>("stock-items", {
    page,
    search: search || undefined,
    warehouse: warehouse || undefined,
  });
  const crud = useCrud("stock-items");

  const columns: Column<AdminStockItem>[] = [
    {
      key: "product_name",
      header: "محصول",
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-gray-900">{r.product_name}</div>
          <div className="ltr text-xs text-gray-400">{r.variant_sku}</div>
        </div>
      ),
    },
    { key: "warehouse_name", header: "انبار" },
    { key: "quantity", header: "موجودی", align: "center", render: (r) => <b>{toPersianDigits(r.quantity)}</b> },
    { key: "reserved", header: "رزرو", align: "center", render: (r) => toPersianDigits(r.reserved) },
    {
      key: "available",
      header: "قابل فروش",
      align: "center",
      render: (r) => <span className={r.available <= 0 ? "font-bold text-red-600" : "font-bold text-green-600"}>{toPersianDigits(r.available)}</span>,
    },
    { key: "bin_location", header: "قفسه", render: (r) => <span className="ltr text-xs text-gray-400">{r.bin_location || "—"}</span> },
  ];

  const doAdjust = (delta: number) => {
    if (!adjust) return;
    crud.act.mutate(
      { id: adjust.id, action: "adjust", data: { change: delta, note } },
      { onSuccess: () => { setAdjust(null); setChange(""); setNote(""); } }
    );
  };

  return (
    <>
      <AdminHeader title="موجودی انبار" subtitle="مدیریت و اصلاح موجودی هر کالا در هر انبار" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو با کد یا نام محصول..." className="w-full sm:w-72" />
        <SelectInput
          options={(opts?.warehouses ?? []).map((w) => ({ value: w.id, label: w.name }))}
          placeholder="همه انبارها"
          value={warehouse}
          onChange={(v) => { setWarehouse(v); setPage(1); }}
          className="w-48"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminStockItem).id}
        emptyText="رکورد موجودی یافت نشد"
        actions={(r) => (
          <IconButton title="اصلاح موجودی" tone="primary" onClick={() => setAdjust(r)}>
            <SlidersHorizontal className="h-4 w-4" />
          </IconButton>
        )}
      />
      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}

      <Modal
        open={adjust !== null}
        onClose={() => setAdjust(null)}
        title="اصلاح موجودی"
        description={adjust ? `${adjust.product_name} — ${adjust.variant_sku}` : ""}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdjust(null)}>انصراف</Button>
            <Button variant="danger" icon={<Minus className="h-4 w-4" />} loading={crud.act.isPending} onClick={() => doAdjust(-Math.abs(Number(change) || 0))}>
              کسر
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} loading={crud.act.isPending} onClick={() => doAdjust(Math.abs(Number(change) || 0))}>
              افزودن
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="rounded-lg bg-gray-50 p-2 text-center text-sm text-gray-600">
            موجودی فعلی: <b>{adjust ? toPersianDigits(adjust.quantity) : ""}</b>
          </p>
          <NumberInput label="تعداد" placeholder="مثلاً ۱۰" value={change} onChange={(e) => setChange(e.target.value)} />
          <TextInput label="توضیح (اختیاری)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}

function MovementsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useList<AdminStockMovement>("stock-movements", { page });

  const columns: Column<AdminStockMovement>[] = [
    { key: "created_at", header: "زمان", render: (r) => <span className="text-xs text-gray-400">{formatDateTime(r.created_at)}</span> },
    { key: "variant_sku", header: "کالا", render: (r) => <span className="ltr text-xs">{r.variant_sku}</span> },
    { key: "warehouse_name", header: "انبار" },
    { key: "reason_display", header: "علت", render: (r) => <StatusBadge label={r.reason_display} tone="gray" /> },
    {
      key: "change",
      header: "تغییر",
      align: "center",
      render: (r) => (
        <span className={cn("font-bold", r.change >= 0 ? "text-green-600" : "text-red-600")}>
          {r.change >= 0 ? "+" : "−"}
          {toPersianDigits(Math.abs(r.change))}
        </span>
      ),
    },
    { key: "reference", header: "مرجع", render: (r) => <span className="ltr text-xs text-gray-400">{r.reference || "—"}</span> },
  ];

  return (
    <>
      <AdminHeader title="تراکنش‌های انبار" subtitle="تاریخچه کامل تغییرات موجودی" />
      <DataTable columns={columns} rows={data?.results} isLoading={isLoading} rowKey={(r) => (r as AdminStockMovement).id} emptyText="تراکنشی ثبت نشده است" />
      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}
    </>
  );
}

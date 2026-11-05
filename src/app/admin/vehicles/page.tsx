"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, Car } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { TextInput, NumberInput, Switch, ImageUpload } from "@/components/admin/ui/fields";
import { IconButton } from "@/components/admin/ui/controls";
import { cn, toPersianDigits } from "@/lib/utils";
import type { AdminCarBrand, AdminCarModel, AdminCarYear } from "@/types/admin";

type Kind = "car-brands" | "car-models" | "car-years";
interface Row {
  id: number;
  [k: string]: unknown;
}

function Panel({
  title,
  count,
  children,
  onAdd,
  disabled,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  onAdd?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">
          {title}
          {count !== undefined && <span className="mr-1 text-gray-400">({toPersianDigits(count)})</span>}
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={disabled}
            className="rounded-lg p-1.5 text-[#1e3a8a] hover:bg-blue-50 disabled:opacity-30"
            aria-label="افزودن"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">{children}</div>
    </div>
  );
}

function ListRow({
  label,
  sub,
  active,
  onClick,
  onEdit,
  onDelete,
  selectable,
}: {
  label: string;
  sub?: string;
  active?: boolean;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  selectable?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors",
        active ? "bg-blue-50" : "hover:bg-gray-50",
        selectable && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-800">{label}</div>
        {sub && <div className="truncate text-xs text-gray-400">{sub}</div>}
      </div>
      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton title="ویرایش" tone="primary" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton title="حذف" tone="danger" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {selectable && <ChevronLeft className="h-4 w-4 shrink-0 text-gray-300" />}
    </div>
  );
}

export default function VehiclesPage() {
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);

  const brands = useList<AdminCarBrand>("car-brands", { page_size: 100 });
  const models = useList<AdminCarModel>("car-models", { page_size: 100, brand: brandId ?? undefined }, {
    enabled: brandId !== null,
  });
  const years = useList<AdminCarYear>("car-years", { page_size: 100, model: modelId ?? undefined }, {
    enabled: modelId !== null,
  });

  const [modal, setModal] = useState<{ kind: Kind; row?: Row } | null>(null);
  const [del, setDel] = useState<{ kind: Kind; row: Row } | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const crud = {
    "car-brands": useCrud("car-brands", { onDone: () => setModal(null) }),
    "car-models": useCrud("car-models", { onDone: () => setModal(null) }),
    "car-years": useCrud("car-years", { onDone: () => setModal(null) }),
  };
  const delCrud = {
    "car-brands": useCrud("car-brands", { onDone: () => setDel(null) }),
    "car-models": useCrud("car-models", { onDone: () => setDel(null) }),
    "car-years": useCrud("car-years", { onDone: () => setDel(null) }),
  };

  const open = (kind: Kind, row?: Row) => {
    setForm(
      row
        ? { ...row, image: null, logo: null }
        : kind === "car-years"
        ? { year: "", year_shamsi: "", engine: "", is_active: true }
        : { name: "", name_en: "", slug: "", is_active: true, sort_order: 0 }
    );
    setModal({ kind, row });
  };

  const save = () => {
    if (!modal) return;
    const { kind, row } = modal;
    const data: Record<string, unknown> = { ...form };
    if (kind === "car-models") data.brand = brandId;
    if (kind === "car-years") data.model = modelId;
    // strip nulls for images so existing files stay
    if (data.image == null) delete data.image;
    if (data.logo == null) delete data.logo;
    if (row) crud[kind].update.mutate({ id: row.id, data });
    else crud[kind].create.mutate(data);
  };

  const setF = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const busy = modal ? crud[modal.kind].create.isPending || crud[modal.kind].update.isPending : false;

  return (
    <div className="max-w-7xl mx-auto">
      <AdminHeader title="خودروها" subtitle="برندها، مدل‌ها و سال‌های تولید برای ماتریس سازگاری قطعات" />

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Brands */}
        <Panel title="برندهای خودرو" count={brands.data?.count} onAdd={() => open("car-brands")}>
          {brands.data?.results.map((b) => (
            <ListRow
              key={b.id}
              label={b.name}
              sub={`${toPersianDigits(b.models_count)} مدل`}
              active={b.id === brandId}
              selectable
              onClick={() => {
                setBrandId(b.id);
                setModelId(null);
              }}
              onEdit={() => open("car-brands", b as unknown as Row)}
              onDelete={() => setDel({ kind: "car-brands", row: b as unknown as Row })}
            />
          ))}
          {brands.data?.results.length === 0 && <Empty />}
        </Panel>

        {/* Models */}
        <Panel
          title="مدل‌ها"
          count={brandId ? models.data?.count : undefined}
          onAdd={brandId ? () => open("car-models") : undefined}
          disabled={!brandId}
        >
          {!brandId ? (
            <Hint text="یک برند را انتخاب کنید" />
          ) : (
            <>
              {models.data?.results.map((m) => (
                <ListRow
                  key={m.id}
                  label={m.name}
                  sub={`${toPersianDigits(m.years_count)} سال`}
                  active={m.id === modelId}
                  selectable
                  onClick={() => setModelId(m.id)}
                  onEdit={() => open("car-models", m as unknown as Row)}
                  onDelete={() => setDel({ kind: "car-models", row: m as unknown as Row })}
                />
              ))}
              {models.data?.results.length === 0 && <Empty />}
            </>
          )}
        </Panel>

        {/* Years */}
        <Panel
          title="سال‌های تولید"
          count={modelId ? years.data?.count : undefined}
          onAdd={modelId ? () => open("car-years") : undefined}
          disabled={!modelId}
        >
          {!modelId ? (
            <Hint text="یک مدل را انتخاب کنید" />
          ) : (
            <>
              {years.data?.results.map((y) => (
                <ListRow
                  key={y.id}
                  label={toPersianDigits(y.year)}
                  sub={[y.year_shamsi, y.engine].filter(Boolean).join(" • ")}
                  onEdit={() => open("car-years", y as unknown as Row)}
                  onDelete={() => setDel({ kind: "car-years", row: y as unknown as Row })}
                />
              ))}
              {years.data?.results.length === 0 && <Empty />}
            </>
          )}
        </Panel>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={
          (modal?.row ? "ویرایش " : "افزودن ") +
          (modal?.kind === "car-brands" ? "برند" : modal?.kind === "car-models" ? "مدل" : "سال")
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              انصراف
            </Button>
            <Button onClick={save} loading={busy}>
              ذخیره
            </Button>
          </>
        }
      >
        {modal?.kind === "car-years" ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="سال میلادی" required value={(form.year as string) ?? ""} onChange={(e) => setF("year", e.target.value)} />
            <TextInput label="سال شمسی" value={(form.year_shamsi as string) ?? ""} onChange={(e) => setF("year_shamsi", e.target.value)} />
            <TextInput label="موتور" className="col-span-2" value={(form.engine as string) ?? ""} onChange={(e) => setF("engine", e.target.value)} />
            <div className="col-span-2 rounded-xl border border-gray-200 px-3.5 py-2">
              <Switch label="فعال" checked={!!form.is_active} onChange={(v) => setF("is_active", v)} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="نام" required value={(form.name as string) ?? ""} onChange={(e) => setF("name", e.target.value)} />
            <TextInput label="نام انگلیسی" ltr value={(form.name_en as string) ?? ""} onChange={(e) => setF("name_en", e.target.value)} />
            <TextInput label="اسلاگ" ltr className="col-span-2" hint="خالی = خودکار" value={(form.slug as string) ?? ""} onChange={(e) => setF("slug", e.target.value)} />
            {modal?.kind === "car-brands" ? (
              <>
                <NumberInput label="ترتیب نمایش" value={(form.sort_order as string) ?? 0} onChange={(e) => setF("sort_order", e.target.value)} />
                <ImageUpload label="لوگو" value={(form.logo as File) ?? null} current={(modal?.row?.logo as string) ?? null} onChange={(f) => setF("logo", f)} />
              </>
            ) : (
              <ImageUpload label="تصویر" value={(form.image as File) ?? null} current={(modal?.row?.image as string) ?? null} onChange={(f) => setF("image", f)} />
            )}
            <div className="col-span-2 rounded-xl border border-gray-200 px-3.5 py-2">
              <Switch label="فعال" checked={!!form.is_active} onChange={(v) => setF("is_active", v)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={del ? delCrud[del.kind].remove.isPending : false}
        onConfirm={() => {
          if (del)
            delCrud[del.kind].remove.mutate(del.row.id, {
              onSuccess: () => {
                if (del.kind === "car-brands" && del.row.id === brandId) setBrandId(null);
                if (del.kind === "car-models" && del.row.id === modelId) setModelId(null);
              },
            });
        }}
        message="با حذف این مورد، زیرمجموعه‌های آن نیز حذف می‌شوند."
      />
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-gray-400">موردی ثبت نشده است</p>;
}
function Hint({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-gray-300">
      <Car className="h-8 w-8" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

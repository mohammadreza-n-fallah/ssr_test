"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud, useList } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import Button from "@/components/admin/ui/Button";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SearchBox, FilterTabs, IconButton, type TabItem } from "@/components/admin/ui/controls";
import Pagination from "@/components/product/Pagination";
import {
  Field,
  TextInput,
  NumberInput,
  TextArea,
  SelectInput,
  Switch,
  ImageUpload,
  type Option,
} from "@/components/admin/ui/fields";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "image"
  | "datetime";

export interface CrudFieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: Option[];
  defaultValue?: unknown;
  ltr?: boolean;
  full?: boolean; // span both columns
  show?: (form: Record<string, unknown>) => boolean;
}

interface CrudManagerProps<T> {
  resource: string;
  title: string;
  subtitle?: string;
  singular: string; // for "create X" button & modal title
  columns: Column<T>[];
  fields: CrudFieldDef[];
  searchPlaceholder?: string;
  filter?: { param: string; tabs: TabItem[] };
  rowId?: (row: T) => number;
  toForm?: (row: T) => Record<string, unknown>;
  defaultParams?: Record<string, string | number | boolean>;
  modalSize?: "sm" | "md" | "lg" | "xl";
  canCreate?: boolean;
  canDelete?: boolean;
}

function defaultsFor(fields: CrudFieldDef[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    out[f.name] = f.defaultValue ?? (f.type === "switch" ? false : f.type === "image" ? null : "");
  }
  return out;
}

export default function CrudManager<T extends { id: number }>({
  resource,
  title,
  subtitle,
  singular,
  columns,
  fields,
  searchPlaceholder,
  filter,
  rowId = (r) => r.id as number,
  toForm,
  defaultParams,
  modalSize = "md",
  canCreate = true,
  canDelete = true,
}: CrudManagerProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState(filter?.tabs[0]?.value ?? "");
  const [editing, setEditing] = useState<T | null | "new">(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const params = {
    page,
    search: search || undefined,
    ...defaultParams,
    ...(filter && filterValue ? { [filter.param]: filterValue } : {}),
  };
  const { data, isLoading, isFetching } = useList<T>(resource, params);

  const crud = useCrud(resource, { onDone: () => setEditing(null) });

  const openCreate = () => {
    setForm(defaultsFor(fields));
    setEditing("new");
  };
  const openEdit = (row: T) => {
    setForm(toForm ? toForm(row) : pickFields(row as unknown as Record<string, unknown>, fields));
    setEditing(row);
  };

  const deletingLabel = (() => {
    if (!deleting) return "این مورد";
    const d = deleting as unknown as Record<string, unknown>;
    return (d.name as string) || (d.title as string) || (d.code as string) || "این مورد";
  })();

  const setField = (name: string, value: unknown) =>
    setForm((f) => ({ ...f, [name]: value }));

  const submit = () => {
    const payload = buildPayload(form, fields, editing === "new");
    if (editing === "new") crud.create.mutate(payload);
    else if (editing) crud.update.mutate({ id: rowId(editing), data: payload });
  };

  const confirmDelete = () => {
    if (deleting) crud.remove.mutate(rowId(deleting), { onSuccess: () => setDeleting(null) });
  };

  const visibleFields = useMemo(
    () => fields.filter((f) => !f.show || f.show(form)),
    [fields, form]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <AdminHeader title={title} subtitle={subtitle}>
        {canCreate && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            افزودن {singular}
          </Button>
        )}
      </AdminHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          onSearch={(q) => {
            setSearch(q);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="w-full sm:w-72"
        />
        {filter && (
          <FilterTabs
            items={filter.tabs}
            value={filterValue}
            onChange={(v) => {
              setFilterValue(v);
              setPage(1);
            }}
          />
        )}
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => rowId(r as T)}
        actions={(row) => (
          <>
            <IconButton title="ویرایش" tone="primary" onClick={() => openEdit(row)}>
              <Pencil className="w-4 h-4" />
            </IconButton>
            {canDelete && (
              <IconButton title="حذف" tone="danger" onClick={() => setDeleting(row)}>
                <Trash2 className="w-4 h-4" />
              </IconButton>
            )}
          </>
        )}
      />

      {data && data.total_pages > 1 && (
        <Pagination
          currentPage={data.current_page}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      )}
      {isFetching && !isLoading && (
        <p className="mt-3 text-center text-xs text-gray-400">در حال بروزرسانی…</p>
      )}

      {/* Create / edit modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        size={modalSize}
        title={editing === "new" ? `افزودن ${singular}` : `ویرایش ${singular}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              انصراف
            </Button>
            <Button
              onClick={submit}
              loading={crud.create.isPending || crud.update.isPending}
            >
              ذخیره
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {visibleFields.map((f) => (
            <FieldRenderer
              key={f.name}
              field={f}
              value={form[f.name]}
              row={editing && editing !== "new" ? editing : undefined}
              onChange={(v) => setField(f.name, v)}
            />
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={crud.remove.isPending}
        message={`«${deletingLabel}» حذف خواهد شد. این عمل قابل بازگشت نیست.`}
      />
    </div>
  );
}

function pickFields(row: Record<string, unknown>, fields: CrudFieldDef[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = f.type === "image" ? null : row[f.name] ?? "";
  return out;
}

function buildPayload(
  form: Record<string, unknown>,
  fields: CrudFieldDef[],
  isCreate: boolean
) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form[f.name];
    if (f.type === "image") {
      if (v instanceof File) out[f.name] = v; // only send when newly picked
      continue;
    }
    if (f.type === "switch") {
      out[f.name] = !!v;
      continue;
    }
    if (v === "" || v === undefined || v === null) {
      if (isCreate && f.required) out[f.name] = v; // let backend validate
      continue; // omit empties so optional/nullable fields keep their value
    }
    out[f.name] = f.type === "number" ? Number(v) : v;
  }
  return out;
}

function FieldRenderer({
  field,
  value,
  row,
  onChange,
}: {
  field: CrudFieldDef;
  value: unknown;
  row?: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  const wrap = field.full ? "sm:col-span-2" : "";
  switch (field.type) {
    case "textarea":
      return (
        <TextArea
          label={field.label}
          required={field.required}
          hint={field.hint}
          placeholder={field.placeholder}
          className={wrap || "sm:col-span-2"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <NumberInput
          label={field.label}
          required={field.required}
          hint={field.hint}
          placeholder={field.placeholder}
          className={wrap}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <SelectInput
          label={field.label}
          required={field.required}
          hint={field.hint}
          className={wrap}
          options={field.options ?? []}
          placeholder={field.placeholder ?? "انتخاب کنید"}
          value={value as string}
          onChange={onChange}
        />
      );
    case "switch":
      return (
        <div className={`${wrap} rounded-xl border border-gray-200 px-3.5 py-2`}>
          <Switch
            label={field.label}
            hint={field.hint}
            checked={!!value}
            onChange={onChange}
          />
        </div>
      );
    case "image":
      return (
        <ImageUpload
          label={field.label}
          value={(value as File) ?? null}
          current={(row?.[field.name] as string) ?? null}
          onChange={onChange}
        />
      );
    case "datetime":
      return (
        <Field label={field.label} hint={field.hint} className={wrap}>
          <input
            type="datetime-local"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
            value={toLocalInput(value as string)}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    default:
      return (
        <TextInput
          label={field.label}
          required={field.required}
          hint={field.hint}
          placeholder={field.placeholder}
          ltr={field.ltr}
          className={wrap}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

// ISO → value usable by <input type=datetime-local>
function toLocalInput(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return typeof v === "string" ? v.slice(0, 16) : "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

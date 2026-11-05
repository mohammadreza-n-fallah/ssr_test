"use client";

import { useFormOptions } from "@/lib/admin";
import { TextInput, TextArea, SelectInput, NumberInput, Switch } from "@/components/admin/ui/fields";

export interface ProductFormValues {
  name: string;
  name_en: string;
  sku: string;
  slug?: string;
  oem_code: string;
  part_number: string;
  category: string | number | "";
  brand: string | number | "";
  part_type: string;
  short_description: string;
  description: string;
  weight: string | number;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  is_featured: boolean;
}

export const emptyProduct: ProductFormValues = {
  name: "",
  name_en: "",
  sku: "",
  oem_code: "",
  part_number: "",
  category: "",
  brand: "",
  part_type: "aftermarket",
  short_description: "",
  description: "",
  weight: "",
  meta_title: "",
  meta_description: "",
  is_active: true,
  is_featured: false,
};

export default function ProductInfoForm({
  value,
  onChange,
}: {
  value: ProductFormValues;
  onChange: (v: ProductFormValues) => void;
}) {
  const { data: opts } = useFormOptions();
  const set = (k: keyof ProductFormValues, v: unknown) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
      <TextInput label="نام محصول" required value={value.name} onChange={(e) => set("name", e.target.value)} />
      <TextInput label="نام انگلیسی" ltr value={value.name_en} onChange={(e) => set("name_en", e.target.value)} />
      <TextInput label="کد محصول (SKU)" required ltr value={value.sku} onChange={(e) => set("sku", e.target.value)} />
      <TextInput label="اسلاگ" ltr hint="خالی = خودکار" value={value.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
      <TextInput label="کد OEM" ltr value={value.oem_code} onChange={(e) => set("oem_code", e.target.value)} />
      <TextInput label="شماره قطعه" ltr value={value.part_number} onChange={(e) => set("part_number", e.target.value)} />
      <SelectInput
        label="دسته‌بندی"
        placeholder="انتخاب دسته"
        options={(opts?.categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        value={value.category}
        onChange={(v) => set("category", v)}
      />
      <SelectInput
        label="برند"
        placeholder="انتخاب برند"
        options={(opts?.brands ?? []).map((b) => ({ value: b.id, label: b.name }))}
        value={value.brand}
        onChange={(v) => set("brand", v)}
      />
      <SelectInput
        label="نوع قطعه"
        options={(opts?.part_types ?? []).map((p) => ({ value: p.value, label: p.label }))}
        value={value.part_type}
        onChange={(v) => set("part_type", v)}
      />
      <NumberInput label="وزن (کیلوگرم)" value={value.weight} onChange={(e) => set("weight", e.target.value)} />
      <TextArea label="توضیح کوتاه" className="sm:col-span-2" rows={2} value={value.short_description} onChange={(e) => set("short_description", e.target.value)} />
      <TextArea label="توضیحات کامل" className="sm:col-span-2" rows={5} value={value.description} onChange={(e) => set("description", e.target.value)} />
      <TextInput label="عنوان سئو" value={value.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
      <TextInput label="توضیحات سئو" value={value.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 px-3.5 py-2 sm:col-span-2">
        <Switch label="فعال" checked={value.is_active} onChange={(v) => set("is_active", v)} />
        <Switch label="محصول ویژه" checked={value.is_featured} onChange={(v) => set("is_featured", v)} />
      </div>
    </div>
  );
}

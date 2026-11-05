"use client";

import { useState } from "react";
import { Plus, Trash2, Car } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import Button from "@/components/admin/ui/Button";
import { SelectInput, TextInput } from "@/components/admin/ui/fields";
import { IconButton } from "@/components/admin/ui/controls";
import { toPersianDigits } from "@/lib/utils";
import type { AdminCarBrand, AdminCarModel, AdminCarYear, AdminCompatibility } from "@/types/admin";

export default function CompatibilityManager({ productId }: { productId: number }) {
  const { data, isLoading } = useList<AdminCompatibility>("compatibilities", { product: productId, page_size: 100 });
  const crud = useCrud("compatibilities");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");

  const brands = useList<AdminCarBrand>("car-brands", { page_size: 100 });
  const models = useList<AdminCarModel>("car-models", { page_size: 100, brand: brand || undefined }, { enabled: !!brand });
  const years = useList<AdminCarYear>("car-years", { page_size: 100, model: model || undefined }, { enabled: !!model });

  const add = () => {
    if (!brand) return;
    const data: Record<string, unknown> = { product: productId, notes };
    data.car_brand = Number(brand);
    if (model) data.car_model = Number(model);
    if (year) data.car_year = Number(year);
    crud.create.mutate(data, {
      onSuccess: () => {
        setBrand("");
        setModel("");
        setYear("");
        setNotes("");
      },
    });
  };

  const rows = data?.results ?? [];

  return (
    <div className="space-y-5">
      {/* Add row */}
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectInput
            label="برند خودرو"
            placeholder="انتخاب برند"
            options={(brands.data?.results ?? []).map((b) => ({ value: b.id, label: b.name }))}
            value={brand}
            onChange={(v) => { setBrand(v); setModel(""); setYear(""); }}
          />
          <SelectInput
            label="مدل"
            placeholder={brand ? "همه مدل‌ها" : "ابتدا برند"}
            options={(models.data?.results ?? []).map((m) => ({ value: m.id, label: m.name }))}
            value={model}
            onChange={(v) => { setModel(v); setYear(""); }}
          />
          <SelectInput
            label="سال"
            placeholder={model ? "همه سال‌ها" : "ابتدا مدل"}
            options={(years.data?.results ?? []).map((y) => ({ value: y.id, label: String(y.year) }))}
            value={year}
            onChange={setYear}
          />
          <TextInput label="یادداشت" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" icon={<Plus className="h-4 w-4" />} loading={crud.create.isPending} disabled={!brand} onClick={add}>
            افزودن سازگاری
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-gray-400">در حال بارگذاری…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">این محصول هنوز به خودرویی متصل نشده است.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm shadow-sm">
              <Car className="h-4 w-4 text-[#1e3a8a]" />
              <span className="text-gray-700">
                {[c.car_brand_name, c.car_model_name, c.car_year_label ? toPersianDigits(c.car_year_label) : null].filter(Boolean).join(" / ") || "همه خودروها"}
              </span>
              {c.notes && <span className="text-xs text-gray-400">({c.notes})</span>}
              <IconButton title="حذف" tone="danger" onClick={() => crud.remove.mutate(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

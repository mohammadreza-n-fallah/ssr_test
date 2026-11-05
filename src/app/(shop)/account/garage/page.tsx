"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Plus, Trash2, Star, X, Search } from "lucide-react";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import { useGarageStore } from "@/store/garage.store";
import type { CarBrand, CarModel, CarYear } from "@/types";

export default function GaragePage() {
  const { vehicles, fetchVehicles, addVehicle, removeVehicle, setPrimary } =
    useGarageStore();

  const [showForm, setShowForm] = useState(false);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<CarYear[]>([]);
  const [brand, setBrand] = useState<CarBrand | null>(null);
  const [model, setModel] = useState<CarModel | null>(null);
  const [year, setYear] = useState<CarYear | null>(null);
  const [nickname, setNickname] = useState("");
  const [plate, setPlate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    api.get("/vehicles/brands/").then((r) => setBrands(toList<CarBrand>(r.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!brand) return;
    setModel(null);
    setYear(null);
    setModels([]);
    setYears([]);
    api
      .get(`/vehicles/brands/${brand.slug}/models/`)
      .then((r) => setModels(toList<CarModel>(r.data)))
      .catch(() => {});
  }, [brand]);

  useEffect(() => {
    if (!model) return;
    setYear(null);
    setYears([]);
    api
      .get(`/vehicles/models/${model.id}/years/`)
      .then((r) => setYears(toList<CarYear>(r.data)))
      .catch(() => {});
  }, [model]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;
    setSaving(true);
    try {
      await addVehicle({
        car_brand: brand.id,
        car_model: model.id,
        car_year: year?.id,
        nickname,
        plate_number: plate,
        is_primary: vehicles.length === 0,
      } as never);
      setShowForm(false);
      setBrand(null);
      setModel(null);
      setYear(null);
      setNickname("");
      setPlate("");
      fetchVehicles();
    } finally {
      setSaving(false);
    }
  };

  const select =
    "w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] disabled:opacity-50";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-[#1e3a8a]" />
          گاراژ من
        </h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-gradient-primary hover:brightness-110 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          افزودن خودرو
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">افزودن خودرو</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="بستن">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              className={select}
              value={brand?.id ?? ""}
              onChange={(e) =>
                setBrand(brands.find((b) => b.id === Number(e.target.value)) || null)
              }
              required
            >
              <option value="">برند خودرو</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className={select}
              value={model?.id ?? ""}
              onChange={(e) =>
                setModel(models.find((m) => m.id === Number(e.target.value)) || null)
              }
              disabled={!brand}
              required
            >
              <option value="">مدل</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className={select}
              value={year?.id ?? ""}
              onChange={(e) =>
                setYear(years.find((y) => y.id === Number(e.target.value)) || null)
              }
              disabled={!model}
            >
              <option value="">سال تولید</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year_shamsi || y.year}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              placeholder="نام مستعار (اختیاری)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              placeholder="شماره پلاک (اختیاری)"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !brand || !model}
            className="mt-4 bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            {saving ? "در حال ذخیره..." : "ذخیره خودرو"}
          </button>
        </form>
      )}

      {vehicles.length === 0 ? (
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl py-16 text-center">
          <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">هنوز خودرویی به گاراژ اضافه نکرده‌اید.</p>
          <p className="text-gray-400 text-sm mt-1">
            با ثبت خودرو، قطعات سازگار را سریع‌تر پیدا کنید.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800 truncate">
                      {v.display_name}
                    </span>
                    {v.is_primary && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                        اصلی
                      </span>
                    )}
                  </div>
                  {v.plate_number && (
                    <p className="text-xs text-gray-400 mt-0.5 ltr">{v.plate_number}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                <Link
                  href={`/products/by-vehicle?car_year=${v.car_year ?? ""}&car_model=${v.car_model}&car_brand=${v.car_brand}`}
                  className="text-xs text-[#1e3a8a] hover:text-[#f97316] flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  قطعات سازگار
                </Link>
                {!v.is_primary && (
                  <button
                    onClick={() => setPrimary(v.id)}
                    className="text-xs text-gray-500 hover:text-[#1e3a8a] flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    خودروی اصلی
                  </button>
                )}
                <button
                  onClick={() => removeVehicle(v.id)}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mr-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

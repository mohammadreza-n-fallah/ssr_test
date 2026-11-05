"use client";

import { useState, useEffect } from "react";
import { Car, ChevronDown, Plus, ArrowLeft } from "lucide-react";
import { useGarageStore } from "@/store/garage.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import type { CarBrand, CarModel, CarYear } from "@/types";

export default function VehicleSelector() {
  const { activeVehicle, setActiveVehicle, vehicles } = useGarageStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<CarYear[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedYear, setSelectedYear] = useState<CarYear | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/vehicles/brands/").then((r) => setBrands(toList<CarBrand>(r.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedBrand) return;
    setSelectedModel(null); setSelectedYear(null); setModels([]); setYears([]);
    api.get(`/vehicles/brands/${selectedBrand.slug}/models/`)
      .then((r) => setModels(toList<CarModel>(r.data))).catch(() => {});
  }, [selectedBrand]);

  useEffect(() => {
    if (!selectedModel) return;
    setSelectedYear(null); setYears([]);
    api.get(`/vehicles/models/${selectedModel.id}/years/`)
      .then((r) => setYears(toList<CarYear>(r.data))).catch(() => {});
  }, [selectedModel]);

  const handleSearch = () => {
    if (!selectedBrand) return;
    const params = new URLSearchParams();
    if (selectedBrand) params.set("car_brand", String(selectedBrand.id));
    if (selectedModel) params.set("car_model", String(selectedModel.id));
    if (selectedYear) params.set("car_year", String(selectedYear.id));
    router.push(`/products/by-vehicle?${params}`);
  };

  return (
    <div className="my-8 bg-white rounded-3xl shadow-card ring-1 ring-gray-100 overflow-hidden">
      <div className="relative bg-gradient-primary px-6 py-5 overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl -translate-x-1/3 -translate-y-1/2" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">قطعات سازگار با خودروم</h2>
            <p className="text-blue-200 text-sm">برند و مدل خودرو را انتخاب کنید</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Saved vehicles */}
        {isAuthenticated && vehicles.length > 0 && (
          <div className="mb-5">
            <p className="text-sm text-gray-500 mb-2">خودروهای ذخیره‌شده:</p>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVehicle(v);
                    router.push(`/products/by-vehicle?car_year=${v.car_year}`);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                    activeVehicle?.id === v.id
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                      : "border-gray-200 hover:border-[#1e3a8a] text-gray-700"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  {v.display_name}
                </button>
              ))}
            </div>
            <div className="my-4 border-t border-gray-100" />
          </div>
        )}

        {/* Selector dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Brand */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">برند خودرو</label>
            <select
              value={selectedBrand?.id ?? ""}
              onChange={(e) => {
                const b = brands.find((b) => b.id === Number(e.target.value)) || null;
                setSelectedBrand(b);
              }}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="">انتخاب برند</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Model */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">مدل</label>
            <select
              value={selectedModel?.id ?? ""}
              onChange={(e) => {
                const m = models.find((m) => m.id === Number(e.target.value)) || null;
                setSelectedModel(m);
              }}
              disabled={!selectedBrand}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] disabled:opacity-50"
            >
              <option value="">انتخاب مدل</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Year */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">سال تولید</label>
            <select
              value={selectedYear?.id ?? ""}
              onChange={(e) => {
                const y = years.find((y) => y.id === Number(e.target.value)) || null;
                setSelectedYear(y);
              }}
              disabled={!selectedModel}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] disabled:opacity-50"
            >
              <option value="">انتخاب سال</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.year_shamsi || y.year}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            disabled={!selectedBrand}
            className="flex-1 bg-gradient-primary hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:shadow-none"
          >
            نمایش قطعات سازگار
            <ArrowLeft className="w-4 h-4" />
          </button>
          {isAuthenticated && selectedModel && (
            <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-[#1e3a8a] text-gray-500 hover:text-[#1e3a8a] rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" />
              ذخیره در گاراژ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

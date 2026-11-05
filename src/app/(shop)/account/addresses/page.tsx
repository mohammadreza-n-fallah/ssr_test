"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Star, Pencil, X } from "lucide-react";
import api from "@/lib/api";
import { toList } from "@/lib/utils";
import { IRAN_PROVINCES } from "@/lib/provinces";
import type { Address } from "@/types";

const EMPTY = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
  is_default: false,
};

type FormState = typeof EMPTY;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get("/auth/addresses/")
      .then((r) => setAddresses(toList<Address>(r.data)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (a: Address) => {
    setForm({
      title: a.title,
      receiver_name: a.receiver_name,
      receiver_phone: a.receiver_phone,
      province: a.province,
      city: a.city,
      address: a.address,
      postal_code: a.postal_code,
      is_default: a.is_default,
    });
    setEditingId(a.id);
    setShowForm(true);
    setError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.patch(`/auth/addresses/${editingId}/`, form);
      } else {
        await api.post("/auth/addresses/", form);
      }
      setShowForm(false);
      setLoading(true);
      load();
    } catch {
      setError("خطا در ذخیره آدرس. لطفا فیلدها را بررسی کنید.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await api.delete(`/auth/addresses/${id}/`);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = async (a: Address) => {
    await api.patch(`/auth/addresses/${a.id}/`, { is_default: true });
    load();
  };

  const field =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">آدرس‌های من</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-gradient-primary hover:brightness-110 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          آدرس جدید
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? "ویرایش آدرس" : "آدرس جدید"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="بستن">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={field}
              placeholder="عنوان (مثلا منزل)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className={field}
              placeholder="نام گیرنده"
              required
              value={form.receiver_name}
              onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
            />
            <select
              className={field}
              required
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            >
              <option value="">استان</option>
              {IRAN_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className={field}
              placeholder="شهر"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              className={`${field} col-span-2`}
              placeholder="نشانی کامل"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <input
              className={`${field} ltr`}
              placeholder="کد پستی"
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            />
            <input
              className={`${field} ltr`}
              placeholder="شماره تماس گیرنده"
              required
              value={form.receiver_phone}
              onChange={(e) => setForm({ ...form, receiver_phone: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mt-3">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 accent-[#1e3a8a]"
            />
            آدرس پیش‌فرض
          </label>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            {saving ? "در حال ذخیره..." : "ذخیره آدرس"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl py-16 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">هنوز آدرسی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-4 relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#1e3a8a]" />
                <span className="font-semibold text-sm text-gray-800">
                  {a.title || a.receiver_name}
                </span>
                {a.is_default && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    پیش‌فرض
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {a.province}، {a.city}، {a.address}
              </p>
              <p className="text-xs text-gray-400 mt-1 ltr">
                {a.receiver_name} — {a.receiver_phone}
              </p>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                {!a.is_default && (
                  <button
                    onClick={() => setDefault(a)}
                    className="text-xs text-gray-500 hover:text-[#1e3a8a] flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    پیش‌فرض کن
                  </button>
                )}
                <button
                  onClick={() => openEdit(a)}
                  className="text-xs text-gray-500 hover:text-[#1e3a8a] flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  ویرایش
                </button>
                <button
                  onClick={() => remove(a.id)}
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

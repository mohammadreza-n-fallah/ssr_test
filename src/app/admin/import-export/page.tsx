"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Download,
  Upload,
  FileSpreadsheet,
  LoaderCircle,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";
import api from "@/lib/api";
import type { ImportSummary } from "@/types";
import { toPersianDigits } from "@/lib/utils";

const COLUMNS =
  "product_sku, name, name_en, category_slug, category_name, brand_slug, brand_name, part_type, short_description, weight, is_active, is_featured, variant_sku, price, compare_price, stock, low_stock_threshold";

export default function ImportExportPage() {
  const [activeOnly, setActiveOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportProducts = async () => {
    setExporting(true);
    setExportError(false);
    try {
      const res = await api.get(
        `/analytics/export/products/${activeOnly ? "?active_only=1" : ""}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  const importMut = useMutation<ImportSummary, unknown, File>({
    mutationFn: async (f) => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await api.post("/analytics/import/products/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data as ImportSummary;
    },
  });

  const summary = importMut.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">ورود / خروج محصولات</h1>
        <p className="text-sm text-gray-500">
          محصولات و تنوع‌ها را به‌صورت گروهی از طریق فایل CSV مدیریت کنید.
        </p>
      </div>

      {/* Export */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#1e3a8a]" />
          خروجی گرفتن (Export)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          دریافت فایل CSV از همه محصولات و تنوع‌ها (سازگار با اکسل).
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={exportProducts}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {exporting ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            دانلود فایل CSV
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="w-4 h-4 accent-[#f97316]"
            />
            فقط محصولات فعال
          </label>
        </div>
        {exportError && (
          <p className="mt-3 text-sm text-red-600">خطا در دریافت فایل. دوباره تلاش کنید.</p>
        )}
      </div>

      {/* Import */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#f97316]" />
          ورود اطلاعات (Import)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          محصولات بر اساس <span className="ltr">product_sku</span> و تنوع‌ها بر اساس{" "}
          <span className="ltr">variant_sku</span> به‌روزرسانی یا ایجاد می‌شوند.
        </p>

        {/* File picker */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              importMut.reset();
            }}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-[#f97316] text-gray-700 rounded-xl px-4 py-2.5 text-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-400" />
            {file ? file.name : "انتخاب فایل CSV"}
          </button>
          <button
            onClick={() => file && importMut.mutate(file)}
            disabled={!file || importMut.isPending}
            className="inline-flex items-center gap-2 bg-gradient-accent hover:brightness-110 disabled:opacity-60 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {importMut.isPending ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            بارگذاری و پردازش
          </button>
        </div>

        {importMut.isError && (
          <p className="mt-4 text-sm text-red-600">
            خطا در پردازش فایل. از صحت ساختار و کدگذاری UTF-8 مطمئن شوید.
          </p>
        )}

        {summary && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
              <CircleCheckBig className="w-5 h-5 shrink-0" />
              <span>
                پردازش {toPersianDigits(summary.rows)} ردیف انجام شد.
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <SummaryStat label="محصول جدید" value={summary.products_created} />
              <SummaryStat label="محصول به‌روز" value={summary.products_updated} />
              <SummaryStat label="تنوع جدید" value={summary.variants_created} />
              <SummaryStat label="تنوع به‌روز" value={summary.variants_updated} />
            </div>
            {summary.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
                  <TriangleAlert className="w-4 h-4" />
                  {toPersianDigits(summary.errors.length)} خطا
                </div>
                <ul className="max-h-48 overflow-y-auto space-y-1 text-xs text-red-600">
                  {summary.errors.map((err, i) => (
                    <li key={i}>{toPersianDigits(err)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Format hint */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-1">ستون‌های فایل:</p>
          <code className="block ltr text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-x-auto">
            {COLUMNS}
          </code>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl py-3">
      <div className="text-xl font-black text-gray-900">{toPersianDigits(value)}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

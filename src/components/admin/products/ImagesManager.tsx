"use client";

import { useState } from "react";
import { Star, Trash2, Upload, LoaderCircle } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import Button from "@/components/admin/ui/Button";
import { TextInput, ImageUpload, Switch } from "@/components/admin/ui/fields";
import { cn } from "@/lib/utils";
import type { AdminProductImage } from "@/types/admin";

export default function ImagesManager({ productId }: { productId: number }) {
  const { data, isLoading } = useList<AdminProductImage>("product-images", { product: productId, page_size: 100 });
  const crud = useCrud("product-images");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [primary, setPrimary] = useState(false);

  const upload = () => {
    if (!file) return;
    crud.create.mutate(
      { product: productId, image: file, alt_text: alt, is_primary: primary },
      {
        onSuccess: () => {
          setFile(null);
          setAlt("");
          setPrimary(false);
        },
      }
    );
  };

  const images = data?.results ?? [];

  return (
    <div className="space-y-5">
      {/* Upload box */}
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[auto_1fr_auto]">
          <ImageUpload label="تصویر جدید" value={file} onChange={setFile} />
          <TextInput label="متن جایگزین (alt)" value={alt} onChange={(e) => setAlt(e.target.value)} />
          <div className="space-y-2">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-1.5">
              <Switch label="تصویر اصلی" checked={primary} onChange={setPrimary} />
            </div>
            <Button
              icon={<Upload className="h-4 w-4" />}
              loading={crud.create.isPending}
              disabled={!file}
              onClick={upload}
              className="w-full"
            >
              بارگذاری
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      {isLoading ? (
        <div className="flex justify-center py-10 text-gray-300">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">هنوز تصویری بارگذاری نشده است.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className={cn("group relative overflow-hidden rounded-xl border bg-white", img.is_primary ? "border-[#f97316]" : "border-gray-100")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image} alt={img.alt_text} className="aspect-square w-full object-cover" />
              {img.is_primary && (
                <span className="absolute right-2 top-2 rounded-lg bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">اصلی</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    onClick={() => crud.update.mutate({ id: img.id, data: { is_primary: true } })}
                    className="rounded-lg bg-white/90 p-1.5 text-amber-500 hover:bg-white"
                    title="تنظیم به‌عنوان تصویر اصلی"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => crud.remove.mutate(img.id)}
                  className="mr-auto rounded-lg bg-white/90 p-1.5 text-red-500 hover:bg-white"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

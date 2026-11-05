"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import api from "@/lib/api";
import { apiError } from "@/lib/admin";
import { toast } from "@/components/admin/ui/toast";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import Button from "@/components/admin/ui/Button";
import ProductInfoForm, { emptyProduct, type ProductFormValues } from "@/components/admin/products/ProductInfoForm";
import type { AdminProduct } from "@/types/admin";

function payload(v: ProductFormValues) {
  const out: Record<string, unknown> = { ...v };
  if (!out.category) delete out.category;
  if (!out.brand) delete out.brand;
  if (!out.slug) delete out.slug;
  out.weight = v.weight === "" ? 0 : Number(v.weight);
  return out;
}

export default function NewProductPage() {
  const router = useRouter();
  const [value, setValue] = useState<ProductFormValues>(emptyProduct);

  const mut = useMutation<AdminProduct, unknown, ProductFormValues>({
    mutationFn: (v) => api.post("/dashboard/products/", payload(v)).then((r) => r.data),
    onSuccess: (product) => {
      toast.success("محصول ایجاد شد. اکنون تنوع‌ها و تصاویر را اضافه کنید.");
      router.push(`/admin/products/${product.id}`);
    },
    onError: (e) => toast.error(apiError(e)),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <AdminHeader title="محصول جدید" subtitle="ابتدا اطلاعات پایه را ثبت کنید، سپس تنوع و تصویر اضافه کنید" backHref="/admin/products" />

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <ProductInfoForm value={value} onChange={setValue} />
        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            انصراف
          </Button>
          <Button
            icon={<Save className="h-4 w-4" />}
            loading={mut.isPending}
            disabled={!value.name || !value.sku}
            onClick={() => mut.mutate(value)}
          >
            ایجاد و ادامه
          </Button>
        </div>
      </div>
    </div>
  );
}

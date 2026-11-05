import { Suspense } from "react";
import ProductListing from "@/components/product/ProductListing";

export const metadata = {
  title: "فروشگاه قطعات خودرو",
  description:
    "خرید آنلاین قطعات یدکی خودرو — فیلتر بر اساس دسته‌بندی، برند، قیمت و نوع قطعه. اصل، OEM و بازار با ضمانت اصالت.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
          در حال بارگذاری...
        </div>
      }
    >
      <ProductListing />
    </Suspense>
  );
}

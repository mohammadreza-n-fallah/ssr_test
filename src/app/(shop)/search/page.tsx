import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";

export const metadata = {
  title: "جستجوی قطعات | مِین استوریج",
  description: "جستجو در میان هزاران قطعه یدکی خودرو بر اساس نام، کد OEM و شماره قطعه",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
          در حال بارگذاری...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}


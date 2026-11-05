import { Suspense } from "react";
import ByVehicleResults from "@/components/product/ByVehicleResults";

export const metadata = {
  title: "قطعات سازگار با خودرو",
  description: "قطعات یدکی سازگار با برند، مدل و سال خودروی شما",
};

export default function ByVehiclePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
          در حال بارگذاری...
        </div>
      }
    >
      <ByVehicleResults />
    </Suspense>
  );
}

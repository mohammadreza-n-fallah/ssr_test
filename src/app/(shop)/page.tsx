import HeroSection from "@/components/home/HeroSection";
import VehicleSelector from "@/components/garage/VehicleSelector";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import HomeProductSection from "@/components/home/HomeProductSection";
import PromoBanner from "@/components/home/PromoBanner";
import BrandsSection from "@/components/home/BrandsSection";
import WhyUsSection from "@/components/home/WhyUsSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4">
        <VehicleSelector />
        <FeaturedCategories />

        {/* محصولات جدید */}
        <HomeProductSection
          title="محصولات جدید"
          subtitle="تازه‌ترین قطعات اضافه‌شده به فروشگاه"
          icon="sparkles"
          accent="blue"
          badge="جدید"
          endpoint="/recommendations/new/?limit=8"
          queryKey="new-arrivals"
          viewAllHref="/products?ordering=-created_at"
        />

        {/* محصولات پرفروش */}
        <HomeProductSection
          title="محصولات پرفروش"
          subtitle="پرطرفدارترین قطعات بین مشتریان ما"
          icon="flame"
          accent="orange"
          badge="پرفروش"
          endpoint="/recommendations/best-sellers/?limit=8"
          queryKey="best-sellers"
          viewAllHref="/products"
        />

        <PromoBanner />

        {/* پیشنهاد ویژه (featured) */}
        <HomeProductSection
          title="پیشنهاد ویژه"
          subtitle="منتخب کارشناسان مِین استوریج"
          icon="star"
          accent="emerald"
          endpoint="/products/?is_featured=true&page_size=8"
          queryKey="featured-products"
          viewAllHref="/products?is_featured=true"
        />

        <BrandsSection />
        <WhyUsSection />
      </div>
    </div>
  );
}


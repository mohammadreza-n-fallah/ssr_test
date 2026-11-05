import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import BottomBanner from "@/components/layout/BottomBanner";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-14">{children}</main>
      <Footer />
      <ChatWidget />
      <BottomBanner />
    </>
  );
}

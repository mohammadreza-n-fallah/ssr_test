import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import PWAManager from "@/components/pwa/PWAManager";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/structuredData";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مِین استوریج | فروشگاه قطعات خودرو",
    template: "%s | مِین استوریج",
  },
  description: "بهترین فروشگاه آنلاین قطعات یدکی خودرو در ایران",
  keywords: ["قطعات خودرو", "لوازم یدکی", "قطعات یدکی", "خرید آنلاین"],
  applicationName: "مِین استوریج",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مِین استوریج",
  },
  openGraph: {
    locale: "fa_IR",
    type: "website",
    siteName: "مِین استوریج",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Providers>{children}</Providers>
        <PWAManager />
      </body>
    </html>
  );
}


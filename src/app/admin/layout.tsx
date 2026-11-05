import type { Metadata } from "next";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "@/components/admin/ui/toast";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 md:flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
      <Toaster />
    </AdminGuard>
  );
}

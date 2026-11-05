"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

// Gates the /admin area to staff users. Renders an identical loader on the
// server and the first client paint to avoid a hydration mismatch with the
// persisted (localStorage) auth store, then makes the access decision.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, fetchProfile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    // Refresh the profile so is_staff is current even if the cached user is old.
    fetchProfile().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (mounted && checked && !isAuthenticated) router.replace("/auth");
  }, [mounted, checked, isAuthenticated, router]);

  if (!mounted || (isAuthenticated && !checked)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirecting

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">دسترسی غیرمجاز</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          این بخش مخصوص مدیران فروشگاه است و حساب شما دسترسی لازم را ندارد.
        </p>
        <Link
          href="/"
          className="bg-gradient-primary hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

// Gates the /account area to logged-in users. Renders an identical loader on the
// server and first client paint to avoid a hydration mismatch with the persisted
// (localStorage) auth store, then redirects anonymous visitors to /auth.
export default function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/auth?next=/account");
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirecting

  return <>{children}</>;
}

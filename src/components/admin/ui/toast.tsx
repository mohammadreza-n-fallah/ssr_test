"use client";

import { create } from "zustand";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push({ type: "success", message }),
  error: (message: string) => useToastStore.getState().push({ type: "error", message }),
  info: (message: string) => useToastStore.getState().push({ type: "info", message }),
};

const STYLES: Record<ToastType, { ring: string; icon: typeof Info; color: string }> = {
  success: { ring: "ring-green-200", icon: CheckCircle2, color: "text-green-600" },
  error: { ring: "ring-red-200", icon: XCircle, color: "text-red-600" },
  info: { ring: "ring-blue-200", icon: Info, color: "text-[#1e3a8a]" },
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const st = STYLES[t.type];
        const Icon = st.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-white rounded-xl shadow-lg ring-1 ${st.ring} px-4 py-3 animate-in`}
            role="status"
          >
            <Icon className={`w-5 h-5 shrink-0 ${st.color}`} />
            <p className="text-sm text-gray-800 flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-300 hover:text-gray-500 shrink-0"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

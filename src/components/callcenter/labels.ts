import type { CCPriority, CCSentiment } from "@/types";

// Persian labels + Tailwind chip styles for the triage badges. Mirrors the
// backend choices in apps/callcenter/models.py.

export const PRIORITY_LABEL: Record<CCPriority, string> = {
  urgent: "فوری",
  high: "زیاد",
  normal: "عادی",
  low: "کم",
};

export const PRIORITY_CHIP: Record<CCPriority, string> = {
  urgent: "bg-red-100 text-red-700 ring-red-200",
  high: "bg-orange-100 text-orange-700 ring-orange-200",
  normal: "bg-slate-100 text-slate-600 ring-slate-200",
  low: "bg-gray-100 text-gray-500 ring-gray-200",
};

// A thin accent bar on the queue row, by priority.
export const PRIORITY_BAR: Record<CCPriority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-transparent",
  low: "bg-transparent",
};

export const SENTIMENT_LABEL: Record<CCSentiment, string> = {
  angry: "ناراضی",
  neutral: "خنثی",
  happy: "راضی",
  unknown: "نامشخص",
};

export const SENTIMENT_CHIP: Record<CCSentiment, string> = {
  angry: "bg-red-100 text-red-700 ring-red-200",
  happy: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  unknown: "bg-gray-100 text-gray-400 ring-gray-200",
};

export const TAG_LABEL: Record<string, string> = {
  order: "سفارش",
  payment: "پرداخت",
  shipping: "ارسال",
  product: "محصول",
  return: "مرجوعی",
  warranty: "گارانتی",
  compatibility: "سازگاری قطعه",
  other: "سایر",
};

export const PRIORITY_OPTIONS: CCPriority[] = ["low", "normal", "high", "urgent"];

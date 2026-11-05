import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatPriceToman(rials: number): string {
  return formatPrice(Math.floor(rials / 10));
}

// Compact Toman for dashboard cards/charts, e.g. "۱۲٫۵ میلیارد تومان".
export function formatCompactToman(rials: number): string {
  const toman = Math.floor(rials / 10);
  const abs = Math.abs(toman);
  if (abs >= 1_000_000_000)
    return toPersianDigits((toman / 1_000_000_000).toFixed(1)) + " میلیارد تومان";
  if (abs >= 1_000_000)
    return toPersianDigits((toman / 1_000_000).toFixed(1)) + " میلیون تومان";
  return new Intl.NumberFormat("fa-IR").format(toman) + " تومان";
}

export function toPersianDigits(num: number | string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

export function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// Persian (Jalali) date, e.g. "۱۴۰۳/۰۵/۱۲". Falls back to the raw value if the
// date can't be parsed.
export function formatDate(value: string | Date): string {
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return String(value);
  }
}

// Persian date + time, e.g. "۱۴۰۳/۰۵/۱۲، ۱۴:۳۰".
export function formatDateTime(value: string | Date): string {
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return String(value);
  }
}

// DRF list endpoints are paginated ({ count, results: [...] }); a few return a
// raw array. Normalize either shape to a plain array so callers can .map safely.
export function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

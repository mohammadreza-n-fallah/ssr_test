"use client";

import { cn } from "@/lib/utils";

export type Tone =
  | "gray"
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "violet"
  | "sky"
  | "orange";

const TONES: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-[#1e3a8a]",
  violet: "bg-violet-50 text-violet-700",
  sky: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-[#c2410c]",
};

// Maps known status codes → tone, shared across orders / reviews / posts / comments.
export const STATUS_TONE: Record<string, Tone> = {
  pending: "amber",
  paid: "green",
  processing: "sky",
  shipped: "violet",
  delivered: "green",
  cancelled: "red",
  refunded: "gray",
  approved: "green",
  rejected: "red",
  draft: "gray",
  published: "green",
  active: "green",
  inactive: "gray",
};

export default function StatusBadge({
  label,
  tone,
  status,
  className,
}: {
  label: string;
  tone?: Tone;
  status?: string;
  className?: string;
}) {
  const resolved = tone ?? (status ? STATUS_TONE[status] ?? "gray" : "gray");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[resolved],
        className
      )}
    >
      {label}
    </span>
  );
}

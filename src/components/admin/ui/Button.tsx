"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-gradient-primary text-white hover:brightness-110",
  accent: "bg-gradient-accent text-white hover:brightness-110",
  secondary: "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-[#1e3a8a] hover:text-[#1e3a8a]",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "text-gray-600 hover:bg-gray-100",
};

export default function Button({
  variant = "primary",
  loading,
  icon,
  size = "md",
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        VARIANTS[variant],
        className
      )}
    >
      {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

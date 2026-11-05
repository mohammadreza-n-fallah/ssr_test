"use client";

import { Star } from "lucide-react";

interface Props {
  value: number;
  size?: number;
  // When provided, stars become clickable (rating input).
  onChange?: (value: number) => void;
  className?: string;
}

// Read-only by default; pass onChange to use as a 1–5 rating input.
export default function StarRating({ value, size = 16, onChange, className = "" }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex items-center gap-0.5 ${className}`} dir="ltr">
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const star = (
          <Star
            className={filled ? "text-amber-400 fill-amber-400" : "text-gray-300"}
            style={{ width: size, height: size }}
          />
        );
        return onChange ? (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110"
            aria-label={`${s} ستاره`}
          >
            {star}
          </button>
        ) : (
          <span key={s}>{star}</span>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { SalesPoint } from "@/types";
import { formatCompactToman, toPersianDigits } from "@/lib/utils";

const W = 600;
const H = 220;
const PAD = 10;

function faDate(iso: string) {
  // "2026-06-26" -> "۲۰۲۶/۰۶/۲۶"
  return toPersianDigits(iso.replaceAll("-", "/"));
}

export default function SalesChart({ data }: { data: SalesPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const { linePath, areaPath, xFor, yFor, max } = useMemo(() => {
    const n = data.length;
    const revenues = data.map((d) => d.revenue);
    const maxRev = Math.max(...revenues, 1);

    const xf = (i: number) =>
      n <= 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (n - 1);
    const yf = (v: number) => H - PAD - (v / maxRev) * (H - 2 * PAD);

    const line = data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xf(i).toFixed(1)} ${yf(d.revenue).toFixed(1)}`)
      .join(" ");
    const area =
      n === 0
        ? ""
        : `${line} L ${xf(n - 1).toFixed(1)} ${H - PAD} L ${xf(0).toFixed(1)} ${H - PAD} Z`;

    return { linePath: line, areaPath: area, xFor: xf, yFor: yf, max: maxRev };
  }, [data]);

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-16 text-center">
        داده‌ای برای این بازه وجود ندارد
      </p>
    );
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (data.length - 1));
    setHover(Math.min(Math.max(idx, 0), data.length - 1));
  };

  const hoverPoint = hover !== null ? data[hover] : null;
  // Physical left % from the chart's left edge (data[0]); clamped to limit
  // tooltip overflow at the edges. `left`/`transform` are physical, so they are
  // unaffected by the surrounding RTL layout.
  const rawPct =
    hover !== null && data.length > 1 ? (hover / (data.length - 1)) * 100 : 50;
  const hoverLeftPct = Math.min(Math.max(rawPct, 8), 92);

  return (
    <div className="relative" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-56">
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + f * (H - 2 * PAD)}
            y2={PAD + f * (H - 2 * PAD)}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill="url(#salesFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#f97316"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />

        {hover !== null && (
          <>
            <line
              x1={xFor(hover)}
              x2={xFor(hover)}
              y1={PAD}
              y2={H - PAD}
              stroke="#1e3a8a"
              strokeWidth={1}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={xFor(hover)} cy={yFor(data[hover].revenue)} r={4} fill="#1e3a8a" />
          </>
        )}
      </svg>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-0 z-10 bg-[#1e3a8a] text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap text-center"
          style={{ left: `${hoverLeftPct}%`, transform: "translateX(-50%)" }}
        >
          <div className="font-bold">{formatCompactToman(hoverPoint.revenue)}</div>
          <div className="text-blue-200">
            {toPersianDigits(hoverPoint.orders)} سفارش · {faDate(hoverPoint.date)}
          </div>
        </div>
      )}

      {/* LTR so the date labels line up with the chart (data[0] on the left). */}
      <div dir="ltr" className="flex justify-between text-xs text-gray-400 mt-2 px-1">
        <span>{faDate(data[0].date)}</span>
        <span className="text-gray-300">سقف: {formatCompactToman(max)}</span>
        <span>{faDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

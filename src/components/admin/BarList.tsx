export interface BarItem {
  label: string;
  value: number;
  sub?: string;
}

interface BarListProps {
  items: BarItem[];
  formatValue: (value: number) => string;
  color?: string; // CSS color for the bar fill
  emptyText?: string;
}

export default function BarList({
  items,
  formatValue,
  color = "#f97316",
  emptyText = "داده‌ای برای نمایش وجود ندارد",
}: BarListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">{emptyText}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between items-baseline gap-2 text-sm mb-1">
            <span className="text-gray-700 truncate">
              {item.label}
              {item.sub && (
                <span className="text-gray-400 text-xs"> ({item.sub})</span>
              )}
            </span>
            <span className="text-gray-900 font-bold shrink-0">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

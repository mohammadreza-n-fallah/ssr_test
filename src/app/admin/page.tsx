"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ShoppingCart,
  Package,
  Receipt,
  Hourglass,
  Star,
  MessageSquare,
  Ticket,
  TriangleAlert,
  ChartColumn,
  RefreshCw,
  Users,
  UserPlus,
  Boxes,
} from "lucide-react";
import api from "@/lib/api";
import type { AnalyticsDashboard } from "@/types";
import StatCard from "@/components/admin/StatCard";
import SalesChart from "@/components/admin/SalesChart";
import BarList from "@/components/admin/BarList";
import { formatCompactToman, formatPriceToman, toPersianDigits } from "@/lib/utils";

const PRESETS = [
  { label: "۷ روز", days: 7 },
  { label: "۳۰ روز", days: 30 },
  { label: "۹۰ روز", days: 90 },
];

function rangeFor(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { from: fmt(from), to: fmt(to) };
}

function Card({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title?: string;
  icon?: typeof ChartColumn;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {title && (
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#1e3a8a]" />}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const { from, to } = useMemo(() => rangeFor(days), [days]);

  const { data, isLoading, isError, refetch, isFetching } =
    useQuery<AnalyticsDashboard>({
      queryKey: ["admin-dashboard", from, to],
      queryFn: () =>
        api.get(`/analytics/dashboard/?from=${from}&to=${to}`).then((r) => r.data),
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">داشبورد مدیریت</h1>
          <p className="text-sm text-gray-500">نمای کلی فروش و عملکرد فروشگاه</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  days === p.days
                    ? "bg-[#1e3a8a] text-white font-medium"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            aria-label="بروزرسانی"
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#f97316] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="درآمد"
              value={formatCompactToman(data.overview.revenue)}
              icon={Wallet}
              change={data.overview.revenue_change_pct}
              iconClassName="bg-orange-50 text-[#f97316]"
            />
            <StatCard
              title="سفارش‌ها"
              value={toPersianDigits(data.overview.orders)}
              icon={ShoppingCart}
              change={data.overview.orders_change_pct}
            />
            <StatCard
              title="اقلام فروخته‌شده"
              value={toPersianDigits(data.overview.items_sold)}
              icon={Package}
              iconClassName="bg-violet-50 text-violet-600"
            />
            <StatCard
              title="میانگین ارزش سفارش"
              value={formatCompactToman(data.overview.average_order_value)}
              icon={Receipt}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* Needs attention */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="در انتظار پرداخت"
              value={toPersianDigits(data.overview.pending_orders)}
              icon={Hourglass}
              iconClassName="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="دیدگاه‌های در انتظار"
              value={toPersianDigits(data.pending.reviews)}
              icon={Star}
              iconClassName="bg-yellow-50 text-yellow-600"
            />
            <StatCard
              title="نظرات بلاگ"
              value={toPersianDigits(data.pending.comments)}
              icon={MessageSquare}
              iconClassName="bg-sky-50 text-sky-600"
            />
            <StatCard
              title="تیکت‌های باز"
              value={toPersianDigits(data.pending.tickets)}
              icon={Ticket}
              iconClassName="bg-rose-50 text-rose-600"
            />
          </div>

          {/* Sales chart */}
          <Card title="روند فروش" icon={ChartColumn}>
            <SalesChart data={data.timeseries} />
          </Card>

          {/* Top products / categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="پرفروش‌ترین محصولات" icon={Package}>
              <BarList
                items={data.top_products.map((p) => ({
                  label: p.name,
                  value: p.revenue,
                  sub: `${toPersianDigits(p.quantity_sold)} عدد`,
                }))}
                formatValue={formatPriceToman}
              />
            </Card>
            <Card title="دسته‌بندی‌های برتر" icon={Boxes}>
              <BarList
                items={data.top_categories.map((c) => ({
                  label: c.name,
                  value: c.revenue,
                  sub: `${toPersianDigits(c.quantity_sold)} عدد`,
                }))}
                formatValue={formatPriceToman}
                color="#1e3a8a"
              />
            </Card>
          </div>

          {/* Order status + customers/inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="وضعیت سفارش‌ها" icon={ShoppingCart}>
              <BarList
                items={data.order_status.map((s) => ({
                  label: s.label,
                  value: s.count,
                }))}
                formatValue={(n) => toPersianDigits(n)}
                color="#1e3a8a"
                emptyText="سفارشی در این بازه ثبت نشده است"
              />
            </Card>

            <Card title="مشتریان و موجودی" icon={Users}>
              <div className="divide-y divide-gray-100">
                <StatRow
                  icon={UserPlus}
                  label="مشتریان جدید"
                  value={toPersianDigits(data.customers.new_customers)}
                />
                <StatRow
                  icon={ShoppingCart}
                  label="خریداران فعال"
                  value={toPersianDigits(data.customers.active_buyers)}
                />
                <StatRow
                  icon={Users}
                  label="کل مشتریان"
                  value={toPersianDigits(data.customers.total_customers)}
                />
                <StatRow
                  icon={Boxes}
                  label="ارزش موجودی انبار"
                  value={formatCompactToman(data.inventory_value)}
                />
              </div>
            </Card>
          </div>

          {/* Low stock */}
          <Card title="کالاهای رو به اتمام" icon={TriangleAlert}>
            {data.low_stock.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">
                موجودی همه کالاها مناسب است
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-gray-100">
                      <th className="text-right font-medium py-2">محصول</th>
                      <th className="text-right font-medium py-2">کد</th>
                      <th className="text-center font-medium py-2">موجودی</th>
                      <th className="text-center font-medium py-2">آستانه</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock.map((v) => (
                      <tr key={v.variant_id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 text-gray-800">{v.product_name}</td>
                        <td className="py-2.5 text-gray-500 ltr text-right">{v.sku}</td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`font-bold ${
                              v.stock === 0 ? "text-red-600" : "text-amber-600"
                            }`}
                          >
                            {toPersianDigits(v.stock)}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-gray-500">
                          {toPersianDigits(v.threshold)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <p className="text-xs text-gray-400 text-center">
            بازه: {toPersianDigits(data.range.from)} تا {toPersianDigits(data.range.to)}
          </p>
        </>
      )}
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className="w-4 h-4 text-gray-400" />
        {label}
      </span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
        ))}
      </div>
      <div className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
        <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
      </div>
    </div>
  );
}

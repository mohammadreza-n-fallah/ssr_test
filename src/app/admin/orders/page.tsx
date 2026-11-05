"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useList } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { SearchBox, FilterTabs } from "@/components/admin/ui/controls";
import Pagination from "@/components/product/Pagination";
import { formatDateTime, formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminOrderListItem } from "@/types/admin";

const TABS = [
  { value: "", label: "همه" },
  { value: "pending", label: "در انتظار پرداخت" },
  { value: "paid", label: "پرداخت شده" },
  { value: "processing", label: "در حال پردازش" },
  { value: "shipped", label: "ارسال شده" },
  { value: "delivered", label: "تحویل شده" },
  { value: "cancelled", label: "لغو شده" },
  { value: "refunded", label: "بازپرداخت" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useList<AdminOrderListItem>("orders", {
    page,
    search: search || undefined,
    status: status || undefined,
  });

  const columns: Column<AdminOrderListItem>[] = [
    {
      key: "order_number",
      header: "شماره سفارش",
      render: (r) => <span className="ltr font-bold text-[#1e3a8a]">{r.order_number}</span>,
    },
    {
      key: "customer_name",
      header: "مشتری",
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-gray-900">{r.customer_name}</div>
          <div className="ltr text-xs text-gray-400">{r.customer_phone}</div>
        </div>
      ),
    },
    { key: "items_count", header: "اقلام", align: "center", render: (r) => toPersianDigits(r.items_count) },
    { key: "total", header: "مبلغ", render: (r) => <span className="font-medium">{formatPriceToman(Number(r.total))}</span> },
    { key: "status", header: "وضعیت", align: "center", render: (r) => <StatusBadge label={r.status_display} status={r.status} /> },
    { key: "created_at", header: "تاریخ", render: (r) => <span className="text-xs text-gray-400">{formatDateTime(r.created_at)}</span> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <AdminHeader title="سفارش‌ها" subtitle="مدیریت و پیگیری سفارش‌های مشتریان" />

      <div className="mb-4 flex flex-col gap-3">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو با شماره سفارش، نام یا موبایل..." className="w-full sm:w-96" />
        <FilterTabs items={TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminOrderListItem).id}
        emptyText="سفارشی یافت نشد"
        onRowClick={(r) => router.push(`/admin/orders/${r.id}`)}
      />

      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}
    </div>
  );
}

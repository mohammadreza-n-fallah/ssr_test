"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { useList } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { SearchBox, FilterTabs } from "@/components/admin/ui/controls";
import Pagination from "@/components/product/Pagination";
import { formatDate, formatPriceToman, toPersianDigits } from "@/lib/utils";
import type { AdminCustomer } from "@/types/admin";

const TABS = [
  { value: "", label: "همه" },
  { value: "verified", label: "تأییدشده" },
  { value: "staff", label: "کارکنان" },
  { value: "inactive", label: "غیرفعال" },
];

export default function CustomersPage() {
  const router = useRouter();
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filters: Record<string, boolean> = {};
  if (tab === "verified") filters.is_verified = true;
  if (tab === "staff") filters.is_staff = true;
  if (tab === "inactive") filters.is_active = false;

  const { data, isLoading } = useList<AdminCustomer>("customers", {
    page,
    search: search || undefined,
    ...filters,
  });

  const columns: Column<AdminCustomer>[] = [
    {
      key: "full_name",
      header: "نام",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1e3a8a]">
            {(r.full_name || r.phone || "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900">{r.full_name || "بدون نام"}</div>
            <div className="ltr text-xs text-gray-400">{r.phone || r.email}</div>
          </div>
        </div>
      ),
    },
    { key: "orders_count", header: "سفارش‌ها", align: "center", render: (r) => toPersianDigits(r.orders_count) },
    { key: "total_spent", header: "مجموع خرید", render: (r) => formatPriceToman(r.total_spent) },
    {
      key: "flags",
      header: "نشان‌ها",
      align: "center",
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          {r.is_staff && <ShieldCheck className="h-4 w-4 text-violet-500" />}
          {r.is_verified && <BadgeCheck className="h-4 w-4 text-green-500" />}
          {!r.is_active && <StatusBadge label="مسدود" tone="red" />}
        </div>
      ),
    },
    { key: "created_at", header: "عضویت", render: (r) => <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <AdminHeader title="مشتریان" subtitle="مدیریت کاربران و حساب‌های مشتری" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو با نام، موبایل، ایمیل..." className="w-full sm:w-80" />
        <FilterTabs items={TABS} value={tab} onChange={(v) => { setTab(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminCustomer).id}
        emptyText="مشتری یافت نشد"
        onRowClick={(r) => router.push(`/admin/customers/${r.id}`)}
      />

      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}
    </div>
  );
}

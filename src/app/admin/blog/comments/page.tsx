"use client";

import { useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import BlogTabs from "@/components/admin/blog/BlogTabs";
import { SearchBox, FilterTabs, IconButton } from "@/components/admin/ui/controls";
import Pagination from "@/components/product/Pagination";
import { formatDate } from "@/lib/utils";
import type { AdminComment } from "@/types/admin";

const TABS = [
  { value: "pending", label: "در انتظار" },
  { value: "approved", label: "تأیید شده" },
  { value: "rejected", label: "رد شده" },
  { value: "", label: "همه" },
];

export default function BlogCommentsPage() {
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<AdminComment | null>(null);

  const { data, isLoading } = useList<AdminComment>("comments", {
    page,
    search: search || undefined,
    status: status || undefined,
  });
  const crud = useCrud("comments");

  const columns: Column<AdminComment>[] = [
    {
      key: "body",
      header: "دیدگاه",
      render: (r) => (
        <div className="max-w-md">
          <p className="line-clamp-2 text-gray-700">{r.body}</p>
          <p className="mt-0.5 text-xs text-gray-400">{r.user_name} • {r.post_title}</p>
        </div>
      ),
    },
    { key: "status", header: "وضعیت", align: "center", render: (r) => <StatusBadge label={r.status_display} status={r.status} /> },
    { key: "created_at", header: "تاریخ", render: (r) => <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <BlogTabs />
      <AdminHeader title="دیدگاه‌های بلاگ" subtitle="بررسی و تأیید نظرات نوشته‌ها" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو..." className="w-full sm:w-64" />
        <FilterTabs items={TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminComment).id}
        emptyText="دیدگاهی یافت نشد"
        actions={(r) => (
          <>
            {r.status !== "approved" && (
              <IconButton title="تأیید" tone="primary" onClick={() => crud.act.mutate({ id: r.id, action: "approve" })}>
                <Check className="h-4 w-4" />
              </IconButton>
            )}
            {r.status !== "rejected" && (
              <IconButton title="رد" tone="danger" onClick={() => crud.act.mutate({ id: r.id, action: "reject" })}>
                <X className="h-4 w-4" />
              </IconButton>
            )}
            <IconButton title="حذف" tone="danger" onClick={() => setDel(r)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      />

      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message="این دیدگاه حذف خواهد شد."
      />
    </div>
  );
}

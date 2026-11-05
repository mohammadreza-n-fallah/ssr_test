"use client";

import { useState } from "react";
import { Check, X, MessageSquareReply, Trash2, Star } from "lucide-react";
import { useList, useCrud } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { SearchBox, FilterTabs, IconButton } from "@/components/admin/ui/controls";
import { TextArea } from "@/components/admin/ui/fields";
import Pagination from "@/components/product/Pagination";
import { formatDate, toPersianDigits } from "@/lib/utils";
import type { AdminReview } from "@/types/admin";

const TABS = [
  { value: "pending", label: "در انتظار" },
  { value: "approved", label: "تأیید شده" },
  { value: "rejected", label: "رد شده" },
  { value: "", label: "همه" },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      <Star className="h-3.5 w-3.5 fill-amber-400" />
      <span className="text-xs font-bold text-gray-700">{toPersianDigits(n)}</span>
    </span>
  );
}

export default function ReviewsPage() {
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [del, setDel] = useState<AdminReview | null>(null);

  const { data, isLoading } = useList<AdminReview>("reviews", {
    page,
    search: search || undefined,
    status: status || undefined,
    ordering: "-created_at",
  });
  const crud = useCrud("reviews");

  const columns: Column<AdminReview>[] = [
    {
      key: "product_name",
      header: "محصول / کاربر",
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-900">{r.product_name}</div>
          <div className="text-xs text-gray-400">{r.user_name}</div>
        </div>
      ),
    },
    { key: "rating", header: "امتیاز", align: "center", render: (r) => <Stars n={r.rating} /> },
    {
      key: "comment",
      header: "دیدگاه",
      render: (r) => (
        <div className="max-w-xs">
          {r.title && <div className="truncate text-xs font-bold text-gray-700">{r.title}</div>}
          <p className="line-clamp-2 text-xs text-gray-500">{r.comment}</p>
          {r.admin_reply && <p className="mt-1 text-[11px] text-[#1e3a8a]">پاسخ: {r.admin_reply}</p>}
        </div>
      ),
    },
    {
      key: "is_verified_purchase",
      header: "خرید",
      align: "center",
      render: (r) => (r.is_verified_purchase ? <StatusBadge label="تأیید شده" tone="green" /> : "—"),
    },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => <StatusBadge label={r.status_display} status={r.status} />,
    },
    { key: "created_at", header: "تاریخ", render: (r) => <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <AdminHeader title="دیدگاه‌ها" subtitle="بررسی و تأیید دیدگاه مشتریان درباره محصولات" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجو در دیدگاه‌ها..." className="w-full sm:w-72" />
        <FilterTabs items={TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminReview).id}
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
            <IconButton title="پاسخ" tone="default" onClick={() => { setReply(r); setReplyText(r.admin_reply || ""); }}>
              <MessageSquareReply className="h-4 w-4" />
            </IconButton>
            <IconButton title="حذف" tone="danger" onClick={() => setDel(r)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      />

      {data && data.total_pages > 1 && (
        <Pagination currentPage={data.current_page} totalPages={data.total_pages} onPageChange={setPage} />
      )}

      <Modal
        open={reply !== null}
        onClose={() => setReply(null)}
        title="پاسخ فروشگاه به دیدگاه"
        description={reply?.product_name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReply(null)}>انصراف</Button>
            <Button
              loading={crud.update.isPending}
              onClick={() =>
                reply &&
                crud.update.mutate(
                  { id: reply.id, data: { admin_reply: replyText } },
                  { onSuccess: () => setReply(null) }
                )
              }
            >
              ثبت پاسخ
            </Button>
          </>
        }
      >
        {reply && (
          <div className="mb-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            <Stars n={reply.rating} />
            <p className="mt-1">{reply.comment}</p>
          </div>
        )}
        <TextArea label="پاسخ شما" value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
      </Modal>

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message="این دیدگاه برای همیشه حذف خواهد شد."
      />
    </div>
  );
}

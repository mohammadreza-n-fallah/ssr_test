"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { useList, useCrud, useFormOptions } from "@/lib/admin";
import AdminHeader from "@/components/admin/ui/AdminHeader";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import BlogTabs from "@/components/admin/blog/BlogTabs";
import { SearchBox, FilterTabs, IconButton } from "@/components/admin/ui/controls";
import { TextInput, TextArea, SelectInput, Switch, ImageUpload } from "@/components/admin/ui/fields";
import Pagination from "@/components/product/Pagination";
import { cn, formatDate, toPersianDigits } from "@/lib/utils";
import type { AdminPost, AdminPostListItem } from "@/types/admin";

const POST_TYPES = [
  { value: "article", label: "مقاله" },
  { value: "guide", label: "راهنمای تعمیر" },
  { value: "news", label: "اخبار" },
];
const STATUSES = [
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشر شده" },
];
const STATUS_TABS = [
  { value: "", label: "همه" },
  { value: "published", label: "منتشر شده" },
  { value: "draft", label: "پیش‌نویس" },
];

interface PostForm {
  title: string;
  slug: string;
  category: string | number | "";
  post_type: string;
  status: string;
  excerpt: string;
  body: string;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  tags: number[];
  cover: File | null;
}
const emptyPost: PostForm = {
  title: "",
  slug: "",
  category: "",
  post_type: "article",
  status: "draft",
  excerpt: "",
  body: "",
  is_featured: false,
  meta_title: "",
  meta_description: "",
  tags: [],
  cover: null,
};

export default function BlogPostsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<AdminPostListItem | "new" | null>(null);
  const [del, setDel] = useState<AdminPostListItem | null>(null);
  const [form, setForm] = useState<PostForm>(emptyPost);

  const { data: opts } = useFormOptions();
  const { data, isLoading } = useList<AdminPostListItem>("posts", {
    page,
    search: search || undefined,
    status: status || undefined,
  });
  const crud = useCrud("posts", { onDone: () => setEdit(null) });

  const openEdit = async (row?: AdminPostListItem) => {
    if (!row) {
      setForm(emptyPost);
      setEdit("new");
      return;
    }
    // fetch full post for the body + tags
    const { default: api } = await import("@/lib/api");
    const full: AdminPost = (await api.get(`/dashboard/posts/${row.id}/`)).data;
    setForm({
      title: full.title,
      slug: full.slug,
      category: full.category ?? "",
      post_type: full.post_type,
      status: full.status,
      excerpt: full.excerpt,
      body: full.body,
      is_featured: full.is_featured,
      meta_title: full.meta_title,
      meta_description: full.meta_description,
      tags: full.tags ?? [],
      cover: null,
    });
    setEdit(row);
  };

  const save = () => {
    const data: Record<string, unknown> = {
      title: form.title,
      post_type: form.post_type,
      status: form.status,
      excerpt: form.excerpt,
      body: form.body,
      is_featured: form.is_featured,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      tags: form.tags,
      category: form.category || null,
    };
    if (form.slug) data.slug = form.slug;
    if (form.cover) data.cover = form.cover;
    if (edit === "new") crud.create.mutate(data);
    else if (edit) crud.update.mutate({ id: edit.id, data });
  };

  const set = (k: keyof PostForm, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTag = (id: number) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id] }));

  const columns: Column<AdminPostListItem>[] = [
    {
      key: "title",
      header: "عنوان",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{r.title}</span>
          {r.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        </div>
      ),
    },
    { key: "category_name", header: "دسته", render: (r) => r.category_name || "—" },
    { key: "post_type", header: "نوع", render: (r) => POST_TYPES.find((t) => t.value === r.post_type)?.label ?? r.post_type },
    { key: "view_count", header: "بازدید", align: "center", render: (r) => toPersianDigits(r.view_count) },
    { key: "status", header: "وضعیت", align: "center", render: (r) => <StatusBadge label={r.status_display} status={r.status} /> },
    { key: "created_at", header: "تاریخ", render: (r) => <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <BlogTabs />
      <AdminHeader title="نوشته‌های بلاگ" subtitle="مدیریت مقالات، راهنماها و اخبار">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => openEdit()}>
          نوشته جدید
        </Button>
      </AdminHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="جستجوی نوشته..." className="w-full sm:w-72" />
        <FilterTabs items={STATUS_TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results}
        isLoading={isLoading}
        rowKey={(r) => (r as AdminPostListItem).id}
        emptyText="نوشته‌ای یافت نشد"
        actions={(r) => (
          <>
            <IconButton
              title={r.status === "published" ? "پیش‌نویس کردن" : "انتشار"}
              onClick={() => crud.act.mutate({ id: r.id, action: r.status === "published" ? "unpublish" : "publish" })}
            >
              {r.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
            <IconButton title="ویرایش" tone="primary" onClick={() => openEdit(r)}>
              <Pencil className="h-4 w-4" />
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

      {/* Editor */}
      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        title={edit === "new" ? "نوشته جدید" : "ویرایش نوشته"}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>انصراف</Button>
            <Button loading={crud.create.isPending || crud.update.isPending} onClick={save}>ذخیره</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput label="عنوان" required className="sm:col-span-2" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <TextInput label="اسلاگ" ltr hint="خالی = خودکار" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          <SelectInput label="دسته" placeholder="بدون دسته" options={(opts?.blog_categories ?? []).map((c) => ({ value: c.id, label: c.name }))} value={form.category} onChange={(v) => set("category", v)} />
          <SelectInput label="نوع" options={POST_TYPES} value={form.post_type} onChange={(v) => set("post_type", v)} />
          <SelectInput label="وضعیت" options={STATUSES} value={form.status} onChange={(v) => set("status", v)} />
          <TextArea label="خلاصه" className="sm:col-span-2" rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          <TextArea label="متن کامل" className="sm:col-span-2" rows={8} value={form.body} onChange={(e) => set("body", e.target.value)} />
          {/* Tags */}
          {opts?.tags && opts.tags.length > 0 && (
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">برچسب‌ها</span>
              <div className="flex flex-wrap gap-1.5">
                {opts.tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs transition-colors",
                      form.tags.includes(t.id) ? "bg-[#1e3a8a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ImageUpload label="تصویر کاور" value={form.cover} current={edit !== "new" ? undefined : null} onChange={(f) => set("cover", f)} />
          <div className="rounded-xl border border-gray-200 px-3.5 py-2">
            <Switch label="نوشته ویژه" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
          </div>
          <TextInput label="عنوان سئو" value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
          <TextInput label="توضیحات سئو" value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
        </div>
      </Modal>

      <ConfirmDialog
        open={del !== null}
        onClose={() => setDel(null)}
        loading={crud.remove.isPending}
        onConfirm={() => del && crud.remove.mutate(del.id, { onSuccess: () => setDel(null) })}
        message={`نوشته «${del?.title}» حذف خواهد شد.`}
      />
    </div>
  );
}

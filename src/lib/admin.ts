"use client";

/**
 * Admin data layer. Thin wrappers over the `/dashboard/*` API + TanStack Query
 * so every management page is a few lines: `useList` for tables, `useCrud` for
 * create/update/delete/custom-action mutations (auto-invalidate + toast).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/components/admin/ui/toast";

export interface Paginated<T> {
  results: T[];
  count: number;
  total_pages: number;
  current_page: number;
}

export type Params = Record<string, string | number | boolean | undefined | null>;

export interface FormOptions {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  warehouses: { id: number; name: string }[];
  shipping_zones: { id: number; name: string }[];
  blog_categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  car_brands: { id: number; name: string }[];
  part_types: { value: string; label: string }[];
  order_statuses: { value: string; label: string }[];
  carriers: { value: string; label: string }[];
}

/** Cached select-option lists for admin forms (categories, brands, ...). */
export function useFormOptions() {
  return useQuery<FormOptions>({
    queryKey: ["admin", "form-options"],
    queryFn: () => api.get("/dashboard/form-options/").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function buildParams(params: Params = {}): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.append(k, String(v));
  }
  return qs.toString();
}

/** Paginated list query for a dashboard resource. */
export function useList<T>(
  resource: string,
  params: Params = {},
  options?: Partial<UseQueryOptions<Paginated<T>>>
) {
  const qs = buildParams(params);
  return useQuery<Paginated<T>>({
    queryKey: ["admin", resource, params],
    queryFn: () =>
      api.get(`/dashboard/${resource}/?${qs}`).then((r) => r.data),
    placeholderData: (prev) => prev,
    ...options,
  });
}

/** A single record (detail) query. */
export function useDetail<T>(
  resource: string,
  id: string | number | undefined,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery<T>({
    queryKey: ["admin", resource, "detail", id],
    queryFn: () => api.get(`/dashboard/${resource}/${id}/`).then((r) => r.data),
    enabled: id !== undefined && id !== "",
    ...options,
  });
}

function hasFile(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  return Object.values(obj as Record<string, unknown>).some(
    (v) => v instanceof File || v instanceof Blob
  );
}

/** POST/PUT/PATCH that transparently switches to multipart when a File is present. */
export async function submit<T = unknown>(
  method: "post" | "put" | "patch",
  url: string,
  data?: Record<string, unknown>
): Promise<T> {
  if (data && hasFile(data)) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v.forEach((x) => fd.append(k, x as string | Blob));
      else fd.append(k, v as string | Blob);
    }
    return api
      .request({ method, url, data: fd, headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  }
  return api.request({ method, url, data }).then((r) => r.data);
}

/** Pull a human-readable message out of a DRF error response. */
export function apiError(err: unknown, fallback = "خطایی رخ داد"): string {
  const e = err as { response?: { data?: unknown } };
  const data = e?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    const first = Object.entries(d)[0];
    if (first) {
      const [field, val] = first;
      const msg = Array.isArray(val) ? val[0] : val;
      return `${field}: ${msg}`;
    }
  }
  return fallback;
}

interface CrudOptions {
  onDone?: () => void;
  labels?: { create?: string; update?: string; remove?: string };
}

/** CRUD + custom-action mutations for a resource, with toasts + cache invalidation. */
export function useCrud(resource: string, opts: CrudOptions = {}) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin", resource] });

  const base = `/dashboard/${resource}`;
  const labels = {
    create: "با موفقیت ثبت شد",
    update: "تغییرات ذخیره شد",
    remove: "حذف شد",
    ...opts.labels,
  };

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => submit("post", `${base}/`, data),
    onSuccess: () => {
      invalidate();
      toast.success(labels.create);
      opts.onDone?.();
    },
    onError: (e) => toast.error(apiError(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Record<string, unknown> }) =>
      submit("patch", `${base}/${id}/`, data),
    onSuccess: () => {
      invalidate();
      toast.success(labels.update);
      opts.onDone?.();
    },
    onError: (e) => toast.error(apiError(e)),
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => api.delete(`${base}/${id}/`).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success(labels.remove);
      opts.onDone?.();
    },
    onError: (e) => toast.error(apiError(e)),
  });

  const act = useMutation({
    mutationFn: ({
      id,
      action,
      method = "post",
      data,
    }: {
      id: number | string;
      action: string;
      method?: "post" | "patch";
      data?: Record<string, unknown>;
    }) => submit(method, `${base}/${id}/${action}/`, data),
    onSuccess: () => {
      invalidate();
      opts.onDone?.();
    },
    onError: (e) => toast.error(apiError(e)),
  });

  return { create, update, remove, act, invalidate };
}

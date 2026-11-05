import axios, { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import {
  fakeBrands,
  fakeCarBrands,
  fakeCarModelsByBrand,
  fakeCategories,
  fakeProductBySlug,
  fakeProducts,
  fakeSearchProducts,
  fakeYearsForModel,
  paginate,
} from "@/lib/fake-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const USE_FAKE_DATA = process.env.NEXT_PUBLIC_FAKE_DATA === "true";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 10000,
});

function fakeResponse<T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { ...config, headers: AxiosHeaders.from(config.headers) },
  } as AxiosResponse<T>;
}

function tryFakeCatalog(config: InternalAxiosRequestConfig): AxiosResponse<unknown> | null {
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") return null;
  const raw = config.url || "";
  const base = (config.baseURL || API_URL).replace(/\/$/, "");
  const full = raw.startsWith("http") ? raw : `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
  let path = full;
  let params = new URLSearchParams();
  try {
    const u = new URL(full);
    path = u.pathname.replace(/\/+$/, "");
    params = u.searchParams;
  } catch {
    path = raw.split("?")[0].replace(/\/+$/, "");
  }
  const merged = new URLSearchParams(params);
  const p = config.params;
  if (p && typeof p === "object") {
    for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
      if (v != null && v !== "") merged.set(k, String(v));
    }
  }

  if (/\/products\/categories\/?$/.test(path)) return fakeResponse(config, fakeCategories);
  if (/\/products\/brands\/?$/.test(path)) return fakeResponse(config, fakeBrands);
  if (/\/vehicles\/brands\/?$/.test(path)) return fakeResponse(config, fakeCarBrands);
  const models = path.match(/\/vehicles\/brands\/([^/]+)\/models\/?$/);
  if (models) return fakeResponse(config, fakeCarModelsByBrand[decodeURIComponent(models[1])] || []);
  const years = path.match(/\/vehicles\/models\/(\d+)\/years\/?$/);
  if (years) return fakeResponse(config, fakeYearsForModel(Number(years[1])));
  const product = path.match(/\/products\/([^/]+)\/?$/);
  if (product && !/\/products\/?$/.test(path)) {
    const item = fakeProductBySlug(decodeURIComponent(product[1]));
    if (item) return fakeResponse(config, item);
  }
  if (/\/products\/?$/.test(path) || /\/products\/by-vehicle\/?$/.test(path)) {
    return fakeResponse(config, fakeSearchProducts(merged));
  }
  if (/\/recommendations\//.test(path)) {
    return fakeResponse(config, paginate(fakeProducts, 1, Number(merged.get("limit") || 8)).results);
  }
  if (/\/seo\/sitemap-data\/?$/.test(path)) {
    return fakeResponse(config, {
      products: fakeProducts.map((x) => ({ slug: x.slug, updated_at: new Date().toISOString() })),
      categories: fakeCategories.map((c) => ({ slug: c.slug })),
      brands: fakeBrands.map((b) => ({ slug: b.slug })),
    });
  }
  return null;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (USE_FAKE_DATA) {
    const fake = tryFakeCatalog(config);
    if (fake) {
      (config as InternalAxiosRequestConfig & { __fake?: AxiosResponse }).__fake = fake;
      config.adapter = async (cfg) => (cfg as InternalAxiosRequestConfig & { __fake: AxiosResponse }).__fake;
    }
  }
  return config;
});

// Wipe any stored session locally (no redirect) so stale/expired auth recovers
// gracefully. Route guards (e.g. AdminGuard) decide when to send users to /auth.
function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  import("@/store/auth.store")
    .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
    .catch(() => {});
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (typeof error.config & { _retry?: boolean; _anonRetry?: boolean })
      | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      // Try a token refresh first when we have a refresh token.
      const refresh =
        typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          }, { timeout: 10000 });
          localStorage.setItem("access_token", data.access);
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          /* refresh failed — fall through */
        }
      }

      // No valid session. Clear stale auth and retry once anonymously so public
      // pages still load. We deliberately do NOT force-redirect to /auth.
      if (!original._anonRetry) {
        original._anonRetry = true;
        clearStoredAuth();
        if (original.headers) delete original.headers.Authorization;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * CMS API helpers — site content + FAQ (locale-aware)
 */

import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

export type Locale = "id" | "en";

export type CmsPageKey =
  | "beranda"
  | "kontak"
  | "navbar"
  | "footer"
  | "ui"
  | "admin"
  | "belanja"
  | "belanja_details"
  | "checkout";

export type CmsGrouped = Record<string, Record<string, string | null>>;

export interface CmsField {
  id?: number | null;
  page: string;
  section: string;
  key: string;
  locale?: string;
  type: "string" | "text" | "image";
  value: string | null;
}

export interface FaqItem {
  id: number;
  category: string;
  category_en?: string | null;
  question: string;
  question_en?: string | null;
  answer: string;
  answer_en?: string | null;
  sort_order: number;
  is_active: boolean;
}

function authHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export function resolveCmsImage(path?: string | null): string | null {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  // Frontend public assets (favicon, /src/images, etc.)
  if (
    path.startsWith("/src/") ||
    path.startsWith("/images/") ||
    path.startsWith("/favicon")
  ) {
    return path;
  }
  if (path.startsWith("/storage/")) {
    return `${BASE_URL}${path}`;
  }
  // Other absolute public paths on this Next app
  if (path.startsWith("/")) {
    return path;
  }
  return `${BASE_URL}/storage/${path}`;
}

export function cmsValue(
  data: CmsGrouped | null | undefined,
  section: string,
  key: string,
  fallback = "",
): string {
  return data?.[section]?.[key] ?? fallback;
}

/** Short in-memory TTL — cuts repeat CMS traffic on SPA navigations without stale admin UX. */
const CMS_PUBLIC_TTL_MS = 60_000;

type CacheEntry<T> = { data: T; expires: number };

const cmsPageCache = new Map<string, CacheEntry<CmsGrouped>>();
const cmsPageInflight = new Map<string, Promise<CmsGrouped>>();
const faqCache = new Map<string, CacheEntry<FaqItem[]>>();
const faqInflight = new Map<string, Promise<FaqItem[]>>();

/** Clear public CMS cache after admin saves (or pass a page key to clear one entry). */
export function invalidateCmsPublicCache(page?: CmsPageKey): void {
  if (!page) {
    cmsPageCache.clear();
    faqCache.clear();
    return;
  }
  for (const key of cmsPageCache.keys()) {
    if (key.startsWith(`${page}:`)) cmsPageCache.delete(key);
  }
}

export async function getCmsPage(
  page: CmsPageKey,
  locale: Locale = "id",
): Promise<CmsGrouped> {
  const cacheKey = `${page}:${locale}`;
  const hit = cmsPageCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  const pending = cmsPageInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async (): Promise<CmsGrouped> => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/cms/${page}?locale=${locale}`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );
      if (!res.ok) return {};
      const json = await res.json();
      const data: CmsGrouped = json.data || {};
      cmsPageCache.set(cacheKey, {
        data,
        expires: Date.now() + CMS_PUBLIC_TTL_MS,
      });
      return data;
    } catch {
      return {};
    } finally {
      cmsPageInflight.delete(cacheKey);
    }
  })();

  cmsPageInflight.set(cacheKey, request);
  return request;
}

export async function getPublicFaqs(locale: Locale = "id"): Promise<FaqItem[]> {
  const cacheKey = `faqs:${locale}`;
  const hit = faqCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  const pending = faqInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async (): Promise<FaqItem[]> => {
    try {
      const res = await fetch(`${BASE_URL}/api/cms/faqs?locale=${locale}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return [];
      const json = await res.json();
      const data: FaqItem[] = Array.isArray(json.data) ? json.data : [];
      faqCache.set(cacheKey, {
        data,
        expires: Date.now() + CMS_PUBLIC_TTL_MS,
      });
      return data;
    } catch {
      return [];
    } finally {
      faqInflight.delete(cacheKey);
    }
  })();

  faqInflight.set(cacheKey, request);
  return request;
}

export async function adminGetCmsPage(
  page: CmsPageKey,
  locale: Locale = "id",
): Promise<CmsField[]> {
  const res = await fetch(
    `${BASE_URL}/api/admin/cms/${page}?locale=${locale}`,
    {
      headers: authHeaders(),
    },
  );
  if (!res.ok) throw new Error("Gagal memuat konten CMS");
  const json = await res.json();
  return json.data || [];
}

export async function adminSaveCmsPage(
  page: CmsPageKey,
  fields: Array<{
    section: string;
    key: string;
    type?: string;
    value?: string | null;
  }>,
  locale: Locale = "id",
) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/${page}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ locale, fields }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Gagal menyimpan konten");
  }
  invalidateCmsPublicCache(page);
  return json;
}

export async function uploadCmsImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${BASE_URL}/api/admin/cms/upload`, {
    method: "POST",
    headers: authHeaders(false),
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Gagal upload gambar");
  }
  return json.data?.path as string;
}

export async function adminGetFaqs(): Promise<FaqItem[]> {
  const res = await fetch(`${BASE_URL}/api/admin/cms/faqs`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal memuat FAQ");
  const json = await res.json();
  return json.data || [];
}

export async function adminCreateFaq(
  data: Omit<FaqItem, "id">,
): Promise<FaqItem> {
  const res = await fetch(`${BASE_URL}/api/admin/cms/faqs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Gagal menambah FAQ");
  invalidateCmsPublicCache();
  return json.data;
}

export async function adminUpdateFaq(
  id: number,
  data: Partial<Omit<FaqItem, "id">>,
): Promise<FaqItem> {
  const res = await fetch(`${BASE_URL}/api/admin/cms/faqs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Gagal update FAQ");
  invalidateCmsPublicCache();
  return json.data;
}

export async function adminDeleteFaq(id: number) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/faqs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Gagal hapus FAQ");
  }
  invalidateCmsPublicCache();
}

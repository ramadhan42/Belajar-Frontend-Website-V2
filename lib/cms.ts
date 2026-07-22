/**
 * CMS API helpers — site content + FAQ
 */

import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

export type CmsPageKey = "beranda" | "kontak" | "navbar" | "footer";

export type CmsGrouped = Record<string, Record<string, string | null>>;

export interface CmsField {
  id?: number;
  page: string;
  section: string;
  key: string;
  type: "string" | "text" | "image";
  value: string | null;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
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

/** Resolve CMS image path to a usable URL */
export function resolveCmsImage(path?: string | null): string | null {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  if (path.startsWith("/src/") || path.startsWith("/images/")) {
    return path;
  }
  if (path.startsWith("/storage/")) {
    return `${BASE_URL}${path}`;
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

export async function getCmsPage(page: CmsPageKey): Promise<CmsGrouped> {
  try {
    const res = await fetch(`${BASE_URL}/api/cms/${page}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

export async function getPublicFaqs(): Promise<FaqItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/cms/faqs`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function adminGetCmsPage(page: CmsPageKey): Promise<CmsField[]> {
  const res = await fetch(`${BASE_URL}/api/admin/cms/${page}`, {
    headers: authHeaders(),
  });
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
) {
  const res = await fetch(`${BASE_URL}/api/admin/cms/${page}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ fields }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Gagal menyimpan konten");
  }
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
}

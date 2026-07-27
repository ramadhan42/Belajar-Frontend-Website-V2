/**
 * Evomi Perfume E-Commerce — API Client
 * Base URL: -
 *
 * Semua endpoint diintegrasikan dari Postman Collection "Evomi Perfume E-Commerce API".
 * Token Sanctum disimpan di localStorage dengan key "auth_token".
 */

import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  nama_lengkap?: string | null;
  alamat_lengkap?: string | null;
  phone?: string | null;
  avatar_profile?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface Product {
  id: number;
  title: string; // bukan "name"
  title_en?: string | null;
  description?: string;
  description_en?: string | null;
  color?: string;
  price: string; // string "10000.00" dari Laravel
  personality_type?: string;
  personality_type_en?: string | null;
  top_note?: string;
  top_note_en?: string | null;
  middle_note?: string;
  middle_note_en?: string | null;
  base_note?: string;
  base_note_en?: string | null;
  image_produk_belanja?: string;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  bottle_size?: number;
  perfume_type?: string;
  gender?: string;
  quantity?: number;
  stock_status?: string;
  
  alamat_awal_pengiriman?: string;
  kondisi?: string;
  kategori?: string;
  berat_satuan?: number;
  brand?: string;
  etalase?: string;

  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product?: Product;
}

export interface QuizOption {
  id: number;
  question_id: number;
  text: string;
  prestige_score?: number;
  peaceful_calm_score?: number;
  rebel_brave_score?: number;
  sweet_shy_score?: number;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizAnswer {
  question_id: number;
  option_id: number;
}

export interface QuizResult {
  id?: number;
  personality_type?: string;
  recommended_product?: Product;
  match_percentage?: number;
  created_at?: string;
}

export interface ShoppingHistoryItem {
  id: string | number;
  product?: Product;
  quantity?: number;
  status?: string;
  /** Harga produk katalog × qty (sebelum promo) */
  total_price?: number;
  shipping_cost?: number;
  promo_discount?: number;
  /** Backend append: total_price + shipping_cost − promo_discount */
  grand_total?: number;
  /** @deprecated legacy alias */
  ongkir_price?: number;
  created_at?: string;
  metode_pembayaran?: string;
}

/** Total bayar order = produk + ongkir − promo (sekali). */
export function orderGrandTotal(order: {
  total_price?: number | string | null;
  shipping_cost?: number | string | null;
  promo_discount?: number | string | null;
  grand_total?: number | string | null;
  ongkir_price?: number | string | null;
}): number {
  if (order.grand_total != null && order.grand_total !== "") {
    const g = Number(order.grand_total);
    if (Number.isFinite(g)) return Math.max(0, g);
  }
  const product = Number(order.total_price || 0) || 0;
  const shipping =
    Number(order.shipping_cost ?? order.ongkir_price ?? 0) || 0;
  const promo = Number(order.promo_discount || 0) || 0;
  return Math.max(0, product + shipping - promo);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function buildHeaders(withAuth = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (withAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);

  // Coba parse JSON — beberapa endpoint mungkin return empty body (204)
  let body: T | null = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text) as T;
    } catch {
      // Bukan JSON — biarkan body null
    }
  }

  if (!res.ok) {
    const errorBody = body as ApiResponse | null;
    const message =
      errorBody?.message ?? `Request gagal dengan status ${res.status}`;
    throw new Error(message);
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// 1. Authentication
// ---------------------------------------------------------------------------

/** POST /api/register */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/register", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
}

/** POST /api/login */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/logout  — membutuhkan Bearer token */
export async function logout(): Promise<void> {
  await request<void>("/api/logout", {
    method: "POST",
    headers: buildHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// 2. User Profile & History
// ---------------------------------------------------------------------------

/** GET /api/user/profile */
export async function getProfile(): Promise<User> {
  const res = await request<{ data: User } | User>("/api/user/profile", {
    method: "GET",
    headers: buildHeaders(true),
  });
  return (res as { data: User }).data ?? (res as User);
}

/** GET /api/shopping-history?locale= */
export async function getShoppingHistory(
  locale: "id" | "en" = "id",
): Promise<ShoppingHistoryItem[]> {
  return request<ShoppingHistoryItem[]>(
    `/api/shopping-history?locale=${locale}`,
    {
      method: "GET",
      headers: buildHeaders(true),
    },
  );
}

export interface BadgeCounts {
  cart: number;
  wishlist: number;
  history: number;
  unread: number;
}

/** GET /api/badges — lightweight counts for navbar/profile badges */
export async function getBadgeCounts(): Promise<BadgeCounts> {
  const res = await request<{ success?: boolean; data: BadgeCounts }>(
    "/api/badges",
    {
      method: "GET",
      headers: buildHeaders(true),
    },
  );

  return {
    cart: Number(res.data?.cart ?? 0),
    wishlist: Number(res.data?.wishlist ?? 0),
    history: Number(res.data?.history ?? 0),
    unread: Number(res.data?.unread ?? 0),
  };
}

// Tambahkan di file api.ts
export async function removeHistoryItem(orderId: string | number): Promise<void> {
  await request<void>(`/api/orders/${orderId}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// Helpers khusus Product
// ---------------------------------------------------------------------------

/** Base URL storage Laravel (gambar produk di storage/app/public) */
const STORAGE_URL = SITE_STRINGS.base_url.url_backend + "/storage/";

/** Konversi path gambar relatif dari Laravel menjadi URL absolut */
export function getProductImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Hapus leading slash / "storage/" jika sudah ikut di path
  const clean = path.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${STORAGE_URL}${clean}`;
}

/** Format harga string "10000.00" → "Rp10.000" */
export function formatProductPrice(price?: string | number): string {
  if (!price) return "";
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(num)
    .replace("IDR", "Rp");
}

// Tambahkan ini di file api.ts Anda
export const checkoutApi = {
  processCheckout: async () => {
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(), // Pastikan fungsi ini tersedia
      },
    });
    if (!res.ok) throw new Error("Gagal melakukan checkout");
    return res.json();
  },
};

export type GuestCheckoutPayload = {
  guest_email: string;
  invoice_id: string;
  payment_method: string;
  total: number;
  shipping_cost?: number;
  promo_discount?: number;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    title?: string;
  }>;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  courier?: string;
};

/** POST /api/checkout/guest — buy-now tanpa login */
export async function guestCheckoutApi(payload: GuestCheckoutPayload) {
  const res = await fetch(`${BASE_URL}/api/checkout/guest`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error_detail ||
        data.message ||
        "Gagal melakukan checkout tamu",
    );
  }
  return data as {
    success: boolean;
    message: string;
    data?: { order_id: string; tracking_url_hint?: string };
  };
}

// ---------------------------------------------------------------------------
// 3. Products
// ---------------------------------------------------------------------------

/** GET /api/products?locale= */
export async function getProducts(locale: "id" | "en" = "id"): Promise<Product[]> {
  const res = await request<{ data: Product[] } | Product[]>(
    `/api/products?locale=${locale}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );
  return Array.isArray(res) ? res : ((res as { data: Product[] }).data ?? []);
}

/** GET /api/products/:id?locale= */
export async function getProduct(
  id: number | string,
  locale: "id" | "en" = "id",
): Promise<Product> {
  const res = await request<{ data: Product } | Product>(
    `/api/products/${id}?locale=${locale}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );
  return (res as { data: Product }).data ?? (res as Product);
}

// ---------------------------------------------------------------------------
// 4. Cart
// ---------------------------------------------------------------------------

/** GET /api/carts?locale= */
export async function getCartItems(
  locale: "id" | "en" = "id",
): Promise<CartItem[]> {
  return request<CartItem[]>(`/api/carts?locale=${locale}`, {
    method: "GET",
    headers: buildHeaders(true),
  });
}

/** POST /api/carts — tambah ke cart atau update quantity */
export async function addToCart(
  product_id: number,
  quantity: number,
): Promise<CartItem> {
  return request<CartItem>("/api/carts", {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ product_id, quantity }),
  });
}

/** DELETE /api/carts/:id */
export async function removeFromCart(cartItemId: number): Promise<void> {
  await request<void>(`/api/carts/${cartItemId}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// 5. Wishlist
// ---------------------------------------------------------------------------

/** GET /api/wishlists?locale= */
export async function getWishlistItems(
  locale: "id" | "en" = "id",
): Promise<WishlistItem[]> {
  return request<WishlistItem[]>(`/api/wishlists?locale=${locale}`, {
    method: "GET",
    headers: buildHeaders(true),
  });
}

/** POST /api/wishlists */
export async function addToWishlist(product_id: number): Promise<WishlistItem> {
  return request<WishlistItem>("/api/wishlists", {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ product_id }),
  });
}

/** DELETE /api/wishlists/:id */
export async function removeFromWishlist(
  wishlistItemId: number,
): Promise<void> {
  await request<void>(`/api/wishlists/${wishlistItemId}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// 6. Quiz & Personality
// ---------------------------------------------------------------------------

/** GET /api/quiz/questions */
export async function getQuizQuestions(
  locale: "id" | "en" = "id",
): Promise<QuizQuestion[]> {
  return request<QuizQuestion[]>(`/api/quiz/questions?locale=${locale}`, {
    method: "GET",
    headers: buildHeaders(),
  });
}

export interface QuizPersonalityResultCopy {
  personality_key: string;
  title: string;
  description: string;
  color?: string | null;
  bg_image?: string | null;
  product_image?: string | null;
  forced_product_id?: string | null;
}

/** GET /api/quiz/results?locale= */
export async function getQuizResults(
  locale: "id" | "en" = "id",
): Promise<Record<string, QuizPersonalityResultCopy>> {
  const res = await request<{
    success?: boolean;
    data?: Record<string, QuizPersonalityResultCopy>;
  }>(`/api/quiz/results?locale=${locale}`, {
    method: "GET",
    headers: buildHeaders(),
  });
  return res?.data ?? {};
}

/** POST /api/quiz/submit */
export async function submitQuiz(
  answers: QuizAnswer[],
  locale: "id" | "en" = "id",
): Promise<QuizResult> {
  return request<QuizResult>(`/api/quiz/submit?locale=${locale}`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ answers, locale }),
  });
}

/** GET /api/quiz/history */
export async function getQuizHistory(
  locale: "id" | "en" = "id",
): Promise<QuizResult[]> {
  return request<QuizResult[]>(`/api/quiz/history?locale=${locale}`, {
    method: "GET",
    headers: buildHeaders(true),
  });
}

// Helper dengan return type eksplisit agar tidak error di RequestInit.headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

/** Header auth + Accept untuk halaman admin */
export function getAdminHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...getAuthHeaders(),
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export type Promo = {
  id: number;
  harga_promo: number | string;
  persentase_promo?: number | string | null;
  tanggal_berlaku_promo?: string | null;
  tanggal_berakhir_promo?: string | null;
  created_at?: string;
  updated_at?: string;
};

/** Promo publik (storefront). active=true → hanya yang berlaku hari ini. */
export async function getPromos(active = false): Promise<Promo[]> {
  const q = active ? "?active=1" : "";
  const res = await fetch(`${BASE_URL}/api/promos${q}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Gagal memuat promo");
  }
  return data.data || [];
}

/** Promo aktif terbesar (untuk belanja details). */
export async function getActivePromo(): Promise<Promo | null> {
  const list = await getPromos(true);
  if (!list.length) return null;
  return list.reduce((best, cur) =>
    Number(cur.harga_promo) > Number(best.harga_promo) ? cur : best,
  );
}

// 1. API UNTUK USER PROFILE
// SUDAH DIPERBAIKI: Menggunakan 'export', bukan 'public'
export const userProfileApi = {
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil data profil");
    return res.json();
  },

  updateProfile: async (
    data:
      | FormData
      | {
          name: string;
          nama_lengkap?: string;
          alamat_lengkap?: string;
          phone?: string;
          email: string;
        },
  ) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const firstError = errorData?.errors
        ? Object.values(errorData.errors).flat()[0]
        : null;
      throw new Error(
        (firstError as string) ||
          errorData.message ||
          "Gagal memperbarui profil",
      );
    }
    return res.json();
  },
};

// 2. API UNTUK CART (KERANJANG)
export const cartApi = {
  getCart: async () => {
    const res = await fetch(`${BASE_URL}/api/carts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil data keranjang");
    return res.json();
  },

  addToCart: async (productId: number, quantity: number) => {
    // Ambil token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${BASE_URL}/api/carts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // PENTING: Tambahkan header Authorization ini!
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!response.ok) {
      throw new Error("Gagal menambah ke keranjang");
    }
    return response.json();
  },

  // ... fungsi lainnya
  updateQuantity: async (cartId: number, quantity: number) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${BASE_URL}/api/carts/${cartId}`, {
      method: "PUT", // Gunakan PUT untuk update
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) throw new Error("Gagal memperbarui jumlah item");
    return response.json();
  },

  removeFromCart: async (cartId: number) => {
    const res = await fetch(`${BASE_URL}/api/carts/${cartId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    // 1. Tangkap error asli dari backend
    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔥 Error dari Laravel:", errorText);
      throw new Error("Gagal menghapus produk dari keranjang");
    }

    // 2. Mencegah error Next.js jika backend merespons tanpa body (204 No Content)
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },
};

// 3. API UNTUK WISHLIST (Perbaikan)
export const wishlistApi = {
  getWishlist: async (locale: "id" | "en" = "id") => {
    const res = await fetch(`${BASE_URL}/api/wishlists?locale=${locale}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil data wishlist");
    return res.json();
  },

  toggleWishlist: async (productId: number) => {
    const res = await fetch(`${BASE_URL}/api/wishlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) throw new Error("Gagal mengubah status wishlist");
    return res.json();
  },

  // TAMBAHKAN FUNGSI INI
  removeFromWishlist: async (wishlistId: number) => {
    const res = await fetch(`${BASE_URL}/api/wishlists/${wishlistId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Gagal menghapus dari wishlist");
    return res.json();
  },

  // 👇 TAMBAHKAN KODE INI DI BAWAHNYA 👇
  getWishlistDetail: async (id: number, locale: "id" | "en" = "id") => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(
      `${BASE_URL}/api/wishlists/${id}?locale=${locale}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil detail wishlist");
    }

    return response.json();
  },
};

// Tambahkan di dalam lib/api.ts
export const getHistoryDetail = async (
  id: string | number,
): Promise<ShoppingHistoryItem> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil detail riwayat belanja");
  }

  const result = await response.json();
  return result.data ?? result;
};

// Tambahkan fungsi ini di dalam lib/api.ts
export const resetPasswordApi = async (data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  // Menggunakan FormData untuk menyesuaikan dengan --form pada curl
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("password", data.password);

  const res = await fetch(`${BASE_URL}/api/forgot-password`, {
    method: "POST",
    // Jangan set Content-Type header agar browser otomatis menambahkan
    // boundary multipart/form-data yang benar
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    // Menangkap error dari Laravel (misal: email tidak ditemukan)
    throw new Error(result.message || "Gagal memperbarui password.");
  }

  return result;
};

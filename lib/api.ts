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
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface Product {
  id: number;
  title: string; // bukan "name"
  description?: string;
  color?: string;
  price: string; // string "10000.00" dari Laravel
  personality_type?: string;
  top_note?: string;
  middle_note?: string;
  base_note?: string;
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
  id: number;
  product?: Product;
  quantity?: number;
  status?: string;
  total_price?: number;
  ongkir_price?: number;
  created_at?: string;
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

/** GET /api/profile */
export async function getProfile(): Promise<User> {
  return request<User>("/api/profile", {
    method: "GET",
    headers: buildHeaders(true),
  });
}

/** GET /api/shopping-history */
export async function getShoppingHistory(): Promise<ShoppingHistoryItem[]> {
  return request<ShoppingHistoryItem[]>("/api/shopping-history", {
    method: "GET",
    headers: buildHeaders(true),
  });
}

// Tambahkan di file api.ts
export async function removeHistoryItem(orderId: number): Promise<void> {
  await request<void>(`/api/orders/${orderId}`, {
    // Sesuaikan URL dengan route di Laravel
    method: "DELETE",
    headers: buildHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// Helpers khusus Product
// ---------------------------------------------------------------------------

/** Base URL storage Laravel (gambar produk disimpan di storage/app/public) */
const STORAGE_URL = (process.env.NEXT_PUBLIC_URL || BASE_URL) + "/storage/";

/** Konversi path gambar relatif dari Laravel menjadi URL absolut */
export function getProductImageUrl(path?: string): string | null {
  if (!path) return null;
  // 1. Jika sudah berupa URL absolut (http:// atau https://), langsung kembalikan
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return STORAGE_URL + path;
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

// ---------------------------------------------------------------------------
// 3. Products
// ---------------------------------------------------------------------------

/** GET /api/products */
export async function getProducts(): Promise<Product[]> {
  const res = await request<{ data: Product[] } | Product[]>("/api/products", {
    method: "GET",
    headers: buildHeaders(),
  });
  // Unwrap Laravel Resource Collection { data: [...] }
  return Array.isArray(res) ? res : ((res as { data: Product[] }).data ?? []);
}

/** GET /api/products/:id */
export async function getProduct(id: number | string): Promise<Product> {
  const res = await request<{ data: Product } | Product>(
    `/api/products/${id}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );
  // Unwrap Laravel Resource { data: {...} }
  return (res as { data: Product }).data ?? (res as Product);
}

// ---------------------------------------------------------------------------
// 4. Cart
// ---------------------------------------------------------------------------

/** GET /api/carts */
export async function getCartItems(): Promise<CartItem[]> {
  return request<CartItem[]>("/api/carts", {
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

/** GET /api/wishlists */
export async function getWishlistItems(): Promise<WishlistItem[]> {
  return request<WishlistItem[]>("/api/wishlists", {
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
export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  return request<QuizQuestion[]>("/api/quiz/questions", {
    method: "GET",
    headers: buildHeaders(),
  });
}

/** POST /api/quiz/submit */
export async function submitQuiz(answers: QuizAnswer[]): Promise<QuizResult> {
  return request<QuizResult>("/api/quiz/submit", {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ answers }),
  });
}

/** GET /api/quiz/history */
export async function getQuizHistory(): Promise<QuizResult[]> {
  return request<QuizResult[]>("/api/quiz/history", {
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

// 1. API UNTUK USER PROFILE
// SUDAH DIPERBAIKI: Menggunakan 'export', bukan 'public'
export const userProfileApi = {
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil data profil");
    return res.json();
  },

  updateProfile: async (data: {
    name: string;
    nama_lengkap?: string;
    alamat_lengkap?: string;
    email: string;
  }) => {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Gagal memperbarui profil");
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
  getWishlist: async () => {
    // Tambahkan /api/ di depan dan 's' di belakang agar sesuai route Laravel
    const res = await fetch(`${BASE_URL}/api/wishlists`, {
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
  getWishlistDetail: async (id: number) => {
    // Sesuaikan cara pemanggilan (fetch/axios) dengan fungsi Anda yang lain
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // Ganti URL_BACKEND_ANDA dengan base URL yang biasa Anda gunakan di file ini
    const response = await fetch(`${BASE_URL}/api/wishlist/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || BASE_URL;

  const response = await fetch(`${baseUrl}/history/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil detail riwayat belanja");
  }

  return response.json();
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

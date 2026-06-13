/**
 * Evomi Perfume E-Commerce — API Client
 * Base URL: http://127.0.0.1:8000
 *
 * Semua endpoint diintegrasikan dari Postman Collection "Evomi Perfume E-Commerce API".
 * Token Sanctum disimpan di localStorage dengan key "auth_token".
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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
  title: string;           // bukan "name"
  description?: string;
  price: string;           // string "10000.00" dari Laravel
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
  total_price?: number;
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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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

// ---------------------------------------------------------------------------
// Helpers khusus Product
// ---------------------------------------------------------------------------

/** Base URL storage Laravel (gambar produk disimpan di storage/app/public) */
const STORAGE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000") +
  "/storage/";

/** Konversi path gambar relatif dari Laravel menjadi URL absolut */
export function getProductImageUrl(path?: string): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
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
  return Array.isArray(res) ? res : (res as { data: Product[] }).data ?? [];
}

/** GET /api/products/:id */
export async function getProduct(id: number | string): Promise<Product> {
  const res = await request<{ data: Product } | Product>(`/api/products/${id}`, {
    method: "GET",
    headers: buildHeaders(),
  });
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
export async function removeFromWishlist(wishlistItemId: number): Promise<void> {
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
export async function submitQuiz(
  answers: QuizAnswer[],
): Promise<QuizResult> {
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

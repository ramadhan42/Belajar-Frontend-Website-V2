"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
// Sesuaikan path import di bawah ini dengan lokasi file api.ts Anda
import {
  getCartItems,
  removeFromCart,
  addToCart,
  CartItem,
  getProductImageUrl,
  formatProductPrice,
} from "@/lib/api";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil data keranjang saat komponen di-mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCartItems();
      setCartItems(data);
    } catch (err: any) {
      setError(
        err.message ||
          "Gagal memuat keranjang belanja. Pastikan Anda sudah login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk menghapus item
  const handleRemoveItem = async (cartItemId: number) => {
    try {
      // Optimistic UI update (hapus dari state langsung biar terasa cepat)
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      await removeFromCart(cartItemId);
    } catch (err) {
      console.error("Gagal menghapus item:", err);
      // Rollback jika gagal (bisa dengan fetch ulang)
      fetchCart();
    }
  };

  // Handler untuk mengubah kuantitas (menggunakan addToCart endpoint yang berfungsi sebagai upsert/update)
  const handleUpdateQuantity = async (
    productId: number,
    currentQty: number,
    change: number,
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // Jangan biarkan kuantitas di bawah 1

    try {
      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity: newQty } : item,
        ),
      );

      await addToCart(productId, newQty);
    } catch (err) {
      console.error("Gagal update kuantitas:", err);
      fetchCart(); // Rollback jika error
    }
  };

  // Hitung total harga
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + price * item.quantity;
  }, 0);

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat keranjang Anda...</p>
      </div>
    );
  }

  // Tampilan saat terjadi error (misal: belum login)
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/login" className="text-black font-medium hover:underline">
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Keranjang Belanja
      </h1>

      {cartItems.length > 0 ? (
        <div className="space-y-6">
          {/* Daftar Produk */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const imageUrl =
                getProductImageUrl(
                  product.image_produk_belanja || product.image_1,
                ) || "/placeholder.jpg";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatProductPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-4 sm:mt-0">
                    {/* Kontrol Kuantitas */}
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity,
                            -1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity,
                            1,
                          )
                        }
                        className="text-gray-500 hover:text-black transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ringkasan & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Total Belanja</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatProductPrice(total)}
              </p>
            </div>
            {/* Cari bagian ini di page.tsx Cart Anda */}
            <Link
              href="/checkout?type=cart"
              className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-center shadow-md"
            >
              Checkout Sekarang
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Trash2 className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Keranjang Anda kosong
          </h2>
          <p className="text-gray-500 mb-6">
            Belum ada parfum yang ditambahkan ke keranjang belanja.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}

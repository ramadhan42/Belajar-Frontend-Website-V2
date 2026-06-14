"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X 
} from "lucide-react";
import {
  wishlistApi,
  cartApi,
  WishlistItem,
  formatProductPrice,
  getProductImageUrl,
} from "@/lib/api";

// Definisikan tipe untuk state modal
interface ModalConfig {
  isOpen: boolean;
  type: "success" | "warning" | "error";
  message: string;
}

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk custom modal
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    wishlistApi.getWishlist().then((data) => {
      setWishlists(data);
      setLoading(false);
    });
  }, []);

  // Fungsi pembantu untuk memicu modal muncul
  const triggerModal = (type: "success" | "warning" | "error", message: string) => {
    setModal({ isOpen: true, type, message });
  };

  // Fungsi menutup modal
  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRemove = async (id: number) => {
    await wishlistApi.removeFromWishlist(id);
    setWishlists(wishlists.filter((item) => item.id !== id));
  };

  const handleAddToCart = async (productId: number, wishlistItemId: number) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      triggerModal("warning", "Silakan login terlebih dahulu untuk menambahkan produk.");
      return;
    }

    try {
      await cartApi.addToCart(productId, 1);
      triggerModal("success", "Produk berhasil dimasukkan ke keranjang belanja!");
      await handleRemove(wishlistItemId);
    } catch (err: unknown) {
      console.error("Error add to cart:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal menambahkan ke keranjang";
      triggerModal("error", errorMessage);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Wishlist Tersimpan
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {wishlists.map((item) => {
          return (
            <div
              key={item.id}
              className="border border-gray-100 rounded-xl p-4 relative bg-white hover:shadow-lg transition-all duration-300"
            >
              {/* REMOVE BUTTON */}
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* IMAGE */}
              <div className="w-full h-52 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {item.product?.image_produk_belanja ? (
                  <img
                    src={getProductImageUrl(item.product.image_produk_belanja) ?? ""}
                    alt={item.product.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>

              {/* PRODUCT INFO */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {item.product?.title}
                </h3>
                <p className="text-lg font-bold mt-1 text-black">
                  {formatProductPrice(item.product?.price)}
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={() => handleAddToCart(item.product_id, item.id)}
                className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Masukkan Keranjang
              </button>
            </div>
          );
        })}
      </div>

      {/* CUSTOM OVERLAY MODAL COMPONENT */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 transform scale-100 transition-all">
            
            {/* CLOSE BUTTON (X) */}
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL BODY */}
            <div className="text-center mt-2">
              {/* Ikon Dinamis berdasarkan Tipe */}
              <div className="flex justify-center mb-4">
                {modal.type === "success" && (
                  <CheckCircle2 className="w-14 h-14 text-green-500 animate-bounce" />
                )}
                {modal.type === "warning" && (
                  <AlertTriangle className="w-14 h-14 text-amber-500 animate-pulse" />
                )}
                {modal.type === "error" && (
                  <XCircle className="w-14 h-14 text-red-500 animate-shake" />
                )}
              </div>

              {/* Judul Dinamis */}
              <h3 className="text-lg font-bold text-gray-900 capitalize mb-2">
                {modal.type === "success" && "Berhasil!"}
                {modal.type === "warning" && "Perhatian"}
                {modal.type === "error" && "Gagal"}
              </h3>

              {/* Pesan */}
              <p className="text-sm text-gray-600 mb-6">
                {modal.message}
              </p>

              {/* Tombol Aksi */}
              <button
                onClick={closeModal}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-colors duration-200 ${
                  modal.type === "success" ? "bg-green-600 hover:bg-green-700" :
                  modal.type === "warning" ? "bg-amber-500 hover:bg-amber-600" :
                  "bg-red-600 hover:bg-red-700"
                }`}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
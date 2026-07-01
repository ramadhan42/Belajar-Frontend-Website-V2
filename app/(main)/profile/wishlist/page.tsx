"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter untuk navigasi halaman
import {
  ShoppingCart,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import {
  wishlistApi,
  cartApi,
  WishlistItem,
  formatProductPrice,
  getProductImageUrl,
} from "@/lib/api";

interface ModalConfig {
  isOpen: boolean;
  type: "success" | "warning" | "error";
  message: string;
}

export default function WishlistPage() {
  const router = useRouter(); // 2. Inisialisasi router Next.js
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal dan target penghapusan
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    wishlistApi.getWishlist().then((data) => {
      setWishlists(data);
      setLoading(false);
    });
  }, []);

  const triggerModal = (
    type: "success" | "warning" | "error",
    message: string,
  ) => {
    setModal({ isOpen: true, type, message });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    setItemToDelete(null);
  };

  // Trigger modal konfirmasi
  const confirmRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 3. Mencegah navigasi detail terbuka saat menekan tombol Hapus
    setItemToDelete(id);
    triggerModal(
      "warning",
      "Apakah Anda yakin ingin menghapus produk ini dari wishlist?",
    );
  };

  // Eksekusi hapus setelah konfirmasi
  const executeRemove = async () => {
    if (itemToDelete) {
      try {
        await wishlistApi.removeFromWishlist(itemToDelete);
        setWishlists(wishlists.filter((item) => item.id !== itemToDelete));
        // Mengubah isi modal menjadi penanda sukses setelah berhasil delete
        triggerModal(
          "success",
          "Produk berhasil dihapus dari daftar wishlist Anda.",
        );
      } catch (err) {
        triggerModal("error", "Gagal menghapus item dari wishlist.");
      }
    }
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    productId: number,
    wishlistItemId: number,
  ) => {
    e.stopPropagation(); // 4. Mencegah navigasi detail terbuka saat menekan tombol Masukkan Keranjang
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      triggerModal(
        "warning",
        "Silakan login terlebih dahulu untuk menambahkan produk.",
      );
      return;
    }

    try {
      await cartApi.addToCart(productId, 1);
      triggerModal(
        "success",
        "Produk berhasil dimasukkan ke keranjang belanja!",
      );
      await wishlistApi.removeFromWishlist(wishlistItemId);
      setWishlists(wishlists.filter((item) => item.id !== wishlistItemId));
    } catch (err: any) {
      triggerModal("error", err?.message || "Gagal menambahkan ke keranjang");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat wishlist...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Wishlist Tersimpan
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {wishlists.map((item) => {
          const imageToDisplay =
            item.product?.image_3 || item.product?.image_produk_belanja;

          return (
            <div
              key={item.id}
              // 5. Menambahkan event klik untuk pergi ke page folder detail [id]
              // onClick={() => router.push(`/profile/wishlist/${item.id}`)}
              className="border border-gray-100 rounded-xl p-4 relative bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              {/* Tombol Trash / Hapus */}
              <button
                onClick={(e) => confirmRemove(e, item.id)}
                className="absolute top-3 right-3 z-10 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-full h-52 rounded-xl mb-4 flex items-center justify-center overflow-hidden bg-gray-50">
                {imageToDisplay ? (
                  <img
                    src={getProductImageUrl(imageToDisplay) ?? ""}
                    alt={item.product?.title || "Gambar Produk"}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {item.product?.title}
                </h3>
                <p className="text-lg font-bold mt-1 text-black">
                  {formatProductPrice(item.product?.price)}
                </p>
              </div>

              {/* Tombol Masukkan Keranjang */}
              <button
                onClick={(e) => handleAddToCart(e, item.product_id, item.id)}
                className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Masukkan Keranjang
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL GLOBAL (SUKSES, ERROR, & KONFIRMASI WARNING) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mt-2">
              <div className="flex justify-center mb-4">
                {modal.type === "success" && (
                  <CheckCircle2 className="w-14 h-14 text-green-500 animate-bounce" />
                )}
                {modal.type === "warning" && (
                  <AlertTriangle className="w-14 h-14 text-amber-500" />
                )}
                {modal.type === "error" && (
                  <XCircle className="w-14 h-14 text-red-500" />
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 capitalize mb-2">
                {modal.type === "success"
                  ? "Berhasil!"
                  : modal.type === "warning"
                    ? "Konfirmasi"
                    : "Gagal"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{modal.message}</p>

              <div className="flex gap-2">
                {modal.type === "warning" ? (
                  <>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={executeRemove}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"
                    >
                      Ya, Hapus
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium text-white ${modal.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    Mengerti
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

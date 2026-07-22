"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import {
  getCartItems,
  addToCart,
  CartItem,
  getProductImageUrl,
  formatProductPrice,
  cartApi,
} from "@/lib/api";

// Definisi tipe modal
interface ModalConfig {
  isOpen: boolean;
  type: "success" | "warning" | "error" | "confirm";
  message: string;
  confirmAction?: () => void;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk mengunci tombol kuantitas saat proses API berjalan (Anti-Spam)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  // State Modal
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await getCartItems();
      setCartItems(data);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err: any) {
      setError(err.message || "Gagal memuat keranjang belanja.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper pemicu modal
  const triggerModal = (
    type: ModalConfig["type"],
    message: string,
    confirmAction?: () => void,
  ) => {
    setModal({ isOpen: true, type, message, confirmAction });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  // Handler Hapus Item dengan Konfirmasi
  const handleRemoveItem = (cartItemId: number) => {
    triggerModal(
      "confirm",
      "Apakah Anda yakin ingin menghapus item ini dari keranjang?",
      async () => {
        try {
          await cartApi.removeFromCart(cartItemId);
          setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
          window.dispatchEvent(new Event("cart_updated"));
          triggerModal("success", "Item berhasil dihapus.");
        } catch (err) {
          triggerModal("error", "Gagal menghapus item.");
        }
      },
    );
  };

  // Ganti fungsi handleUpdateQuantity Anda menjadi:
  const handleUpdateQuantity = async (
    productId: number,
    currentQty: number,
    change: number,
    cartItemId: number,
  ) => {
    const newQty = currentQty + change;

    if (newQty < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    if (updatingItemId === cartItemId) return;

    try {
      setUpdatingItemId(cartItemId);

      // 1. Optimistic Update (UI berubah instan)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );

      // 2. Kirim total kuantitas baru ke API update
      await cartApi.updateQuantity(cartItemId, newQty);

      // 3. Tampilkan modal sukses setelah API berhasil
      triggerModal("success", "Kuantitas item berhasil diperbarui.");
    } catch (err) {
      // Rollback ke data server jika gagal
      const refreshedData = await getCartItems();
      setCartItems(refreshedData);
      triggerModal("error", "Gagal memperbarui jumlah produk.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Handler Checkout
  const handleCheckout = () => {
    triggerModal(
      "success",
      "Pesanan Anda sedang diproses. Mengalihkan ke halaman checkout...",
      () => {
        router.push("/checkout?type=cart");
      },
    );
    // Auto-redirect setelah 2 detik
    setTimeout(() => {
      router.push("/checkout?type=cart");
      closeModal();
    }, 2000);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product?.price || "0") * item.quantity,
    0,
  );

  if (isLoading)
    return (
      <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat keranjang...</p>
      </div>
    );

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Keranjang Belanja
      </h1>

      {cartItems.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isItemUpdating = updatingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl"
                >
                  <div className="flex items-center gap-4 w-full">
                    <img
                      src={
                        getProductImageUrl(product.image_1) ||
                        "/placeholder.jpg"
                      }
                      className="w-16 h-16 object-cover rounded-lg bg-gray-50"
                      alt={product.title}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatProductPrice(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Tombol Kuantitas dengan proteksi loading */}
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity,
                            -1,
                            item.id,
                          )
                        }
                        disabled={isItemUpdating}
                        className={`text-gray-500 hover:text-black transition-opacity ${isItemUpdating ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Tampilkan loader kecil jika item ini sedang di-update */}
                      <span className="text-sm font-medium min-w-[16px] text-center flex items-center justify-center">
                        {isItemUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin text-black" />
                        ) : (
                          item.quantity
                        )}
                      </span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity,
                            1,
                            item.id,
                          )
                        }
                        disabled={isItemUpdating}
                        className={`text-gray-500 hover:text-black transition-opacity ${isItemUpdating ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isItemUpdating}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Total Belanja</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatProductPrice(total)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md"
            >
              Checkout Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 font-medium">
          Keranjang Belanja Anda Kosong
        </div>
      )}

      {/* --- CUSTOM MODAL COMPONENT --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
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
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                )}
                {modal.type === "warning" || modal.type === "confirm" ? (
                  <AlertTriangle className="w-14 h-14 text-amber-500" />
                ) : null}
                {modal.type === "error" && (
                  <XCircle className="w-14 h-14 text-red-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {modal.type === "confirm"
                  ? "Konfirmasi"
                  : modal.type === "success"
                    ? "Berhasil"
                    : "Gagal"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{modal.message}</p>

              <div className="flex gap-3">
                {modal.type === "confirm" ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        modal.confirmAction?.();
                        closeModal();
                      }}
                      className="flex-1 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Ya, Hapus
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-800"
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

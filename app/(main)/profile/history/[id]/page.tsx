"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle2,
  Trash2,
  Clock,
  Truck,
  Box,
} from "lucide-react";

import {
  getShoppingHistory,
  formatProductPrice,
  getProductImageUrl,
  ShoppingHistoryItem,
  removeHistoryItem,
} from "@/lib/api";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend_local;

const VISUAL_BY_PERSONALITY: Record<string, { navbarColor: string }> = {
  purpose_prestige: { navbarColor: "#1172BA" },
  prestige: { navbarColor: "#1172BA" },
  peaceful_calm: { navbarColor: "#5EA14A" },
  rebel_brave: { navbarColor: "#E33D35" },
  sweet_shy: { navbarColor: "#DD74A5" },
};

interface ModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success" | "error";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const shippingCost = 2000;

  const { setNavbarAndFooterColor } = useNavbarColor();

  const [historyGroup, setHistoryGroup] = useState<ShoppingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          label: "Menunggu Konfirmasi",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
        };
      case "pengemasan":
        return {
          label: "Dikemas",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Box className="w-5 h-5 text-blue-600" />,
        };
      case "dalam_perjalanan":
        return {
          label: "Dalam Perjalanan",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <Truck className="w-5 h-5 text-purple-600" />,
        };
      case "diterima":
        return {
          label: "Diterima",
          color: "bg-teal-100 text-teal-800 border-teal-200",
          icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
        };
      case "selesai":
        return {
          label: "Selesai",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        };
      default:
        return {
          label: status || "Selesai",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <CheckCircle2 className="w-5 h-5 text-gray-600" />,
        };
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const allHistory = await getShoppingHistory();
        // const targetItem = allHistory.find((item) => String(item.id) === String(id));
        // PERBAIKAN: Jadikan string agar cocok dengan ObjectId / UUID / Numerik
        const targetItem = allHistory.find(
          (item) => String(item.id) === String(id),
        );

        if (targetItem) {
          const group = allHistory.filter(
            (item) => item.created_at === targetItem.created_at,
          );
          setHistoryGroup(group);
        } else {
          setError("Pesanan tidak ditemukan di dalam riwayat belanja Anda.");
        }
      } catch (err: any) {
        console.error("Gagal memuat detail riwayat:", err);
        setError(err.message || "Gagal mengambil data riwayat belanja.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  useEffect(() => {
    if (historyGroup.length > 0 && historyGroup[0].product) {
      const personality = historyGroup[0].product.personality_type ?? "";
      const newColor =
        VISUAL_BY_PERSONALITY[personality]?.navbarColor || "#1172BA";
      setNavbarAndFooterColor(newColor);
    }
    return () => setNavbarAndFooterColor("#2B92DE");
  }, [historyGroup, setNavbarAndFooterColor]);

  const handleConfirmReceipt = () => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Konfirmasi Pesanan",
      message:
        "Apakah Anda yakin telah menerima seluruh paket pesanan ini dengan baik? Status pesanan akan diubah menjadi Selesai.",
      confirmText: "Ya, Sudah Diterima",
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          title: "Memproses...",
          message: "Sedang menyelesaikan pesanan Anda...",
        });

        try {
          await Promise.all(
            historyGroup.map(async (item) => {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL || BASE_URL}/api/orders/${item.id}/confirm`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                  },
                },
              );

              if (!response.ok) {
                throw new Error(
                  `Gagal konfirmasi pesanan untuk item ID: ${item.id}`,
                );
              }
            }),
          );

          // Update lokal ke 'selesai' agar tombol konfirmasi otomatis tersembunyi
          setHistoryGroup((prev) =>
            prev.map((item) => ({ ...item, status: "selesai" })),
          );

          setModal({
            isOpen: true,
            type: "success",
            title: "Berhasil!",
            message: "Semua pesanan Anda telah berhasil diselesaikan.",
          });

          setTimeout(() => {
            closeModal();
            router.refresh();
          }, 1500);
        } catch (err) {
          setModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: "Terjadi kesalahan saat mengonfirmasi pesanan. Coba lagi.",
          });
        }
      },
    });
  };

  const confirmDeleteItem = (item: ShoppingHistoryItem) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Hapus Item",
      message:
        "Apakah Anda yakin ingin menghapus item ini dari riwayat belanja?",
      confirmText: "Hapus",
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          title: "Memproses...",
          message: "Menghapus item dari riwayat...",
        });

        try {
          await removeHistoryItem(item.id);
          const updatedGroup = historyGroup.filter((i) => i.id !== item.id);

          if (updatedGroup.length === 0) {
            setModal({
              isOpen: true,
              type: "success",
              title: "Dihapus",
              message: "Seluruh item pesanan ini telah terhapus.",
            });
            setTimeout(() => {
              closeModal();
              router.push("/profile/history");
            }, 1500);
          } else {
            setHistoryGroup(updatedGroup);
            setModal({
              isOpen: true,
              type: "success",
              title: "Berhasil",
              message: "Item pesanan telah dihapus.",
            });
            setTimeout(() => closeModal(), 1500);
          }
        } catch (err) {
          setModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: "Terjadi kesalahan saat menghapus item.",
          });
        }
      },
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Memuat detail pesanan...</p>
      </div>
    );

  if (error || historyGroup.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 p-4 text-center">
        <Package className="w-10 h-10 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Pesanan tidak ditemukan"}
        </h2>
        <button
          onClick={() => router.push("/profile/history")}
          className="px-6 py-2.5 bg-black text-white rounded-xl font-medium shadow-sm transition-transform active:scale-95"
        >
          Kembali ke Riwayat
        </button>
      </div>
    );

  const representativeItem = historyGroup[0];
  const personality = representativeItem.product?.personality_type ?? "";
  const themeColor =
    VISUAL_BY_PERSONALITY[personality]?.navbarColor || "#000000";
  const date = representativeItem.created_at
    ? new Date(representativeItem.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
  const invoiceId = `${representativeItem.id.toString().padStart(6, "0")}`;
  const currentStatus = (representativeItem as any).status || "selesai";
  const statusConfig = getStatusConfig(currentStatus);
  const subtotalProducts = historyGroup.reduce((acc, curr) => {
    const itemTotal = curr.total_price
      ? parseFloat(String(curr.total_price))
      : parseFloat(curr.product?.price || "0") * (curr.quantity || 1);
    return acc + itemTotal;
  }, 0);

  const finalTotalPrice = subtotalProducts + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={() => router.push("/profile/history")}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali ke Riwayat
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Detail Pesanan
        </h1>
      </div>

      <main className="max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              {statusConfig.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Status Pesanan</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {currentStatus !== "menunggu_konfirmasi" &&
              currentStatus !== "selesai" &&
              currentStatus !== "diterima" &&
              currentStatus !== "pengemasan" && (
                <button
                  onClick={handleConfirmReceipt}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pesanan
                </button>
              )}

            <div className="sm:text-right">
              <p className="text-xs text-gray-400 mb-0.5">No. Invoice</p>
              <p className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg inline-block border border-gray-100 text-sm">
                #{invoiceId}
              </p>
            </div>
          </div>
        </div>

        {/* rendering produk */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-6">
              Informasi Produk
            </h2>

            <div className="space-y-6">
              {historyGroup.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row gap-6 ${index !== 0 ? "pt-6 border-t border-gray-100" : ""}`}
                >
                  <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-xl p-3 flex-shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                    {item.product?.image_1 ? (
                      <img
                        src={
                          getProductImageUrl(item.product.image_1) ?? ""
                        }
                        alt={item.product.title}
                        className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.product?.title || "Produk Tidak Dikenal"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {item.product?.description ||
                            "Tidak ada deskripsi produk."}
                        </p>
                      </div>

                      {/* Perbaikan Bug Case-sensitivity 'selesai' huruf kecil */}
                      {((item as any).status === "diterima" ||
                        (item as any).status === "selesai" ||
                        !item.status) && (
                        <button
                          onClick={() => confirmDeleteItem(item)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-gray-500 mb-1">Harga Satuan</p>
                        <p className="font-bold text-gray-900">
                          {formatProductPrice(item.product?.price || "0")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Kuantitas</p>
                        <p className="font-bold text-gray-900">
                          {item.quantity || 1} Item
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              Rincian Pembayaran
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Metode Pembayaran</span>
                <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                  {/* Mengambil data payment_method dari API */}
                  {(representativeItem as any).metode_pembayaran ||
                    "Tidak diketahui"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tanggal Pembelian</span>
                <span className="font-medium text-gray-900">{date}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600 mt-2">
                <span>Total Subtotal Produk</span>
                <span className="font-medium text-gray-900">
                  {formatProductPrice(subtotalProducts.toString())}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-gray-900">
                  {formatProductPrice(shippingCost.toString())}
                </span>
              </div>

              <div className="pt-6 mt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                <div>
                  <span className="font-bold text-gray-900 text-base">
                    Total Belanja
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Sudah termasuk PPN jika ada
                  </p>
                </div>
                <span
                  className="font-extrabold text-3xl transition-colors duration-500"
                  style={{ color: themeColor }}
                >
                  {formatProductPrice(finalTotalPrice.toString())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Minimalist Dynamic Accent Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl transition-all scale-100">
              <div
                className="mx-auto flex items-center justify-center h-16 w-16 rounded-full transition-colors"
                style={{
                  backgroundColor: `${modal.title.includes("Hapus") ? "#FEF2F2" : `${themeColor}15`}`,
                }}
              >
                {modal.type === "confirm" &&
                  (modal.title.includes("Hapus") ? (
                    <Trash2 className="w-8 h-8 text-red-500" />
                  ) : (
                    <CheckCircle2
                      className="w-8 h-8"
                      style={{ color: themeColor }}
                    />
                  ))}
                {modal.type === "success" && (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                )}
                {modal.type === "error" && (
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {modal.type === "loading" && (
                  <Loader2
                    className="h-8 w-8 animate-spin"
                    style={{ color: themeColor }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 tracking-wide uppercase">
                  {modal.title}
                </h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">
                  {modal.message}
                </p>
              </div>

              {modal.type === "confirm" && (
                <div className="flex space-x-3 mt-4 pt-2">
                  <button
                    onClick={closeModal}
                    className="w-full font-semibold py-3 rounded-xl transition-all text-sm shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className="w-full font-semibold py-3 rounded-xl transition-all text-sm shadow-sm text-white hover:opacity-90 active:scale-95"
                    style={{
                      backgroundColor: modal.title.includes("Hapus")
                        ? "#EF4444"
                        : themeColor,
                    }}
                  >
                    {modal.confirmText}
                  </button>
                </div>
              )}
              {(modal.type === "success" || modal.type === "error") && (
                <button
                  onClick={closeModal}
                  className="w-full mt-4 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-sm hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

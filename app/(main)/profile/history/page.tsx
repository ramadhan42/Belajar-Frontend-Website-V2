"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ChevronRight,
  Loader2,
  ChevronLeft,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getShoppingHistory,
  ShoppingHistoryItem,
  formatProductPrice,
  getProductImageUrl,
  removeHistoryItem,
} from "@/lib/api";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend_local;

interface GroupedHistory {
  groupId: string; // PERBAIKAN: Diubah dari number menjadi string untuk mendukung UUID/MongoDB ObjectId
  created_at: string;
  items: ShoppingHistoryItem[];
  totalGroupPrice: number;
  totalQuantity: number;
}

interface ModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success" | "error";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function HistoryPage() {
  const { setNavbarColor, setFooterColor } = useNavbarColor();
  const shippingCost = 2000;

  const [history, setHistory] = useState<GroupedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    setNavbarColor("#0f62a2ff");
    setFooterColor("#1172BA");
  }, [setNavbarColor, setFooterColor]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getShoppingHistory();

      const groupedObj = data.reduce(
        (acc: Record<string, GroupedHistory>, item: ShoppingHistoryItem) => {
          const key = item.created_at || "unknown";

          if (!acc[key]) {
            acc[key] = {
              groupId: String(item.id), // PERBAIKAN: Pastikan ID disimpan sebagai string aman
              created_at: key,
              items: [],
              totalGroupPrice: 0,
              totalQuantity: 0,
            };
          }

          acc[key].items.push(item);

          const itemTotal = item.total_price
            ? parseFloat(String(item.total_price))
            : parseFloat(item.product?.price || "0") * (item.quantity || 1);

          acc[key].totalGroupPrice += itemTotal;
          acc[key].totalQuantity += item.quantity || 1;

          return acc;
        },
        {},
      );

      const groupedArray = Object.values(groupedObj).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setHistory(groupedArray);
    } catch (err: any) {
      setError(
        err.message ||
          "Gagal memuat riwayat belanja. Pastikan Anda sudah login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          label: "Menunggu Konfirmasi",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "pengemasan":
        return {
          label: "Dikemas",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "dalam_perjalanan":
        return {
          label: "Dalam Perjalanan",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "diterima":
        return {
          label: "Sampai Tujuan",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      case "selesai":
        return {
          label: "Selesai",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      default:
        return {
          label: status || "Selesai",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const confirmReceipt = (e: React.MouseEvent, group: GroupedHistory) => {
    e.preventDefault();
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Pesanan Diterima",
      message:
        "Apakah Anda yakin telah menerima paket pesanan ini dengan baik? Jika ya, pesanan akan diselesaikan.",
      confirmText: "Ya, Terima Pesanan",
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          title: "Memproses...",
          message: "Sedang menyelesaikan pesanan Anda...",
        });

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL || BASE_URL}/api/orders/${group.groupId}/confirm`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            },
          );

          if (!response.ok) throw new Error("Gagal konfirmasi pesanan");

          setHistory((prev) =>
            prev.map((g) => {
              if (g.groupId === group.groupId) {
                return {
                  ...g,
                  items: g.items.map((i) => ({ ...i, status: "diterima" })),
                };
              }
              return g;
            }),
          );

          setModal({
            isOpen: true,
            type: "success",
            title: "Berhasil!",
            message: "Pesanan telah berhasil diselesaikan.",
          });

          setTimeout(() => closeModal(), 1500);
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

  const confirmDeleteGroup = (e: React.MouseEvent, group: GroupedHistory) => {
    e.preventDefault();
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Hapus Riwayat",
      message:
        "Apakah Anda yakin ingin menghapus seluruh pesanan ini dari riwayat belanja?",
      confirmText: "Ya, Hapus",
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          title: "Memproses...",
          message: "Sedang menghapus riwayat pesanan Anda...",
        });

        try {
          await Promise.all(group.items.map((i) => removeHistoryItem(i.id)));
          setHistory((prev) => prev.filter((g) => g.groupId !== group.groupId));

          setModal({
            isOpen: true,
            type: "success",
            title: "Berhasil!",
            message: "Riwayat pesanan telah dihapus.",
          });

          setTimeout(() => closeModal(), 1500);
        } catch (err) {
          setModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: "Terjadi kesalahan saat menghapus riwayat. Coba lagi.",
          });
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat riwayat belanja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Belanja</h1>

      {history.length > 0 ? (
        <div className="space-y-4">
          {currentItems.map((group) => {
            const date = group.created_at
              ? new Date(group.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Tanggal tidak diketahui";

            const firstItem = group.items[0];

            // KODE BARU (MENAMPILKAN ID SECARA UTUH):
            const isNumericId = /^\d+$/.test(group.groupId);
            const invoiceId = isNumericId
              ? `#INV-${group.groupId}` // Langsung tampilkan seluruh angka tanpa batasan pad
              : `#${group.groupId.toUpperCase()}`; // Tampilkan seluruh hash alfanumerik utuh

            const currentStatus = (firstItem as any).status || "Selesai";
            const statusConfig = getStatusConfig(currentStatus);

            const imageUrl = firstItem.product
              ? getProductImageUrl(
                  firstItem.product.image_1 ||
                    firstItem.product.image_produk_belanja,
                )
              : null;

            const extraItemsCount = group.items.length - 1;

            return (
              <Link
                href={`/profile/history/${group.groupId}`}
                key={group.groupId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all gap-4 cursor-pointer group bg-white"
              >
                <div className="flex items-start gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden group-hover:bg-gray-100 transition-colors relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={firstItem.product?.title || "Produk"}
                        className="w-full h-full object-cover rounded-xl p-2 hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}

                    {extraItemsCount > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        +{extraItemsCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1">
                    <p className="font-bold text-gray-900 text-sm mb-1">
                      {invoiceId}
                    </p>

                    {firstItem.product && (
                      <p className="font-semibold text-gray-800 text-base truncate mb-1">
                        {firstItem.product.title}{" "}
                        {extraItemsCount > 0 && (
                          <span className="text-gray-500 font-normal text-sm">
                            {" "}
                            (+{extraItemsCount} Produk Lain)
                          </span>
                        )}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-gray-500">
                      <span>{date}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                      <span className="text-gray-500">
                        {group.totalQuantity} Barang
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                      <span className="font-bold text-gray-900">
                        {formatProductPrice(
                          (group.totalGroupPrice + shippingCost).toString(),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-50">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>

                  {currentStatus === "dalam_perjalanan" && (
                    <button
                      onClick={(e) => confirmReceipt(e, group)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg text-xs font-bold transition-colors z-10 shadow-sm"
                      title="Konfirmasi Pesanan Diterima"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Diterima</span>
                    </button>
                  )}

                  {(currentStatus === "diterima" ||
                    currentStatus === "selesai") && (
                    <button
                      onClick={(e) => confirmDeleteGroup(e, group)}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors z-10 shadow-sm bg-red-50 border border-red-100"
                      title="Hapus Riwayat Pesanan"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  <div className="p-2 text-gray-400 group-hover:text-black transition-colors rounded-lg group-hover:translate-x-1 duration-200">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-600">
                Halaman <span className="font-bold">{currentPage}</span> dari{" "}
                {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Riwayat belanja kosong
          </h2>
          <p className="text-gray-500 mb-6">
            Anda belum pernah melakukan pembelian produk.
          </p>
          <Link
            href="/belanja"
            className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            Mulai Belanja
          </Link>
        </div>
      )}

      {/* ================= CUSTOM MODAL COMPONENT ================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1172ba] border border-white/20 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm">
              {modal.type === "confirm" &&
                (modal.title.includes("Hapus") ? (
                  <Trash2 className="w-8 h-8 text-amber-400" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ))}
              {modal.type === "success" && (
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {modal.type === "error" && (
                <svg
                  className="h-8 w-8 text-red-400"
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
                <svg
                  className="h-8 w-8 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                {modal.title}
              </h3>
              <p className="text-sm text-blue-100/80 font-light leading-relaxed">
                {modal.message}
              </p>
            </div>

            {modal.type === "confirm" && (
              <div className="flex space-x-3 mt-4 pt-2">
                <button
                  onClick={closeModal}
                  className="w-full font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md active:scale-[0.98] bg-white/20 text-white hover:bg-white/30"
                >
                  Batal
                </button>
                <button
                  onClick={modal.onConfirm}
                  className={`w-full font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md active:scale-[0.98] text-white ${
                    modal.title.includes("Hapus")
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {modal.confirmText}
                </button>
              </div>
            )}
            {(modal.type === "success" || modal.type === "error") && (
              <button
                onClick={closeModal}
                className="w-full mt-4 bg-white text-[#1172ba] font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md hover:bg-blue-50"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

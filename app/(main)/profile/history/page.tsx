"use client";

import { useState, useEffect } from "react";
import { Package, ChevronRight, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
// Tambahkan getProductImageUrl pada import dari api
import {
  getShoppingHistory,
  ShoppingHistoryItem,
  formatProductPrice,
  getProductImageUrl,
} from "@/lib/api";

export default function HistoryPage() {
  const shippingCost = 10000;

  const [history, setHistory] = useState<ShoppingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mengambil data riwayat belanja
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getShoppingHistory();
        setHistory(data);
      } catch (err: any) {
        setError(
          err.message ||
            "Gagal memuat riwayat belanja. Pastikan Anda sudah login.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Logika Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Belanja</h1>

      {history.length > 0 ? (
        <div className="space-y-4">
          {currentItems.map((item) => {
            const date = item.created_at
              ? new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Tanggal tidak diketahui";

            const invoiceId = `INV-${item.id.toString().padStart(6, "0")}`;
            const status = "Selesai";
            const statusColor = "bg-green-100 text-green-800";

            // Ambil URL gambar (Coba image_3 atau image_produk_belanja sesuai response API Anda)
            const imageUrl = item.product
              ? getProductImageUrl(
                  item.product.image_1 || item.product.image_produk_belanja,
                )
              : null;

            return (
              <Link
                href={`/profile/history/${item.id}`}
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all gap-4 cursor-pointer group bg-white"
              >
                <div className="flex items-start gap-4 w-full sm:w-auto overflow-hidden">
                  {/* Container Gambar Produk */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden group-hover:bg-gray-100 transition-colors">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product?.title || "Produk"}
                        className="w-full h-full object-cover rounded-xl p-2 hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Informasi Singkat */}
                  <div className="flex-1 min-w-0 py-1">
                    <p className="font-bold text-gray-900 text-sm mb-1">
                      {invoiceId}
                    </p>

                    {item.product && (
                      <p className="font-semibold text-gray-800 text-base truncate mb-1">
                        {item.product.title}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-gray-500">
                      <span>{date}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>

                      {item.product && (
                        <>
                          <span className="text-gray-500">
                            {item.quantity || 1} Barang
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                        </>
                      )}

                      <span className="font-bold text-gray-900">
                        {item.total_price
                          ? formatProductPrice(
                              (
                                parseFloat(String(item.total_price ?? "0")) +
                                10000
                              ).toString(),
                            )
                          : formatProductPrice(
                              (
                                parseFloat(item.product?.price || "0") *
                                  (item.quantity || 1) +
                                10000
                              ).toString(),
                            )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Navigasi */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-50">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColor}`}
                  >
                    {status}
                  </span>
                  <div className="p-2 text-gray-400 group-hover:text-black transition-colors rounded-lg group-hover:translate-x-1 duration-200">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Kontrol Navigasi Halaman */}
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
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Package, ChevronRight, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
// Sesuaikan path import dengan lokasi file api.ts Anda
import { getShoppingHistory, ShoppingHistoryItem, formatProductPrice } from "@/lib/api";

export default function HistoryPage() {
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
        setError(err.message || "Gagal memuat riwayat belanja. Pastikan Anda sudah login.");
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
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
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
          className="px-6 py-2 bg-black text-white rounded-xl font-medium"
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
                  year: "numeric"
                }) 
              : "Tanggal tidak diketahui";

            const invoiceId = `INV-${item.id.toString().padStart(6, '0')}`;
            const status = "Selesai"; 
            const statusColor = "bg-green-100 text-green-800";

            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-sm transition-all gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{invoiceId}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{date}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="font-medium text-gray-900">
                        {item.total_price 
                          ? formatProductPrice(item.total_price) 
                          : formatProductPrice((parseFloat(item.product?.price || "0") * (item.quantity || 1)))
                        }
                      </span>
                    </div>
                    {item.product && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.product.title} (x{item.quantity || 1})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
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
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
          <h2 className="text-lg font-medium text-gray-900 mb-2">Riwayat belanja kosong</h2>
          <p className="text-gray-500 mb-6">Anda belum pernah melakukan pembelian produk.</p>
          <Link href="/" className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}
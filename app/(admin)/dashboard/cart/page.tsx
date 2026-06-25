"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  CheckCircle2,
  Package,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    title: string;
    price: string;
    image_1: string;
    image_produk_belanja: string;
    personality_type: string;
  };
  user: { name: string; email: string };
}

export default function CartPage() {
  const [carts, setCarts] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
  } | null>(null);

  const showNotification = (message: string) => {
    setNotification({ isOpen: true, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  const fetchCarts = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${baseUrl}/api/admin/carts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCarts(data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Reset ke halaman 1 setiap kali user melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("auth_token");
    try {
      await fetch(`${baseUrl}/api/carts/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCarts(carts.filter((c) => c.id !== deleteId));
      setIsDeleteModalOpen(false);
      showNotification("Item berhasil dihapus dari keranjang.");

      // Cek apakah halaman yang sedang aktif kosong setelah dihapus
      const remainingOnPage = paginatedCarts.length - 1;
      if (remainingOnPage === 0 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Gagal menghapus cart:", error);
    }
  };

  // LOGIKA FILTER DAN PAGINATION
  const filteredCarts = carts.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage) || 1;
  const paginatedCarts = filteredCarts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatRupiah = (value: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Notifikasi Pop-up */}
      {notification?.isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white border border-emerald-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 pr-6">
          <div className="bg-emerald-100 p-2 rounded-full shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Berhasil!</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header Page */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cart / Keranjang</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Daftar item produk parfum yang sedang tersimpan di keranjang belanja pelanggan.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tabel Responsif */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left w-[320px]">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[140px]">
                  Kuantitas
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left w-[180px]">
                  Harga Satuan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[100px]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginatedCarts.length > 0 ? (
                paginatedCarts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:border-gray-300 transition-colors">
                          {c.product.image_1 ? (
                            <img
                              src={`${baseUrl}/storage/${c.product.image_1}`}
                              alt={c.product.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-product.png";
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {c.product.title || "Tanpa Nama"}
                          </p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5 capitalize truncate">
                            {c.product.personality_type?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 truncate">{c.user.name}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5 truncate">{c.user.email}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 shadow-sm min-w-[3rem]">
                        {c.quantity}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {formatRupiah(c.product.price)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setDeleteId(c.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-gray-200 bg-white shadow-sm transition-all duration-200"
                          title="Hapus item dari keranjang"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ShoppingCart size={48} className="mb-4 text-gray-300" />
                      <p className="text-sm font-bold text-gray-900">Keranjang Kosong</p>
                      <p className="text-sm font-medium text-gray-500 mt-1">Tidak ada item yang sesuai dengan pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Navigasi Pagination */}
          {filteredCarts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="text-sm font-bold text-gray-700 min-w-[80px] text-center bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                {currentPage} <span className="text-gray-400 font-medium mx-1.5">/</span> {totalPages}
              </div>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1.5"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Delete yang Diperbagus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hapus Item?</h3>
              <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
                Item ini akan dikeluarkan secara permanen dari daftar keranjang belanja pengguna.
              </p>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 bg-white text-sm font-bold text-gray-700 transition-colors shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-sm transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
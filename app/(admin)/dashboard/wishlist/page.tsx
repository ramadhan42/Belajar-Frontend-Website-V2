"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface WishlistItem {
  id: number;
  product: {
    title: string;
    price: string;
    image_1: string;
    personality_type: string;
  };
  user: { name: string; email: string };
}

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string } | null>(null);

  const showNotification = (message: string) => {
    setNotification({ isOpen: true, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  const fetchWishlists = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${baseUrl}/api/admin/wishlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlists(data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, []);

  // Reset ke halaman 1 saat pencarian dilakukan
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${baseUrl}/api/wishlists/${deleteId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        setWishlists(wishlists.filter((w) => w.id !== deleteId));
        setIsDeleteModalOpen(false);
        showNotification("Item berhasil dihapus dari wishlist.");
        
        // Cek halaman setelah hapus
        const remainingOnPage = paginatedWishlists.length - 1;
        if (remainingOnPage === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  // LOGIKA PAGINATION
  const filteredWishlists = wishlists.filter(
    (w) =>
      w.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredWishlists.length / itemsPerPage) || 1;
  const paginatedWishlists = filteredWishlists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatRupiah = (value: number | string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value));
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
      {notification?.isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white border border-emerald-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-5">
          <div className="bg-emerald-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div><h4 className="text-sm font-bold">Berhasil!</h4><p className="text-xs text-gray-500">{notification.message}</p></div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-gray-500 mt-1 text-sm">Kelola daftar produk yang disimpan pelanggan.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Produk</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-left">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-left">Harga</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedWishlists.length > 0 ? (
                paginatedWishlists.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 justify-center">
                        <img src={`${baseUrl}/storage/${w.product.image_1}`} className="h-12 w-12 rounded-xl object-cover bg-gray-100" />
                        <div className="text-left w-40">
                          <p className="text-sm font-bold text-gray-900 truncate">{w.product.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{w.product.personality_type?.replace("_", " ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{w.user.name}</p>
                      <p className="text-xs text-gray-500">{w.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatRupiah(w.product.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => { setDeleteId(w.id); setIsDeleteModalOpen(true); }} 
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              )}
            </tbody>
          </table>
          
          {/* NAVIGASI PAGINATION */}
          {filteredWishlists.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/50">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-50 shadow-sm flex items-center gap-1">
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="text-sm font-bold text-gray-600 px-3">{currentPage} / {totalPages}</div>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-50 shadow-sm flex items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* MODAL DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Hapus dari Wishlist?</h3>
            <p className="text-sm text-gray-500 mt-2">Item ini akan dihapus secara permanen.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-sm">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
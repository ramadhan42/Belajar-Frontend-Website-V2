"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, CheckCircle2, Package } from "lucide-react";

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

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Tambahkan di state declarations
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
  } | null>(null);

  // Fungsi untuk memicu notifikasi
  const showNotification = (message: string) => {
    setNotification({ isOpen: true, message });
    setTimeout(() => setNotification(null), 3000); // Otomatis hilang setelah 3 detik
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

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("auth_token");
    try {
      await fetch(`${baseUrl}/api/carts/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state
      setCarts(carts.filter((c) => c.id !== deleteId));
      setIsDeleteModalOpen(false);

      // Tampilkan notifikasi sukses
      showNotification("Item berhasil dihapus dari keranjang.");
    } catch (error) {
      console.error("Gagal menghapus cart:", error);
    }
  };

  const filteredCarts = carts.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product.title.toLowerCase().includes(searchTerm.toLowerCase()),
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
      {/* Custom Notification Modal */}
      {notification?.isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white border border-emerald-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-emerald-100 p-2 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Berhasil!</h4>
            <p className="text-xs text-gray-500">{notification.message}</p>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cart / Keranjang</h1>
        <p className="text-gray-500 mt-1">
          Daftar item produk parfum yang sedang tersimpan di keranjang belanja
          pelanggan.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {/* TH Produk dibuat text-center agar pas dengan konten */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[300px]">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Kuantitas
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Harga Satuan
                </th>
                {/* TH Aksi diselaraskan ke tengah */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredCarts.length > 0 ? (
                filteredCarts.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/40 transition-colors group"
                  >
                    {/* TD Produk dibuat agak ke tengah dengan penyeimbang struktur flex */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 justify-center max-w-xs mx-auto text-left">
                        {/* Container Gambar */}
                        <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {c.product.image_1 ? (
                            <img
                              src={`${baseUrl}/storage/${c.product.image_1}`}
                              alt={c.product.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-product.png";
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {/* Info Produk */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {c.product.title || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize truncate">
                            {c.product.personality_type?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {c.user.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {c.user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-600">
                      {c.quantity}{" "}
                      <span className="text-xs font-medium text-gray-400">
                        pcs
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatRupiah(c.product.price)}
                    </td>

                    {/* TD Aksi diposisikan pas di tengah */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setDeleteId(c.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm bg-white border border-gray-150"
                          title="Hapus item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-400 font-medium"
                  >
                    Tidak ada item di dalam keranjang belanja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DELETE YANG DIPERBAGUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">
              Hapus dari Keranjang?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Item ini akan dikeluarkan secara permanen dari daftar keranjang
              belanja pengguna.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-sm transition-colors"
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

"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, ShoppingBasket, Package } from "lucide-react";

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
      setCarts(carts.filter((c) => c.id !== deleteId));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Gagal menghapus cart:", error);
    }
  };

  const filteredCarts = carts.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cart / Keranjang</h1>
        <p className="text-gray-500 mt-1">
          Daftar item yang tersimpan di keranjang pelanggan.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-2 focus:ring-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Harga
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            {/* // ... di dalam bagian <tbody> tabel Anda */}

            <tbody className="divide-y divide-gray-50">
              {filteredCarts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  {/* Kolom Produk dengan Gambar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Container Gambar */}
                      <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
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
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.product.title || "Tanpa Nama"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {c.product.personality_type?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    {c.user.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(Number(c.product.price))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setDeleteId(c.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Hapus dari Keranjang?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Item akan dihapus dari data keranjang pengguna.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl border hover:bg-gray-50 text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
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

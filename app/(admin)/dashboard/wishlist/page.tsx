"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, Heart, Package } from "lucide-react";

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

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${baseUrl}/api/wishlists/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setWishlists(wishlists.filter((w) => w.id !== deleteId));
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Gagal menghapus wishlist:", error);
    }
  };

  const filteredWishlists = wishlists.filter(
    (w) =>
      w.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-gray-500 mt-1">
          Daftar item yang disimpan di wishlist pelanggan.
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
                  Harga
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredWishlists.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        {w.product.image_1 ? (
                          <img
                            src={`${baseUrl}/storage/${w.product.image_1}`}
                            alt={w.product.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-product.png";
                            }}
                          />
                        ) : (
                          <Heart className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {w.product.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {w.product.personality_type?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {w.user.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(Number(w.product.price))}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setDeleteId(w.id);
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
              Hapus dari Wishlist?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Item akan dihapus dari data wishlist pengguna.
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

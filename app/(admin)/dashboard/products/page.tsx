"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
} from "lucide-react";

// Menyesuaikan Interface dengan JSON Response API Laravel Anda
interface Product {
  id: number | string;
  title: string;
  description: string;
  color?: string | null;
  price: string | number;
  personality_type: string;
  top_note: string;
  middle_note: string;
  base_note: string;
  image_produk_belanja?: string;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  bottle_size: number;
  perfume_type: string;
  gender: string;
  quantity: number;
  stock_status: string;
  created_at?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Setup Base URL API
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  // Tambahkan di dalam komponen ProductsPage
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Fungsi untuk menampilkan pesan (Auto-hide setelah 3 detik)
  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  // Panggil ini saat tombol delete diklik
  const confirmDelete = (id: number | string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // 1. READ: Ambil Data dari API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/products`);
      if (!res.ok) throw new Error("Gagal mengambil respons dari server");

      const data = await res.json();
      const fetchedData = data?.data || data;

      if (Array.isArray(fetchedData)) {
        setProducts(fetchedData);
      } else {
        console.warn("Format data tidak sesuai ekspektasi:", fetchedData);
        setProducts([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [baseUrl]);

  // Handler Buka Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 2. DELETE: Hapus data
  const handleDelete = async (id: number | string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    // Optimistic Update UI
    setProducts(products.filter((p) => p.id !== id));
    showNotification("Produk berhasil dihapus!", "success");

    try {
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Gagal menghapus dari server");
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      fetchProducts(); // Refresh jika gagal
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 3 & 4. CREATE / UPDATE
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mengambil semua data dari form input
    const formData = new FormData(e.currentTarget);
    const productData = Object.fromEntries(formData.entries());

    try {
      const url =
        modalMode === "add"
          ? `${baseUrl}/api/products`
          : `${baseUrl}/api/products/${selectedProduct?.id}`;

      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Ubah format data menjadi JSON sesuai request yang dibutuhkan endpoint
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      setIsModalOpen(false);
      fetchProducts(); // Refresh data dari server

      showNotification(
        modalMode === "add"
          ? "Produk berhasil ditambahkan!"
          : "Produk berhasil diupdate!",
        "success",
      );
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
      showNotification("Gagal menyimpan data. Periksa koneksi Anda.", "error");
    }
  };

  // Filter berdasarkan Title dan Personality Type
  const filteredProducts = products.filter((product) => {
    const productTitle = product?.title || "";
    const productType = product?.personality_type || "";

    return (
      productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatRupiah = (value: number | string) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numberValue);
  };

  // Fungsi helper untuk merender gambar (Laravel biasanya simpan di storage)
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${baseUrl}/storage/${path}`;
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
      {message && (
        <div
          className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-right-5 ${
            message.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Apakah Anda yakin? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl border hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                // Menggunakan fungsi anonim agar parameter 'deleteId' bisa masuk
                onClick={() => {handleDelete}}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-500 mt-1">
            Kelola inventaris, harga, notes, dan ketersediaan parfum Anda.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama parfum atau tipe kepribadian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tipe / Ukuran
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {product.image_produk_belanja ? (
                            <img
                              src={getImageUrl(product.image_1)!}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.title || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">
                            {product.personality_type?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {product.perfume_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.bottle_size} ml | {product.gender}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                          product.stock_status === "tersedia" &&
                          product.quantity > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRUD (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "add" ? "Tambah Parfum Baru" : "Edit Parfum"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kiri */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama / Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedProduct?.title}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Contoh: Purpose Prestige"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        name="price"
                        defaultValue={selectedProduct?.price}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kuantitas (Stok)
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={selectedProduct?.quantity}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personality Type
                      </label>
                      <select
                        name="personality_type"
                        defaultValue={selectedProduct?.personality_type || ""}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="" disabled>
                          Pilih Tipe
                        </option>
                        <option value="prestige">Prestige</option>
                        <option value="peaceful_calm">Peaceful Calm</option>
                        <option value="rebel_brave">Rebel Brave</option>
                        <option value="sweet_shy">Sweet Shy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Stok
                      </label>
                      <select
                        name="stock_status"
                        defaultValue={
                          selectedProduct?.stock_status || "tersedia"
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="tersedia">Tersedia</option>
                        <option value="habis">Habis</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedProduct?.description}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Parfum elegan dengan notes vanilla..."
                    />
                  </div>
                </div>

                {/* Kanan */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe Parfum
                      </label>
                      <input
                        type="text"
                        name="perfume_type"
                        defaultValue={
                          selectedProduct?.perfume_type || "Eau de Parfum"
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        defaultValue={selectedProduct?.gender || "unisex"}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="unisex">Unisex</option>
                        <option value="pria">Pria</option>
                        <option value="wanita">Wanita</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ukuran Botol (ml)
                    </label>
                    <input
                      type="number"
                      name="bottle_size"
                      defaultValue={selectedProduct?.bottle_size || 50}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fragrance Notes
                    </h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Top Note
                      </label>
                      <input
                        type="text"
                        name="top_note"
                        defaultValue={selectedProduct?.top_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Bergamot, Cardamom"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Middle Note
                      </label>
                      <input
                        type="text"
                        name="middle_note"
                        defaultValue={selectedProduct?.middle_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Cedarwood, Lavender"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Base Note
                      </label>
                      <input
                        type="text"
                        name="base_note"
                        defaultValue={selectedProduct?.base_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Amber, Vanilla"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]"
                >
                  {modalMode === "add" ? "Simpan Produk" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

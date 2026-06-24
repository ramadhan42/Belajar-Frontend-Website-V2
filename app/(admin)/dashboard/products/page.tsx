"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from "lucide-react";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Fungsi helper untuk memicu notifikasi
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ isOpen: true, message, type });
    setTimeout(
      () => setNotification({ isOpen: false, message: "", type: "success" }),
      3000,
    );
  };

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", type: "success" });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const confirmDelete = (id: number | string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

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

  const handleDelete = async (id: number | string) => {
    setProducts(products.filter((p) => p.id !== id));
    showNotification("Produk berhasil dihapus!", "success");

    try {
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus dari server");
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      fetchProducts();
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(
        `${baseUrl}/api/products/${selectedProduct?.id}`,
        {
          method: "POST", // Sesuai permintaan Anda
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Gagal memperbarui data");

      showNotification("Produk berhasil diperbarui!", "success");
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showNotification("Terjadi kesalahan saat mengupdate produk.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalMode === "edit") {
      await handleUpdate(e);
    } else {
      await handleAdd(e);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/api/products`, {
        method: "POST", // Metode POST untuk tambah data
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN tambahkan "Content-Type": "application/json" di sini
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        // Menampilkan pesan error spesifik dari server (misalnya: validasi gagal)
        console.error("Error Detail:", result);
        throw new Error(result.message || "Gagal menyimpan produk");
      }

      // Jika berhasil
      showNotification("Produk baru berhasil ditambahkan!", "success");
      setIsModalOpen(false);
      fetchProducts(); // Refresh daftar produk
    } catch (error) {
      showNotification(
        "Gagal menyimpan data: " +
          (error instanceof Error ? error.message : "Periksa koneksi Anda"),
        "error",
      );
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = Object.fromEntries(formData.entries());

    try {
      const url =
        modalMode === "add"
          ? `${baseUrl}/api/products`
          : `${baseUrl}/api/products/${selectedProduct?.id}`;

      const method = modalMode === "add" ? "POST" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },

        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      setIsModalOpen(false);
      fetchProducts();

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
      {notification.isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              bisa dibatalkan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (deleteId) handleDelete(deleteId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
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
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama parfum atau tipe kepribadian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {/* Header Produk dibuat text-center agar presisi */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[300px]">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Tipe / Ukuran
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Harga
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Stok
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/40 transition-colors group"
                  >
                    {/* Mengagak-tengahkan konten Produk dengan penyeimbang struktur flex (sama seperti cart) */}
                    <td className="px-6 py-4 pl-15">
                      <div className="flex items-center gap-4 justify-center max-w-xs mx-auto text-left">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {product.image_produk_belanja || product.image_1 ? (
                            <img
                              src={
                                getImageUrl(
                                  product.image_1 ||
                                    product.image_produk_belanja,
                                )!
                              }
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.title || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize truncate">
                            {product.personality_type?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {product.perfume_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {product.bottle_size} ml | {product.gender}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-600">
                      {product.quantity}{" "}
                      <span className="text-xs font-medium text-gray-400">
                        pcs
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border shadow-sm ${
                          product.stock_status === "tersedia" &&
                          product.quantity > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {product.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-150 shadow-sm bg-white transition-colors"
                          title="Edit produk"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-150 shadow-sm bg-white transition-colors"
                          title="Hapus produk"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-400 font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Parfum Baru" : "Edit Parfum"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kiri */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Nama / Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedProduct?.title}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      placeholder="Contoh: Purpose Prestige"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        name="price"
                        defaultValue={selectedProduct?.price}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Kuantitas (Stok)
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={selectedProduct?.quantity}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Personality Type
                      </label>
                      <select
                        name="personality_type"
                        defaultValue={selectedProduct?.personality_type || ""}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
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
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Status Stok
                      </label>
                      <select
                        name="stock_status"
                        defaultValue={
                          selectedProduct?.stock_status || "tersedia"
                        }
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      >
                        <option value="tersedia">Tersedia</option>
                        <option value="habis">Habis</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedProduct?.description}
                      required
                      rows={4}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none"
                      placeholder="Parfum elegan dengan notes vanilla..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Gambar Utama
                    </label>
                    <input
                      type="file"
                      name="image_1" // <--- INI HARUS SAMA PERSIS DENGAN YANG DITOLAK SERVER
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Kanan */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Tipe Parfum
                      </label>
                      <input
                        type="text"
                        name="perfume_type"
                        defaultValue={
                          selectedProduct?.perfume_type || "Eau de Parfum"
                        }
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        name="gender"
                        defaultValue={selectedProduct?.gender || "unisex"}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                      >
                        <option value="unisex">Unisex</option>
                        <option value="pria">Pria</option>
                        <option value="wanita">Wanita</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Ukuran Botol (ml)
                    </label>
                    <input
                      type="number"
                      name="bottle_size"
                      defaultValue={selectedProduct?.bottle_size || 50}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Fragrance Notes
                    </h4>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Top Note
                      </label>
                      <input
                        type="text"
                        name="top_note"
                        defaultValue={selectedProduct?.top_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                        placeholder="Bergamot, Cardamom"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Middle Note
                      </label>
                      <input
                        type="text"
                        name="middle_note"
                        defaultValue={selectedProduct?.middle_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                        placeholder="Cedarwood, Lavender"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Base Note
                      </label>
                      <input
                        type="text"
                        name="base_note"
                        defaultValue={selectedProduct?.base_note}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
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
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-sm"
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

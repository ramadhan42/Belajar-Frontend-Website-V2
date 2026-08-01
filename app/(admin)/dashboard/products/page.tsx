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
  Loader2,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import AdminModal from "@/components/admin/AdminModal";
import AdminSelect from "@/components/admin/AdminSelect";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import {
  firstValidationError,
  uploadFormDataWithProgress,
} from "@/lib/uploadWithProgress";

interface Product {
  id: number | string;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
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
  const { t, common } = useAdminI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{
    image_produk_belanja: string | null;
    image_1: string | null;
    image_2: string | null;
    image_3: string | null;
  }>({
    image_produk_belanja: null,
    image_1: null,
    image_2: null,
    image_3: null,
  });

  const baseUrl = SITE_STRINGS.base_url.url_backend;

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
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${baseUrl}/storage/${path}`;
  };

  const closeProductModal = () => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setUploadProgress(0);
  };

  const formHasImageFiles = (formData: FormData): boolean => {
    for (const value of formData.values()) {
      if (value instanceof File && value.size > 0) {
        return true;
      }
    }
    return false;
  };

  const assertProductImagesWithinLimit = (formData: FormData): boolean => {
    for (const value of formData.values()) {
      if (value instanceof File && value.size > MAX_PRODUCT_IMAGE_BYTES) {
        showNotification(
          t(
            "products",
            "image_too_large",
            "Ukuran gambar maksimal 40MB per file.",
            "Each image must be at most 40MB.",
          ),
          "error",
        );
        return false;
      }
    }
    return true;
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setIsSaving(false);
    setUploadProgress(0);
    setImagePreviews({
      image_produk_belanja: null,
      image_1: null,
      image_2: null,
      image_3: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setIsSaving(false);
    setUploadProgress(0);
    setImagePreviews({
      image_produk_belanja: getImageUrl(product.image_produk_belanja),
      image_1: getImageUrl(product.image_1),
      image_2: getImageUrl(product.image_2),
      image_3: getImageUrl(product.image_3),
    });
    setIsModalOpen(true);
  };

  const MAX_PRODUCT_IMAGE_BYTES = 40 * 1024 * 1024;

  const handleImageFileChange = (
    field: "image_produk_belanja" | "image_1" | "image_2" | "image_3",
    file: File | null,
    input?: HTMLInputElement | null,
  ) => {
    if (!file) return;

    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showNotification(
        t(
          "products",
          "image_too_large",
          "Ukuran gambar maksimal 40MB per file.",
          "Each image must be at most 40MB.",
        ),
        "error",
      );
      if (input) {
        input.value = "";
      }
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreviews((prev) => ({ ...prev, [field]: url }));
  };

  const handleDelete = async (id: number | string) => {
    setProducts(products.filter((p) => p.id !== id));
    showNotification(
      t(
        "products",
        "deleted_success",
        "Produk berhasil dihapus!",
        "Product deleted successfully!",
      ),
      "success",
    );

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
    if (isSaving || !selectedProduct?.id) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (!assertProductImagesWithinLimit(formData)) {
      return;
    }
    const hasImages = formHasImageFiles(formData);

    setIsSaving(true);
    setUploadProgress(hasImages ? 0 : 15);

    try {
      const res = await uploadFormDataWithProgress({
        url: `${baseUrl}/api/products/${selectedProduct.id}`,
        method: "POST",
        formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
        onProgress: (percent) => {
          setUploadProgress(hasImages ? percent : Math.max(15, percent));
        },
      });

      if (!res.ok) {
        throw new Error(
          firstValidationError(res.json) || "Gagal memperbarui data",
        );
      }

      setUploadProgress(100);
      showNotification(
        t(
          "products",
          "updated_success",
          "Produk berhasil diperbarui!",
          "Product updated successfully!",
        ),
        "success",
      );
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : t(
              "products",
              "update_error",
              "Terjadi kesalahan saat mengupdate produk.",
              "An error occurred while updating the product.",
            ),
        "error",
      );
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }
    if (modalMode === "edit") {
      await handleUpdate(e);
    } else {
      await handleAdd(e);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("auth_token");
    if (!assertProductImagesWithinLimit(formData)) {
      return;
    }
    const hasImages = formHasImageFiles(formData);

    setIsSaving(true);
    setUploadProgress(hasImages ? 0 : 15);

    try {
      const res = await uploadFormDataWithProgress({
        url: `${baseUrl}/api/products`,
        method: "POST",
        formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        onProgress: (percent) => {
          setUploadProgress(hasImages ? percent : Math.max(15, percent));
        },
      });

      if (!res.ok) {
        console.error("Error Detail:", res.json);
        throw new Error(
          firstValidationError(res.json) || "Gagal menyimpan produk",
        );
      }

      setUploadProgress(100);
      showNotification(
        t(
          "products",
          "added_success",
          "Produk baru berhasil ditambahkan!",
          "New product added successfully!",
        ),
        "success",
      );
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showNotification(
        t(
          "products",
          "save_error_prefix",
          "Gagal menyimpan data: ",
          "Failed to save data: ",
        ) + (error instanceof Error ? error.message : "Periksa koneksi Anda"),
        "error",
      );
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
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

      <AdminModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        zIndexClass="z-[60]"
        panelClassName="max-w-sm"
      >
        <div className="bg-white rounded-2xl p-6 w-full shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-gray-900">
            {t(
              "products",
              "confirm_delete_title",
              "Konfirmasi Hapus",
              "Confirm Delete",
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            {t(
              "products",
              "confirm_delete_desc",
              "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan.",
              "Are you sure you want to delete this product? This action cannot be undone.",
            )}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {common.cancel}
            </button>
            <button
              onClick={() => {
                if (deleteId) handleDelete(deleteId);
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              {common.yes_delete}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("products", "title", "Manajemen Produk", "Product Management")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t(
              "products",
              "subtitle",
              "Kelola inventaris, harga, notes, dan ketersediaan parfum Anda.",
              "Manage inventory, pricing, notes, and availability of your perfumes.",
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]"
        >
          <Plus size={18} />
          {t("products", "add", "Tambah Produk", "Add Product")}
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
              placeholder={t(
                "products",
                "search_placeholder",
                "Cari nama parfum atau tipe kepribadian...",
                "Search perfume name or personality type...",
              )}
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
                  {common.product}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("products", "type_size", "Tipe / Ukuran", "Type / Size")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {common.price}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("products", "stock", "Stok", "Stock")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {common.status}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {common.actions}
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
                          {product.image_1 ? (
                            <img
                              src={getImageUrl(product.image_1)!}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.title ||
                              t("products", "no_name", "Tanpa Nama", "No Name")}
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
                          product.stock_status === "habis" ||
                          product.quantity <= 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : product.stock_status === "minim" ||
                                product.quantity <= 10
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
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
                          title={common.edit}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-150 shadow-sm bg-white transition-colors"
                          title={common.delete}
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
                    {t(
                      "products",
                      "empty",
                      "Tidak ada produk yang ditemukan.",
                      "No products found.",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRUD (Add / Edit) */}
      <AdminModal
        open={isModalOpen}
        onClose={closeProductModal}
        closeOnBackdrop={!isSaving}
        panelClassName="max-w-3xl"
      >
        <div className="bg-white rounded-2xl shadow-xl w-full h-[80vh] max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 relative">
            {isSaving && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[1px] flex items-center justify-center p-6">
                <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-900 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {uploadProgress >= 100
                          ? t(
                              "products",
                              "upload_finishing",
                              "Menyimpan perubahan…",
                              "Saving changes…",
                            )
                          : t(
                              "products",
                              "upload_in_progress",
                              "Mengunggah gambar & menyimpan…",
                              "Uploading images & saving…",
                            )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t(
                          "products",
                          "upload_please_wait",
                          "Jangan tutup jendela ini sampai selesai.",
                          "Please keep this window open until finished.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-[width] duration-150 ease-out"
                      style={{ width: `${Math.max(2, uploadProgress)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-sm font-semibold tabular-nums text-gray-900">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
            )}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "add"
                  ? t("products", "modal_add", "Tambah Parfum Baru", "Add New Perfume")
                  : t("products", "modal_edit", "Edit Parfum", "Edit Perfume")}
              </h3>
              <button
                type="button"
                onClick={closeProductModal}
                disabled={isSaving}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kiri */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Nama / Title (ID)
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

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Title (EN)
                      </label>
                      <input
                        type="text"
                        name="title_en"
                        defaultValue={selectedProduct?.title_en || ""}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                        placeholder="e.g. Purpose Prestige"
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
                        <AdminSelect
                          key={`personality-${selectedProduct?.id ?? "new"}-${modalMode}`}
                          name="personality_type"
                          defaultValue={selectedProduct?.personality_type || ""}
                          required
                          placeholder="Pilih Tipe"
                          options={[
                            { value: "prestige", label: "Prestige" },
                            { value: "peaceful_calm", label: "Peaceful Calm" },
                            { value: "rebel_brave", label: "Rebel Brave" },
                            { value: "sweet_shy", label: "Sweet Shy" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Status Stok
                        </label>
                        <AdminSelect
                          key={`stock-${selectedProduct?.id ?? "new"}-${modalMode}`}
                          name="stock_status"
                          defaultValue={
                            selectedProduct?.stock_status || "tersedia"
                          }
                          required
                          options={[
                            { value: "tersedia", label: "Tersedia" },
                            { value: "minim", label: "Minim" },
                            { value: "habis", label: "Habis" },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Deskripsi (ID)
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
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Description (EN)
                      </label>
                      <textarea
                        name="description_en"
                        defaultValue={selectedProduct?.description_en || ""}
                        rows={4}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none"
                        placeholder="Elegant perfume with vanilla notes..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Gambar Produk
                      </label>
                      <div className="space-y-3">
                        {(
                          [
                            [
                              "image_produk_belanja",
                              "Gambar Produk Utama",
                              true,
                            ],
                            [
                              "image_1",
                              "Image 1 — slider detail",
                              true,
                            ],
                            ["image_2", "Image 2 — slider detail", false],
                            ["image_3", "Image 3 — slider detail", false],
                          ] as const
                        ).map(([field, label, requiredOnCreate]) => (
                          <div
                            key={field}
                            className="rounded-xl border border-gray-200 bg-gray-50/60 p-3"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                {label}
                                {modalMode === "add" && requiredOnCreate
                                  ? " (wajib)"
                                  : ""}
                              </p>
                              {modalMode === "edit" &&
                                selectedProduct?.[field] &&
                                !imagePreviews[field]?.startsWith("blob:") && (
                                  <span className="text-[10px] text-emerald-600 font-medium">
                                    Ada di database
                                  </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                                {imagePreviews[field] ? (
                                  <img
                                    src={imagePreviews[field]!}
                                    alt={field}
                                    className={
                                      field === "image_produk_belanja"
                                        ? "max-h-full max-w-full h-auto w-auto object-contain"
                                        : "h-full w-full object-cover"
                                    }
                                  />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <input
                                type="file"
                                name={field}
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                required={
                                  modalMode === "add" && requiredOnCreate
                                }
                                onChange={(e) =>
                                  handleImageFileChange(
                                    field,
                                    e.target.files?.[0] ?? null,
                                    e.currentTarget,
                                  )
                                }
                                className="flex-1 text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">
                        {t(
                          "products",
                          "image_max_hint",
                          "Maksimal 40MB per gambar (JPEG, PNG, WEBP).",
                          "Max 40MB per image (JPEG, PNG, WEBP).",
                        )}
                        {modalMode === "edit"
                          ? ` ${t(
                              "products",
                              "image_keep_hint",
                              "Kosongkan file jika tidak ingin mengubah gambar yang sudah ada.",
                              "Leave a file empty to keep the current image.",
                            )}`
                          : ""}
                      </p>
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
                        <AdminSelect
                          key={`gender-${selectedProduct?.id ?? "new"}-${modalMode}`}
                          name="gender"
                          defaultValue={selectedProduct?.gender || "unisex"}
                          required
                          options={[
                            { value: "unisex", label: "Unisex" },
                            { value: "male", label: "Pria" },
                            { value: "female", label: "Wanita" },
                          ]}
                        />
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
              </div>

              <div className="shrink-0 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={closeProductModal}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 min-w-[9.5rem] px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-sm disabled:opacity-80 disabled:cursor-wait"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadProgress}%
                    </>
                  ) : modalMode === "add" ? (
                    t(
                      "products",
                      "save_product",
                      "Simpan Produk",
                      "Save Product",
                    )
                  ) : (
                    common.save_changes
                  )}
                </button>
              </div>
            </form>
          </div>
      </AdminModal>
    </div>
  );
}

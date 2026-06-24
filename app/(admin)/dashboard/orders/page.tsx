"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  Edit2,
  Package,
  Truck,
  Image as ImageIcon,
} from "lucide-react";

interface Order {
  id: string;
  total_price: string | number;
  status: string;
  metode_pembayaran: string;
  created_at: string;
  product: {
    title: string;
    image_1?: string;
  };
  user: { name: string; email: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State untuk Modal Update Status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  // 1. Tambahkan state di dalam OrdersPage
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  // 2. Fungsi helper untuk memicu modal
  const showSuccess = (message: string) => {
    setSuccessModal({ isOpen: true, message });
    setTimeout(() => setSuccessModal({ isOpen: false, message: "" }), 2500);
  };

  // Daftar opsi status yang diperbagus untuk Modal Selector
  const statusOptions = [
    {
      id: "menunggu_konfirmasi",
      label: "Menunggu Konfirmasi",
      desc: "Pesanan baru masuk dan perlu divalidasi",
      color: "border-yellow-200 bg-yellow-50/50 text-yellow-700",
      activeColor: "ring-2 ring-yellow-500 bg-yellow-50 border-yellow-500",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
    },
    {
      id: "pengemasan",
      label: "Pengemasan",
      desc: "Produk sedang disiapkan dan dibungkus",
      color: "border-blue-200 bg-blue-50/50 text-blue-700",
      activeColor: "ring-2 ring-blue-500 bg-blue-50 border-blue-500",
      icon: <Package className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "dalam_perjalanan",
      label: "Dalam Perjalanan",
      desc: "Pesanan telah diserahkan ke kurir logistik",
      color: "border-purple-200 bg-purple-50/50 text-purple-700",
      activeColor: "ring-2 ring-purple-500 bg-purple-50 border-purple-500",
      icon: <Truck className="w-5 h-5 text-purple-600" />,
    },
    {
      id: "selesai",
      label: "Selesai",
      desc: "Pesanan telah diterima oleh pelanggan dengan baik",
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
      activeColor: "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
          icon: <Clock size={12} />,
        };
      case "pengemasan":
        return {
          color: "bg-blue-50 text-blue-700 border border-blue-200",
          icon: <Package size={12} />,
        };
      case "dalam_perjalanan":
        return {
          color: "bg-purple-50 text-purple-700 border border-purple-200",
          icon: <Truck size={12} />,
        };
      case "diterima":
      case "selesai":
        return {
          color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          icon: <CheckCircle2 size={12} />,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-600 border border-gray-200",
          icon: <X size={12} />,
        };
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    const token = localStorage.getItem("auth_token");

    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      formData.append("_method", "PATCH");

      const res = await fetch(
        `${baseUrl}/api/orders/${selectedOrder.id}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login kembali.");
          window.location.href = "/login";
          return;
        }
        throw new Error("Gagal mengupdate status");
      }

      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus } : o,
        ),
      );

      setIsStatusModalOpen(false);
      showSuccess("Status pesanan berhasil diperbarui."); // <--- Panggil di sini
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Gagal mengupdate status. Periksa console.");
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/orders`);
      const data = await res.json();
      setOrders(data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [baseUrl]);

  // 3. Update fungsi handleDelete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${baseUrl}/api/admin/orders/${deleteId}`, {
        method: "DELETE",
      });
      setOrders(orders.filter((o) => o.id !== deleteId));
      setIsDeleteModalOpen(false);
      showSuccess("Pesanan berhasil dihapus dari sistem."); // <--- Panggil di sini
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

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
      {/* MODAL UPDATE STATUS */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Ubah Status Pesanan
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ID:{" "}
                  <span className="font-mono font-semibold text-gray-700">
                    {selectedOrder?.id}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {selectedOrder?.product?.image_1 ? (
                    <img
                      src={`${baseUrl}/storage/${selectedOrder.product.image_1}`}
                      alt={selectedOrder.product?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 truncate">
                    Pelanggan: {selectedOrder?.user?.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedOrder?.product?.title}
                  </p>
                </div>
              </div>

              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Pilih Status Baru
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {statusOptions.map((option) => {
                  const isSelected = newStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setNewStatus(option.id)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? option.activeColor + " shadow-sm shadow-gray-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-white shadow-sm" : "bg-gray-50 border border-gray-100"}`}
                      >
                        {option.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {option.label}
                          </p>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 shadow-sm transition-colors flex items-center gap-1.5"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* // 5. Tambahkan JSX ini di bagian bawah return (sebelum penutup div utama) */}
      {successModal.isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-white border border-emerald-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 pr-6">
            <div className="bg-emerald-100 p-2 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Berhasil!</h4>
              <p className="text-xs text-gray-500">{successModal.message}</p>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-gray-500 mt-1">
          Kelola daftar pesanan masuk dari pelanggan.
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan atau nama user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[160px]">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[280px]">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Total Harga
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
              {orders
                .filter(
                  (o) =>
                    o.id.includes(searchTerm) ||
                    o.user?.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold font-mono text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg shadow-sm">
                        #{order.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.user?.name || "No Name"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.user?.email || "No Email"}
                      </div>
                    </td>

                    {/* MERUBAH TD PRODUK DAN FLEX WRAPPER MENJADI RATA KIRI SEJAJAR */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {order.product?.image_1 ? (
                            <img
                              src={`${baseUrl}/storage/${order.product.image_1}`}
                              alt={order.product?.title || "Produk"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">
                          {order.product?.title || "Tanpa Nama"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      {formatRupiah(order.total_price)}
                    </td>

                    <td className="px-6 py-4 text-center text-left">
                      {(() => {
                        const config = getStatusConfig(order.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm border ${config.color}`}
                          >
                            {config.icon}
                            {order.status.replace("_", " ")}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setIsStatusModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-150 bg-white shadow-sm transition-colors"
                          title="Ubah status"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(order.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-150 bg-white shadow-sm transition-colors"
                          title="Hapus pesanan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Hapus Pesanan?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan dari
              sistem logistik.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
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

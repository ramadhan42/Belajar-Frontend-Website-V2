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
  ImageIcon, // Tambahkan impor ImageIcon
} from "lucide-react";

// Update interface untuk mencakup image_1
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          color: "bg-yellow-50 text-yellow-700",
          icon: <Clock size={12} />,
        };
      case "pengemasan":
        return {
          color: "bg-blue-50 text-blue-700",
          icon: <Package size={12} />,
        };
      case "dalam_perjalanan":
        return {
          color: "bg-purple-50 text-purple-700",
          icon: <Truck size={12} />,
        };
      case "diterima":
        return {
          color: "bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={12} />,
        };
      case "selesai":
        return {
          color: "bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={12} />,
        };
      default:
        return { color: "bg-gray-50 text-gray-600", icon: <X size={12} /> };
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${baseUrl}/api/admin/orders/${deleteId}`, {
        method: "DELETE",
      });
      setOrders(orders.filter((o) => o.id !== deleteId));
      setIsDeleteModalOpen(false);
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

  return (
    <div className="space-y-6">
      {/* ... Modal Update Status & Delete Modal tetap sama ... */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Ubah Status</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Pesanan: {selectedOrder?.id}
            </p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
              <option value="pengemasan">Pengemasan</option>
              <option value="dalam_perjalanan">Dalam Perjalanan</option>
              <option value="diterima">Diterima</option>
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 py-2 rounded-xl border hover:bg-gray-50 text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                Simpan
              </button>
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

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan atau nama user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
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
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    {/* Pembaruan Kolom Order ID dengan Gambar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                          {order.product?.image_1 ? (
                            <img
                              src={`${baseUrl}/storage/${order.product.image_1}`}
                              alt={order.product?.title || "Produk"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = ""; // Fallback sederhana saat gambar gagal dimuat
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {order.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.user?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.product?.title}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const config = getStatusConfig(order.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize ${config.color}`}
                          >
                            {config.icon}
                            {order.status.replace("_", " ")}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setIsStatusModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(order.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-red-600"
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
              Hapus Pesanan?
            </h3>
            <p className="text-sm text-gray-500 mt-2">Tindakan ini permanen.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl border hover:bg-gray-50 text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete()}
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
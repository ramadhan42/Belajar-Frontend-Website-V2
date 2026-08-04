"use client";

import { useRouter } from "next/navigation";
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
  Wallet, // <-- Tambahkan Wallet icon di sini
} from "lucide-react";
import { CgClose } from "react-icons/cg";
import { SITE_STRINGS } from "@/components/constans/strings";
import AdminModal from "@/components/admin/AdminModal";
import AdminAlertModal from "@/components/admin/AdminAlertModal";
import AdminTablePagination from "@/components/admin/AdminTablePagination";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import { orderGrandTotal } from "@/lib/api";
import {
  isSuccessfulPayment,
  normalizePaymentStatus,
  paymentStatusBadgeClass,
  paymentStatusLabel,
  type PaymentStatus,
} from "@/lib/paymentStatus";

interface Order {
  id: string;
  total_price: string | number;
  shipping_cost?: string | number;
  promo_discount?: string | number;
  grand_total?: string | number;
  status: string;
  metode_pembayaran: string;
  payment_status?: string;
  created_at: string;
  product: {
    title: string;
    image_1?: string;
  };
  user: { name: string; email: string };
}

export default function OrdersPage() {
  const { t, common, locale } = useAdminI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] =
    useState<PaymentStatus>("pending");

  const baseUrl = SITE_STRINGS.base_url.url_backend;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
    variant: "info" | "success" | "error";
    onCloseRedirect?: string;
  } | null>(null);

  const showSuccess = (message: string) => {
    setSuccessModal({ isOpen: true, message });
    setTimeout(() => setSuccessModal({ isOpen: false, message: "" }), 2500);
  };

  // 1. LOGIKA FILTER DAN PAGINATION
  const filteredOrders = orders.filter(
    (o) =>
      o.id.includes(searchTerm) ||
      o.user?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ---> KALKULASI TOTAL REVENUE (hanya pembayaran berhasil) <---
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    if (!isSuccessfulPayment(order.payment_status)) {
      return sum;
    }
    return sum + orderGrandTotal(order);
  }, 0);

  const paymentOptions: Array<{
    id: PaymentStatus;
    label: string;
    desc: string;
  }> = [
    {
      id: "success",
      label: t(
        "orders",
        "payment_success",
        "Pembayaran berhasil",
        "Payment successful",
      ),
      desc: t(
        "orders",
        "payment_success_desc",
        "Masuk ke total pendapatan",
        "Counts toward total revenue",
      ),
    },
    {
      id: "pending",
      label: t(
        "orders",
        "payment_pending",
        "Pembayaran pending",
        "Payment pending",
      ),
      desc: t(
        "orders",
        "payment_pending_desc",
        "Belum masuk total pendapatan",
        "Not counted in revenue yet",
      ),
    },
    {
      id: "cancelled",
      label: t(
        "orders",
        "payment_cancelled",
        "Pembayaran dibatalkan",
        "Payment cancelled",
      ),
      desc: t(
        "orders",
        "payment_cancelled_desc",
        "Tidak masuk total pendapatan",
        "Excluded from revenue",
      ),
    },
  ];

  const statusOptions = [
    {
      id: "dibatalkan",
      label: t("orders", "status_dibatalkan", "Order Dibatalkan", "Order Cancelled"),
      desc: t(
        "orders",
        "status_dibatalkan_desc",
        "Pesanan baru telah dibatalkan",
        "The order has been cancelled",
      ),
      color: "border-red-200 bg-red-50/50 text-red-700",
      activeColor: "ring-2 ring-red-500 bg-red-50 border-red-500",
      icon: <CgClose className="w-5 h-5 text-red-600" />,
    },
    {
      id: "menunggu_konfirmasi",
      label: t(
        "orders",
        "status_menunggu_konfirmasi",
        "Menunggu Konfirmasi",
        "Awaiting Confirmation",
      ),
      desc: t(
        "orders",
        "status_menunggu_konfirmasi_desc",
        "Pesanan baru masuk dan perlu divalidasi",
        "New order received and needs to be validated",
      ),
      color: "border-yellow-200 bg-yellow-50/50 text-yellow-700",
      activeColor: "ring-2 ring-yellow-500 bg-yellow-50 border-yellow-500",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
    },
    {
      id: "pengemasan",
      label: t("orders", "status_pengemasan", "Pengemasan", "Packaging"),
      desc: t(
        "orders",
        "status_pengemasan_desc",
        "Produk sedang disiapkan dan dibungkus",
        "The product is being prepared and packed",
      ),
      color: "border-blue-200 bg-blue-50/50 text-blue-700",
      activeColor: "ring-2 ring-blue-500 bg-blue-50 border-blue-500",
      icon: <Package className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "dalam_perjalanan",
      label: t(
        "orders",
        "status_dalam_perjalanan",
        "Dalam Perjalanan",
        "In Transit",
      ),
      desc: t(
        "orders",
        "status_dalam_perjalanan_desc",
        "Pesanan telah diserahkan ke kurir logistik",
        "The order has been handed over to the courier",
      ),
      color: "border-purple-200 bg-purple-50/50 text-purple-700",
      activeColor: "ring-2 ring-purple-500 bg-purple-50 border-purple-500",
      icon: <Truck className="w-5 h-5 text-purple-600" />,
    },
    {
      id: "diterima",
      label: t(
        "orders",
        "status_diterima",
        "Diterima Pelanggan",
        "Received by Customer",
      ),
      desc: t(
        "orders",
        "status_diterima_desc",
        "Pesanan telah diterima oleh pelanggan dengan baik",
        "The order has been successfully received by the customer",
      ),
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
      activeColor: "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: "selesai",
      label: t("orders", "status_selesai", "Selesai", "Completed"),
      desc: t(
        "orders",
        "status_diterima_desc",
        "Pesanan telah diterima oleh pelanggan dengan baik",
        "The order has been successfully received by the customer",
      ),
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
      activeColor: "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "dibatalkan":
        return {
          color: "bg-red-50 text-red-700 border border-red-200",
          icon: <CgClose size={12} />,
        };
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
      formData.append("payment_status", newPaymentStatus);
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
          setAlertDialog({
            title: t(
              "orders",
              "session_expired_title",
              "Sesi berakhir",
              "Session expired",
            ),
            message: t(
              "orders",
              "session_expired",
              "Sesi Anda telah berakhir. Silakan login kembali.",
              "Your session has expired. Please log in again.",
            ),
            variant: "error",
            onCloseRedirect: "/login",
          });
          return;
        }
        throw new Error("Gagal mengupdate status");
      }

      const payload = await res.json().catch(() => null);
      const updated = payload?.data as Order | undefined;

      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: updated?.status || newStatus,
                payment_status:
                  updated?.payment_status || newPaymentStatus,
              }
            : o,
        ),
      );

      setIsStatusModalOpen(false);
      showSuccess(
        t(
          "orders",
          "status_updated_success",
          "Status pesanan berhasil diperbarui.",
          "Order status updated successfully.",
        ),
      );
    } catch (error) {
      console.error("Gagal update status:", error);
      setAlertDialog({
        title: t(
          "orders",
          "status_update_error_title",
          "Update gagal",
          "Update failed",
        ),
        message: t(
          "orders",
          "status_update_error",
          "Gagal mengupdate status. Periksa console.",
          "Failed to update status. Check the console.",
        ),
        variant: "error",
      });
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
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

    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/api/orders/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== deleteId));
        setIsDeleteModalOpen(false);
        showSuccess(
          t(
            "orders",
            "deleted_success",
            "Pesanan berhasil dihapus dari sistem.",
            "Order deleted from the system successfully.",
          ),
        );
        fetchOrders();
      } else {
        const errorData = await res.json();
        console.error("Gagal menghapus:", errorData.message);
      }
    } catch (error) {
      console.error("Kesalahan koneksi:", error);
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
      <AdminAlertModal
        open={!!alertDialog}
        onClose={() => {
          const redirectTo = alertDialog?.onCloseRedirect;
          setAlertDialog(null);
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        }}
        title={alertDialog?.title || ""}
        message={alertDialog?.message || ""}
        variant={alertDialog?.variant || "info"}
        buttonLabel={common.close}
      />

      {/* Modal Update */}
      <AdminModal
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        panelClassName="max-w-md"
      >
          <div className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t(
                    "orders",
                    "change_status_title",
                    "Ubah Status Pesanan",
                    "Change Order Status",
                  )}
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
                    {t("orders", "customer_label", "Pelanggan", "Customer")}:{" "}
                    {selectedOrder?.user?.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedOrder?.product?.title}
                  </p>
                </div>
              </div>

              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                {t(
                  "orders",
                  "select_new_status",
                  "Pilih Status Baru",
                  "Select New Status",
                )}
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {statusOptions.map((option) => {
                  const isSelected = newStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setNewStatus(option.id);
                        if (option.id === "dibatalkan") {
                          setNewPaymentStatus("cancelled");
                        } else if (
                          newPaymentStatus === "pending" &&
                          [
                            "pengemasan",
                            "dalam_perjalanan",
                            "diterima",
                            "selesai",
                          ].includes(option.id)
                        ) {
                          setNewPaymentStatus("success");
                        }
                      }}
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

              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block pt-2">
                {t(
                  "orders",
                  "select_payment_status",
                  "Status Pembayaran",
                  "Payment Status",
                )}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {paymentOptions.map((option) => {
                  const isSelected = newPaymentStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setNewPaymentStatus(option.id)}
                      className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "ring-2 ring-gray-900 border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.desc}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${paymentStatusBadgeClass(option.id)}`}
                      >
                        {option.id}
                      </span>
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
                {common.cancel}
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 shadow-sm transition-colors flex items-center gap-1.5"
              >
                {common.save_changes}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* Modal Delete */}
      <AdminModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded-2xl p-6 w-full shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">
              {t("orders", "confirm_delete_title", "Hapus Pesanan?", "Delete Order?")}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {t(
                "orders",
                "confirm_delete_desc",
                "Tindakan ini bersifat permanen dan tidak dapat dibatalkan dari sistem logistik.",
                "This action is permanent and cannot be undone from the logistics system.",
              )}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
              >
                {common.cancel}
              </button>
              <button
                onClick={() => handleDelete()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                {common.yes_delete}
              </button>
            </div>
          </div>
      </AdminModal>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("orders", "title", "Pesanan", "Orders")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t(
            "orders",
            "subtitle",
            "Kelola daftar pesanan masuk dari pelanggan.",
            "Manage incoming customer orders.",
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t(
                "orders",
                "search_ph",
                "Cari ID pesanan atau nama user...",
                "Search order ID or user name...",
              )}
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
                  {t("orders", "col_order_id", "Order ID", "Order ID")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("orders", "col_customer", "Pelanggan", "Customer")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[280px]">
                  {common.product}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("orders", "col_total", "Total Harga", "Total Price")}
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
              {/* 2. GUNAKAN PAGINATED ORDERS UNTUK MAP */}
              {paginatedOrders.map((order) => (
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
                      {order.user?.name ||
                        t("orders", "no_name", "Tanpa Nama", "No Name")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {order.user?.email ||
                        t("orders", "no_email", "Tanpa Email", "No Email")}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {order.product?.image_1 ? (
                          <img
                            src={`${baseUrl}/storage/${order.product.image_1}`}
                            alt={order.product?.title || common.product}
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
                        {order.product?.title ||
                          t("orders", "no_name", "Tanpa Nama", "No Name")}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={
                          isSuccessfulPayment(order.payment_status)
                            ? "text-gray-900"
                            : "text-gray-400 line-through decoration-gray-300"
                        }
                      >
                        {formatRupiah(orderGrandTotal(order))}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${paymentStatusBadgeClass(normalizePaymentStatus(order.payment_status))}`}
                      >
                        {paymentStatusLabel(
                          normalizePaymentStatus(order.payment_status),
                          locale === "en" ? "en" : "id",
                        )}
                      </span>
                    </div>
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
                          setNewPaymentStatus(
                            normalizePaymentStatus(order.payment_status),
                          );
                          setIsStatusModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-150 bg-white shadow-sm transition-colors"
                        title={t("orders", "edit_status", "Ubah status", "Update status")}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(order.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-150 bg-white shadow-sm transition-colors"
                        title={common.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 3. FOOTER: TOTAL REVENUE & PAGINATION */}
          <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            {/* Widget Total Pendapatan */}
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t(
                    "orders",
                    "total_revenue",
                    "Total Pendapatan (berhasil)",
                    "Total Revenue (successful)",
                  )}
                </p>
                <p className="text-xl font-black text-gray-900 mt-0.5">
                  {formatRupiah(totalRevenue)}
                </p>
              </div>
            </div>

            <AdminTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemLabel={t("orders", "items", "pesanan", "orders")}
              onPageChange={setCurrentPage}
              hideWhenSinglePage={false}
              showItemCount={false}
              className="border-t-0 px-0 py-0 bg-transparent w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Modal Delete (Tetap sama) */}
      {/* ... [KODE MODAL DELETE ANDA SEBELUMNYA] ... */}
    </div>
  );
}

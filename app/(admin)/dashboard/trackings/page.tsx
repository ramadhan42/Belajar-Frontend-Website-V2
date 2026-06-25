"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Truck,
  Package,
  Clock,
  X,
  User,
  MapPin,
  Hash,
  CheckCircle2,
  Globe,
  Phone,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react";

interface TimelineItem {
  status: string;
  time: string;
  description?: string;
}

interface Tracking {
  id: number;
  order_id: string;
  tracking_number: string | null;
  status: string;
  estimated_delivery?: string;
  courier: string;
  recipient_name: string;
  recipient_phone?: string;
  recipient_address: string;
  timeline: TimelineItem[];
}

export default function TrackingsPage() {
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(
    null,
  );

  // State khusus untuk timeline agar bisa dinamis (tambah/hapus)
  const [editTimeline, setEditTimeline] = useState<TimelineItem[]>([]);

  // State untuk notifikasi
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ isOpen: true, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const COURIER_LIST = [
    "JNE",
    "JNE Express",
    "J&T",
    "J&T Express",
    "SiCepat",
    "SiCepat Ekspres",
    "TIKI",
    "Anteraja",
    "Ninja Express",
  ];

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  const fetchTrackings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/trackings`);
      const data = await res.json();
      setTrackings(data?.data || []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackings();
  }, []);

  const filteredTrackings = trackings.filter(
    (t) =>
      t.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // === FUNGSI TIMELINE ===
  const handleTimelineChange = (
    index: number,
    field: keyof TimelineItem,
    value: string,
  ) => {
    const newTimeline = [...editTimeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setEditTimeline(newTimeline);
  };

  const addTimelineItem = () => {
    setEditTimeline([...editTimeline, { status: "", time: "", description: "" }]);
  };

  const removeTimelineItem = (index: number) => {
    const newTimeline = editTimeline.filter((_, i) => i !== index);
    setEditTimeline(newTimeline);
  };

  // Helper function: mengubah format YYYY-MM-DD HH:mm:ss menjadi YYYY-MM-DDThh:mm untuk input datetime-local
  const formatTimeForInput = (timeStr?: string) => {
    if (!timeStr) return "";
    return timeStr.replace(" ", "T").substring(0, 16);
  };

  // === FUNGSI UPDATE ===
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("auth_token");

    if (!selectedTracking) return;

    const formValues = Object.fromEntries(formData.entries());

    const jsonPayload = {
      order_id: formValues.order_id as string,
      tracking_number: (formValues.tracking_number as string) || null,
      status: formValues.status as string,
      estimated_delivery: (formValues.estimated_delivery as string) || null,
      courier: formValues.courier as string,
      recipient_name: formValues.recipient_name as string,
      recipient_phone: (formValues.recipient_phone as string) || null,
      recipient_address: formValues.recipient_address as string,
      timeline: editTimeline,
    };

    try {
      const res = await fetch(
        `${baseUrl}/api/trackings/${selectedTracking.order_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonPayload),
        },
      );

      if (!res.ok) throw new Error("Gagal memperbarui data");

      setTrackings((prevTrackings) =>
        prevTrackings.map((t) =>
          t.order_id === selectedTracking.order_id
            ? ({ ...t, ...jsonPayload } as Tracking)
            : t,
        ),
      );

      setIsEditModalOpen(false);
      showNotification("Data tracking berhasil diperbarui!", "success");
    } catch (error) {
      showNotification("Gagal memperbarui data. Periksa koneksi Anda.", "error");
    }
  };

  const getStatusConfig = (status?: string) => {
    const currentStatus = status || "";
    switch (currentStatus) {
      case "Menunggu Konfirmasi":
        return {
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: <Clock size={12} />,
        };
      case "Pesanan Diproses":
      case "Pengemasan":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Package size={12} />,
        };
      case "Paket Diserahkan ke Kurir":
      case "Sedang Dikirim":
      case "Dalam Perjalanan":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Truck size={12} />,
        };
      case "Selesai":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={12} />,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-600 border-gray-200",
          icon: <X size={12} />,
        };
    }
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trackings Order</h1>
        <p className="text-gray-500 mt-1">
          Pantau dan kelola status pengiriman pesanan pelanggan.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan atau nama penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[160px]">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Penerima
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left w-[240px]">
                  Kurir / No Resi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[100px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTrackings.map((t) => {
                const statusConfig = getStatusConfig(t.status);
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold font-mono text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg shadow-sm">
                        #{t.order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {t.recipient_name}
                      </div>
                      <div
                        className="text-xs text-gray-400 mt-0.5 max-w-[280px] truncate"
                        title={t.recipient_address}
                      >
                        {t.recipient_address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                          <Globe size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 capitalize">
                            {t.courier || "-"}
                          </div>
                          <div className="text-xs font-mono text-gray-400 mt-0.5 truncate">
                            {t.tracking_number || "Resi belum diinput"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm border ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {t.status || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTracking(t);
                          setEditTimeline(t.timeline || []);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-150 bg-white shadow-sm transition-colors"
                        title="Edit data tracking"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTrackings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-sm text-gray-400 font-medium"
                  >
                    Tidak ada data tracking yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all py-10">
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Data Tracking
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update informasi dan timeline logistik pengiriman pesanan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* SECTION: INFO PENGIRIMAN */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                  Informasi Utama
                </h3>

                {/* Row 1: Order ID & No Resi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Order ID
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="order_id"
                        defaultValue={selectedTracking?.order_id}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-sm font-mono font-semibold text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Nomor Resi
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="tracking_number"
                        defaultValue={selectedTracking?.tracking_number || ""}
                        className="w-full border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                        placeholder="Contoh: RESI987654320"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Status & Kurir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Status Utama
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedTracking?.status}
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                    >
                      <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                      <option value="Pesanan Diproses">Pesanan Diproses</option>
                      <option value="Pengemasan">Pengemasan</option>
                      <option value="Sedang Dikirim">Sedang Dikirim</option>
                      <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                      <option value="Selesai">Selesai / Diterima</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase block">
                      Penyedia Kurir
                    </label>
                    <select
                      name="courier"
                      defaultValue={selectedTracking?.courier}
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                    >
                      {COURIER_LIST.map((kurir) => (
                        <option key={kurir} value={kurir}>
                          {kurir}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Tanggal Estimasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Estimasi Pengiriman
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {/* Menggunakan type="date" agar kalender muncul saat diklik */}
                    <input
                      type="date"
                      name="estimated_delivery"
                      defaultValue={
                        selectedTracking?.estimated_delivery
                          ? selectedTracking.estimated_delivery.substring(0, 10)
                          : ""
                      }
                      className="w-full border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: INFO PENERIMA */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                  Informasi Penerima
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Nama Penerima
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="recipient_name"
                        defaultValue={selectedTracking?.recipient_name}
                        className="w-full border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="Nama Lengkap Penerima"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      No. HP / Whatsapp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="recipient_phone"
                        defaultValue={selectedTracking?.recipient_phone || ""}
                        className="w-full border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Alamat Penerima
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="recipient_address"
                      defaultValue={selectedTracking?.recipient_address}
                      rows={2}
                      className="w-full border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none"
                      placeholder="Alamat Pengiriman Lengkap..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: TIMELINE PENGIRIMAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    Timeline Perjalanan
                  </h3>
                  <button
                    type="button"
                    onClick={addTimelineItem}
                    className="text-xs flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Plus size={14} /> Tambah Log
                  </button>
                </div>

                {editTimeline.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    Belum ada riwayat timeline.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {editTimeline.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl relative group"
                      >
                        <button
                          type="button"
                          onClick={() => removeTimelineItem(index)}
                          className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Log"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Status
                            </label>
                            {/* FIX UNCONTROLLED INPUT ERROR: value={item.status || ""} */}
                            <input
                              type="text"
                              value={item.status || ""}
                              onChange={(e) =>
                                handleTimelineChange(index, "status", e.target.value)
                              }
                              className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
                              placeholder="Pesanan Diproses"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Waktu
                            </label>
                            {/* MENGGUNAKAN DATETIME-LOCAL AGAR BISA PICK DATE & HOUR */}
                            <input
                              type="datetime-local"
                              value={formatTimeForInput(item.time)}
                              onChange={(e) => {
                                // Ketika user pilih tanggal dari picker, format balikan-nya ke "YYYY-MM-DD HH:mm:ss"
                                const val = e.target.value;
                                const formattedForBackend = val
                                  ? val.replace("T", " ") + ":00"
                                  : "";
                                handleTimelineChange(
                                  index,
                                  "time",
                                  formattedForBackend
                                );
                              }}
                              className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm font-mono font-medium text-gray-900 outline-none focus:border-gray-400"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Deskripsi Tambahan
                            </label>
                            {/* FIX UNCONTROLLED INPUT ERROR */}
                            <textarea
                              value={item.description || ""}
                              onChange={(e) =>
                                handleTimelineChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows={1}
                              className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-400 resize-none"
                              placeholder="Keterangan lebih detail..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end shrink-0 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 shadow-sm transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTIFIKASI MODAL */}
      {notification?.isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[60] p-4 rounded-2xl shadow-lg border flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <X size={20} />
          )}
          <p className="text-sm font-semibold">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
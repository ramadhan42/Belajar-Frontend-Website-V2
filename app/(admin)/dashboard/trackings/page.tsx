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
  
  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null);

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

  // Reset halaman ke 1 setiap kali mencari data
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // LOGIKA FILTER & PAGINATION
  const filteredTrackings = trackings.filter(
    (t) =>
      t.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredTrackings.length / itemsPerPage) || 1;
  const paginatedTrackings = filteredTrackings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        return { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock size={12} /> };
      case "Pesanan Diproses":
      case "Pengemasan":
        return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Package size={12} /> };
      case "Paket Diserahkan ke Kurir":
      case "Sedang Dikirim":
      case "Dalam Perjalanan":
        return { color: "bg-purple-50 text-purple-700 border-purple-200", icon: <Truck size={12} /> };
      case "Selesai":
        return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} /> };
      default:
        return { color: "bg-gray-50 text-gray-600 border-gray-200", icon: <X size={12} /> };
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Trackings Order</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Pantau dan kelola status pengiriman pesanan pelanggan.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan atau nama penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table Wrapper (Responsive) */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
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
              {paginatedTrackings.map((t) => {
                const statusConfig = getStatusConfig(t.status);
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold font-mono text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                        #{t.order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {t.recipient_name}
                      </div>
                      <div
                        className="text-xs text-gray-500 mt-1 max-w-[280px] truncate"
                        title={t.recipient_address}
                      >
                        {t.recipient_address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 shrink-0 shadow-sm">
                          <Globe size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 capitalize">
                            {t.courier || "-"}
                          </div>
                          <div className="text-xs font-mono font-medium text-gray-500 mt-0.5 truncate">
                            {t.tracking_number || "Resi belum diinput"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm border ${statusConfig.color}`}
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
                        className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 bg-white shadow-sm transition-all duration-200"
                        title="Edit data tracking"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Empty State */}
              {paginatedTrackings.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Package size={40} className="mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">Tidak ada data tracking yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* NAVIGASI PAGINATION */}
          {filteredTrackings.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center"
              >
                Prev
              </button>
              <div className="text-sm font-bold text-gray-700 min-w-[80px] text-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                {currentPage} <span className="text-gray-400 font-medium mx-1">/</span> {totalPages}
              </div>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit (Tetap Sama dengan sedikit penyesuaian padding) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all py-10">
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Edit Data Tracking
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Update informasi logistik pengiriman pesanan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-200/80 text-gray-400 hover:text-gray-700 transition-colors bg-white border border-gray-200 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* SECTION: INFO PENGIRIMAN */}
              <div className="space-y-4 bg-white">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Package size={16} className="text-gray-400" /> Informasi Utama
                </h3>

                {/* Row 1: Order ID & No Resi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Order ID
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="order_id"
                        defaultValue={selectedTracking?.order_id}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-mono font-bold text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Nomor Resi
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="tracking_number"
                        defaultValue={selectedTracking?.tracking_number || ""}
                        className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
                        placeholder="Contoh: RESI987654320"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Status & Kurir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Status Utama
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedTracking?.status}
                      className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                      <option value="Pesanan Diproses">Pesanan Diproses</option>
                      <option value="Pengemasan">Pengemasan</option>
                      <option value="Sedang Dikirim">Sedang Dikirim</option>
                      <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                      <option value="Selesai">Selesai / Diterima</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase block">
                      Penyedia Kurir
                    </label>
                    <select
                      name="courier"
                      defaultValue={selectedTracking?.courier}
                      className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none shadow-sm cursor-pointer"
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
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Estimasi Pengiriman
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="estimated_delivery"
                      defaultValue={
                        selectedTracking?.estimated_delivery
                          ? selectedTracking.estimated_delivery.substring(0, 10)
                          : ""
                      }
                      className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: INFO PENERIMA */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Informasi Penerima
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Nama Penerima
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="recipient_name"
                        defaultValue={selectedTracking?.recipient_name}
                        className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none shadow-sm"
                        placeholder="Nama Lengkap Penerima"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      No. HP / Whatsapp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        name="recipient_phone"
                        defaultValue={selectedTracking?.recipient_phone || ""}
                        className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none shadow-sm"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Alamat Penerima
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="recipient_address"
                      defaultValue={selectedTracking?.recipient_address}
                      rows={2}
                      className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none shadow-sm"
                      placeholder="Alamat Pengiriman Lengkap..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: TIMELINE PENGIRIMAN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Timeline Perjalanan
                  </h3>
                  <button
                    type="button"
                    onClick={addTimelineItem}
                    className="text-xs flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm"
                  >
                    <Plus size={14} /> Tambah Log
                  </button>
                </div>

                {editTimeline.length === 0 ? (
                  <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-gray-400">Belum ada riwayat timeline.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editTimeline.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50/50 border border-gray-200 p-4 rounded-2xl relative group hover:border-gray-300 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => removeTimelineItem(index)}
                          className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 bg-white shadow-sm"
                          title="Hapus Log"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                              Status
                            </label>
                            <input
                              type="text"
                              value={item.status || ""}
                              onChange={(e) =>
                                handleTimelineChange(index, "status", e.target.value)
                              }
                              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 shadow-sm"
                              placeholder="Pesanan Diproses"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                              Waktu
                            </label>
                            <input
                              type="datetime-local"
                              value={formatTimeForInput(item.time)}
                              onChange={(e) => {
                                const val = e.target.value;
                                const formattedForBackend = val ? val.replace("T", " ") + ":00" : "";
                                handleTimelineChange(index, "time", formattedForBackend);
                              }}
                              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 shadow-sm"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                              Deskripsi Tambahan
                            </label>
                            <textarea
                              value={item.description || ""}
                              onChange={(e) => handleTimelineChange(index, "description", e.target.value)}
                              rows={1}
                              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 resize-none shadow-sm"
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
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/80 flex gap-3 justify-end shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-sm font-bold text-gray-700 shadow-sm transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 shadow-sm transition-all"
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
          className={`fixed bottom-6 right-6 z-[60] p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 pr-6 ${
            notification.type === "success"
              ? "bg-white border-emerald-100 text-emerald-800"
              : "bg-white border-red-100 text-red-800"
          }`}
        >
          <div className={`p-2 rounded-full ${notification.type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
            {notification.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <X size={18} className="text-red-600" />
            )}
          </div>
          <div>
             <h4 className="text-sm font-bold text-gray-900">{notification.type === "success" ? "Berhasil!" : "Gagal!"}</h4>
             <p className="text-xs font-medium text-gray-500 mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
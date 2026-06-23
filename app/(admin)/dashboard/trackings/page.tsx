"use client";

import { useState, useEffect } from "react";
import { Search, Edit2, Truck, Package, Clock } from "lucide-react";

interface Tracking {
  id: number;
  order_id: string;
  tracking_number: string | null;
  status: string;
  courier: string;
  recipient_name: string;
  recipient_address: string;
  timeline: { status: string; time: string; description?: string }[];
}

export default function TrackingsPage() {
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(
    null,
  );

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

  // Filter tracking berdasarkan Order ID atau Nama Penerima
  const filteredTrackings = trackings.filter(
    (t) =>
      t.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(
        `${baseUrl}/api/trackings/${selectedTracking?.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Gagal update");
      fetchTrackings();
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Gagal memperbarui data.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trackings Order</h1>
        <p className="text-gray-500 mt-1">
          Pantau dan kelola status pengiriman pesanan pelanggan.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan atau nama penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-2 focus:ring-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Penerima
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Kurir
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTrackings.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t.order_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {t.recipient_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {t.courier}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 capitalize">
                      <Truck size={12} />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTracking(t);
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900">Edit Tracking</h2>
            {/* ... input-input anda tetap sama ... */}
            <input
              name="order_id"
              defaultValue={selectedTracking?.order_id}
              className="w-full border p-2 rounded-xl"
              placeholder="Order ID"
            />
            <input
              name="tracking_number"
              defaultValue={selectedTracking?.tracking_number || ""}
              className="w-full border p-2 rounded-xl"
              placeholder="No Resi"
            />
            <input
              name="status"
              defaultValue={selectedTracking?.status}
              className="w-full border p-2 rounded-xl"
              placeholder="Status"
            />
            <input
              name="courier"
              defaultValue={selectedTracking?.courier}
              className="w-full border p-2 rounded-xl"
              placeholder="Kurir"
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

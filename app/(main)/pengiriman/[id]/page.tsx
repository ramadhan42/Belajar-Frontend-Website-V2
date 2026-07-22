"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Box,
  Copy,
  Loader2,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";

import { SITE_STRINGS } from "@/components/constans/strings";

// Helper untuk memilih ikon berdasarkan status riwayat
const getIconByStatus = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("dibuat")) return Box;
  if (s.includes("dikemas")) return Package;
  if (s.includes("dikirim")) return Truck;
  if (s.includes("diterima") || s.includes("selesai")) return CheckCircle2;
  return Clock;
};

export default function LacakPaketPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        // Sesuaikan endpoint sesuai route api.php Anda
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          SITE_STRINGS.base_url.url_backend;
        const trackingBase = apiBase.replace(/\/api\/?$/, "");
        const response = await fetch(
          `${trackingBase}/api/trackings/${orderId}`,
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Pesanan tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat data pelacakan.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchTracking();
  }, [orderId]);

  const handleCopyResi = () => {
    if (data?.resi) {
      navigator.clipboard.writeText(data.resi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1172BA]" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
        <button onClick={() => router.back()} className="text-[#1172BA] font-bold">
          Kembali
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Lacak Pengiriman
        </h1>
        <p className="text-gray-500 mt-1">ID Pesanan: #{data.orderId}</p>
      </div>

      <main className="max-w-3xl mx-auto w-full p-4 space-y-6">
        {/* Card Informasi Utama */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Saat Ini</p>
              <h2 className="text-2xl font-bold text-[#1172BA] flex items-center gap-2">
                <Truck className="w-6 h-6" /> {data.currentStatus}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Estimasi Tiba</p>
              <p className="text-lg font-bold text-gray-900">{data.estimatedDelivery}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Informasi Kurir</p>
              <p className="font-bold text-gray-900 mb-1">{data.courier}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">{data.resi || "Resi belum tersedia"}</span>
                {data.resi && (
                  <button onClick={handleCopyResi} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Alamat Tujuan
              </p>
              <p className="font-bold text-gray-900 text-sm">{data.recipient.name} <span className="font-normal text-gray-500">({data.recipient.phone})</span></p>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{data.recipient.address}</p>
            </div>
          </div>
        </div>

        {/* Card Riwayat Perjalanan */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="font-bold text-gray-900 text-xl mb-8">Riwayat Perjalanan</h3>
          <div className="relative pl-4 space-y-8">
            <div className="absolute top-2 bottom-2 left-[27px] w-0.5 bg-gray-100"></div>
            {data.timeline.map((item: any, index: number) => {
              const Icon = getIconByStatus(item.status);
              const dateObj = new Date(item.time);
              const formattedDate = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
              const formattedTime = dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
              const isActive = index === 0; // Item pertama dianggap status paling baru/aktif

              return (
                <div key={index} className="flex gap-6 items-start relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${isActive ? "bg-[#1172BA] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="pt-1">
                    <h4 className={`font-bold ${isActive ? "text-[#1172BA]" : "text-gray-900"}`}>{item.status}</h4>
                    <p className="text-sm text-gray-500">{formattedDate} • {formattedTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
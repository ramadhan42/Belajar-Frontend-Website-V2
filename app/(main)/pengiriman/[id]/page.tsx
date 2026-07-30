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
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

import { SITE_STRINGS } from "@/components/constans/strings";

type TimelineItem = {
  status?: string;
  time?: string | null;
  date?: string | null;
  description?: string | null;
};

type TrackingData = {
  orderId?: string;
  resi?: string | null;
  courier?: string;
  estimatedDelivery?: string;
  estimatedDeliveryRaw?: string | null;
  currentStatus?: string;
  recipient?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  timeline?: TimelineItem[];
};

const getIconByStatus = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("dibuat")) return Box;
  if (s.includes("dikemas") || s.includes("proses") || s.includes("pengemasan"))
    return Package;
  if (s.includes("dikirim") || s.includes("perjalanan") || s.includes("kurir"))
    return Truck;
  if (s.includes("diterima") || s.includes("selesai")) return CheckCircle2;
  return Clock;
};

const parseTimelineDate = (item: TimelineItem) => {
  const raw = item.time || item.date || null;
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { valid: false as const, label: "Belum dikirim" };
  }

  const dateObj = new Date(raw);
  if (Number.isNaN(dateObj.getTime())) {
    return { valid: false as const, label: "Belum dikirim" };
  }

  return {
    valid: true as const,
    date: dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function LacakPaketPage() {
  const router = useRouter();
  const params = useParams();
  const resiParam = decodeURIComponent((params?.id as string) || "").trim();

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
      if (!resiParam) {
        setError("Nomor resi wajib diisi untuk melacak pesanan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const trackingBase = SITE_STRINGS.base_url.url_backend.replace(
          /\/api\/?$/,
          "",
        );
        const response = await fetch(
          `${trackingBase}/api/trackings/${encodeURIComponent(resiParam)}`,
        );
        const result = await response.json();

        if (result.success && result.data?.resi) {
          setData(result.data);
        } else if (result.success && !result.data?.resi) {
          setError(
            "Nomor resi belum tersedia untuk pesanan ini. Silakan cek lagi nanti.",
          );
        } else {
          setError(
            result.message ||
              "Nomor resi tidak ditemukan. Pastikan resi sudah benar.",
          );
        }
      } catch {
        setError("Gagal memuat data pelacakan. Coba beberapa saat lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [resiParam]);

  const handleCopyResi = () => {
    if (data?.resi) {
      navigator.clipboard.writeText(data.resi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#1172BA]" />
          <p className="text-sm font-medium">Memuat status pengiriman...</p>
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 max-w-md">
          {error || "Data pelacakan tidak tersedia"}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Pelacakan hanya bisa dilakukan setelah nomor resi diinput oleh admin.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push("/pengiriman")}
            className="bg-[#1172BA] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90"
          >
            Coba nomor resi lain
          </button>
          <button
            onClick={() => router.back()}
            className="text-[#1172BA] font-bold text-sm px-5 py-2.5"
          >
            Kembali
          </button>
        </div>
      </div>
    );

  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  const hasShippedTimeline = timeline.some((item) => {
    const parsed = parseTimelineDate(item);
    const status = (item.status || "").toLowerCase();
    return (
      parsed.valid ||
      status.includes("dikirim") ||
      status.includes("perjalanan") ||
      status.includes("kurir")
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-nohemi">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
        <button
          onClick={() => router.push("/pengiriman")}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Lacak Pengiriman
        </h1>
        <p className="text-gray-500 mt-1">
          No Resi:{" "}
          <span className="font-semibold text-gray-800 font-mono">
            {data.resi}
          </span>
        </p>
        {data.orderId ? (
          <p className="text-xs text-gray-400 mt-1">
            Order terkait: #{data.orderId}
          </p>
        ) : null}
      </div>

      <main className="max-w-3xl mx-auto w-full p-4 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Saat Ini</p>
              <h2 className="text-2xl font-bold text-[#1172BA] flex items-center gap-2">
                <Truck className="w-6 h-6 shrink-0" />{" "}
                {data.currentStatus || "Menunggu pengiriman"}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Estimasi Tiba</p>
              <p className="text-lg font-bold text-gray-900">
                {data.estimatedDelivery &&
                !/invalid\s*date/i.test(String(data.estimatedDelivery)) &&
                data.estimatedDelivery !== "Belum ada estimasi"
                  ? data.estimatedDelivery
                  : "Belum dikirim / belum ada estimasi"}
              </p>
            </div>
          </div>

          {!hasShippedTimeline ? (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-800">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Paket masih menunggu pengiriman</p>
                <p className="text-xs mt-0.5 opacity-90">
                  Riwayat perjalanan akan muncul setelah paket diserahkan ke kurir.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                Informasi Kurir
              </p>
              <p className="font-bold text-gray-900 mb-1">
                {data.courier || "Belum ditentukan"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium font-mono">
                  {data.resi}
                </span>
                {data.resi ? (
                  <button
                    onClick={handleCopyResi}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500"
                    title="Salin no resi"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Alamat Tujuan
              </p>
              <p className="font-bold text-gray-900 text-sm">
                {data.recipient?.name || "-"}{" "}
                {data.recipient?.phone ? (
                  <span className="font-normal text-gray-500">
                    ({data.recipient.phone})
                  </span>
                ) : null}
              </p>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {data.recipient?.address || "Alamat belum tersedia"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="font-bold text-gray-900 text-xl mb-8">
            Riwayat Perjalanan
          </h3>

          {timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Belum ada riwayat pengiriman</p>
              <p className="text-sm text-gray-500 mt-1">
                Paket belum dikirim atau timeline belum diperbarui admin.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-8">
              <div className="absolute top-2 bottom-2 left-[27px] w-0.5 bg-gray-100" />
              {timeline.map((item, index) => {
                const Icon = getIconByStatus(item.status || "");
                const parsed = parseTimelineDate(item);
                const isActive = index === 0;

                return (
                  <div
                    key={`${item.status}-${index}`}
                    className="flex gap-6 items-start relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                        isActive
                          ? "bg-[#1172BA] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="pt-1 min-w-0">
                      <h4
                        className={`font-bold ${
                          isActive ? "text-[#1172BA]" : "text-gray-900"
                        }`}
                      >
                        {item.status || "Update status"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {parsed.valid
                          ? `${parsed.date} • ${parsed.time}`
                          : parsed.label}
                      </p>
                      {item.description ? (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, CheckCircle2 } from "lucide-react";

// Import fungsi API Anda
import {
  getShoppingHistory,
  formatProductPrice,
  getProductImageUrl,
  ShoppingHistoryItem,
} from "@/lib/api";

// Import Context untuk mengubah warna Navbar & Footer Global
import { useNavbarColor } from "@/context/NavbarColorContext";

// Pemetaan warna berdasarkan tipe kepribadian (sama dengan Product Detail)
const VISUAL_BY_PERSONALITY: Record<string, { navbarColor: string }> = {
  purpose_prestige: { navbarColor: "#1172BA" },
  prestige: { navbarColor: "#1172BA" },
  peaceful_calm: { navbarColor: "#5EA14A" },
  rebel_brave: { navbarColor: "#E33D35" },
  sweet_shy: { navbarColor: "#DD74A5" },
};

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Hook Context Warna
  const { setNavbarAndFooterColor } = useNavbarColor();

  const [historyDetail, setHistoryDetail] =
    useState<ShoppingHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Data Detail History
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil semua riwayat dan cari berdasarkan ID
        const allHistory = await getShoppingHistory();
        const targetItem = allHistory.find((item) => item.id === Number(id));

        if (targetItem) {
          setHistoryDetail(targetItem);
        } else {
          setError("Pesanan tidak ditemukan di dalam riwayat belanja Anda.");
        }
      } catch (err: any) {
        console.error("Gagal memuat detail riwayat:", err);
        setError(err.message || "Gagal mengambil data riwayat belanja.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 2. Ubah Warna Navbar & Footer Global ketika data berhasil dimuat
  useEffect(() => {
    if (historyDetail?.product) {
      const personality = historyDetail.product.personality_type ?? "";
      const newColor =
        VISUAL_BY_PERSONALITY[personality]?.navbarColor || "#2B92DE"; // Fallback ke hitam

      setNavbarAndFooterColor(newColor);
    }

    // Cleanup: Kembalikan warna ke hitam (atau warna default Anda) saat user keluar dari halaman ini
    return () => {
      setNavbarAndFooterColor("#2B92DE");
    };
  }, [historyDetail, setNavbarAndFooterColor]);

  // TAMPILAN LOADING
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Memuat detail pesanan...</p>
      </div>
    );
  }

  // TAMPILAN ERROR / NOT FOUND
  if (error || !historyDetail || !historyDetail.product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 p-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Pesanan tidak ditemukan"}
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Pastikan ID pesanan Anda benar atau Anda telah masuk ke akun yang
          tepat.
        </p>
        <button
          onClick={() => router.push("/profile/history")}
          className="px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-sm"
        >
          Kembali ke Riwayat Belanja
        </button>
      </div>
    );
  }

  // --- PREPARE DATA UNTUK RENDER ---
  const personality = historyDetail.product.personality_type ?? "";
  const themeColor =
    VISUAL_BY_PERSONALITY[personality]?.navbarColor || "#000000";

  const date = historyDetail.created_at
    ? new Date(historyDetail.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const invoiceId = `INV-${historyDetail.id.toString().padStart(6, "0")}`;

  const totalPrice = historyDetail.total_price
    ? historyDetail.total_price
    : parseFloat(historyDetail.product?.price || "0") *
      (historyDetail.quantity || 1);

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Tombol Back & Header Halaman */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={() => router.push("/profile/history")}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium mb-6 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Riwayat
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Detail Pesanan
        </h1>
      </div>

      <main className="max-w-4xl mx-auto w-full p-4">
        {/* Ringkasan Status & No Invoice */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Status Pesanan</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-bold text-green-600 text-lg">Selesai</span>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-gray-500 mb-1">No. Invoice</p>
            <p className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg inline-block border border-gray-100">
              {invoiceId}
            </p>
          </div>
        </div>

        {/* Detail Kartu Informasi Produk */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-6">
              Informasi Produk
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Gambar Produk */}
              <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-xl p-3 flex-shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                {historyDetail.product?.image_produk_belanja ? (
                  <img
                    src={
                      getProductImageUrl(
                        historyDetail.product.image_produk_belanja,
                      ) ?? ""
                    }
                    alt={historyDetail.product.title}
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Teks Informasi Produk */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {historyDetail.product.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {historyDetail.product.description ||
                    "Tidak ada deskripsi produk."}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-gray-500 mb-1">Harga Satuan</p>
                    <p className="font-bold text-gray-900">
                      {formatProductPrice(historyDetail.product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Kuantitas</p>
                    <p className="font-bold text-gray-900">
                      {historyDetail.quantity || 1} Item
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Pembayaran */}
          <div className="p-6 bg-white">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              Rincian Pembayaran
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Metode Pembayaran</span>
                <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                  Transfer / E-Wallet
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tanggal Pembelian</span>
                <span className="font-medium text-gray-900">{date}</span>
              </div>

              <div className="pt-6 mt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                <div>
                  <span className="font-bold text-gray-900 text-base">
                    Total Belanja
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Sudah termasuk PPN jika ada
                  </p>
                </div>
                <span
                  className="font-extrabold text-3xl transition-colors duration-500"
                  style={{ color: themeColor }}
                >
                  {formatProductPrice(
                    (parseFloat(String(totalPrice ?? "0")) + 10000).toString(),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

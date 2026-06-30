"use client";

import { useRouter } from "next/navigation"; // Import router dari next/navigation
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Banknote, CheckCircle2, Loader2, MapPin, Phone, QrCode, Truck, User, X } from "lucide-react";
import {
  getCartItems,
  getProduct,
  getProductImageUrl,
  formatProductPrice,
  Product,
} from "@/lib/api";
import { useNavbarColor } from "@/context/NavbarColorContext";
import StatusModal from "@/components/StatusModal";
import { SITE_STRINGS } from "@/components/constans/strings";

// Tipe data untuk item checkout
interface CheckoutItemType {
  id: string | number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  personality_type: string;
}

const VISUAL_BY_PERSONALITY: Record<
  string,
  {
    navbarColor: string;
    badge: string;
    characterPath: string;
  }
> = {
  purpose_prestige: {
    navbarColor: "#1172BA",
    badge: "Optimis",
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  prestige: {
    navbarColor: "#1172BA",
    badge: "Optimis",
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  peaceful_calm: {
    navbarColor: "#5EA14A",
    badge: "Damai",
    characterPath: "/src/images/belanja/detail/peaceful-character.svg",
  },
  rebel_brave: {
    navbarColor: "#E33D35",
    badge: "Berani",
    characterPath: "/src/images/belanja/detail/rebel-character.svg",
  },
  sweet_shy: {
    navbarColor: "#DD74A5",
    badge: "Manis",
    characterPath: "/src/images/belanja/detail/sweet-character.svg",
  },
};

const VISUAL_FALLBACK = VISUAL_BY_PERSONALITY["purpose_prestige"];

// XENDIT AUTH KEY
const XENDIT_AUTH =
  "Basic eG5kX2RldmVsb3BtZW50X3RLblFjYm5aVDVzbEFKYjJqSTVVeUQ3cVQ3VWRZUHE4cUp6MmdFNjFySXo3YUEyZklSTGdiOEJ2TEZsZDo=";

function CheckoutContent() {
  const BASE_URL = SITE_STRINGS.base_url.url_backend;

  const router = useRouter(); // Inisialisasi router
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // State untuk Data Pengiriman
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    courier: "JNE",
  });

  const { setNavbarAndFooterColor } = useNavbarColor();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const [items, setItems] = useState<CheckoutItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("qris"); // "qris" atau "cash"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // STATE UNTUK QRIS XENDIT
  const [qrisData, setQrisData] = useState<{
    id: string;
    qr_string: string;
    invoice_id: string;
  } | null>(null);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);

  const ongkosKirim = 2000;

  // Tentukan visual berdasarkan item pertama yang di-checkout
  const visual = useMemo(() => {
    const firstItemType = items[0]?.personality_type;
    return VISUAL_BY_PERSONALITY[firstItemType ?? ""] ?? VISUAL_FALLBACK;
  }, [items]);

  // Set warna navbar & footer saat visual berubah
  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
    return () => setNavbarAndFooterColor("#000000");
  }, [visual.navbarColor, setNavbarAndFooterColor]);

  // Fetch Data Awal
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (type === "cart") {
          const cartData = await getCartItems();
          if (cartData.length === 0) {
            setError("Keranjang Anda kosong.");
            return;
          }

          const formattedItems = cartData.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            title: item.product?.title || "Produk",
            price: parseFloat(item.product?.price || "0"),
            quantity: item.quantity,
            image:
              getProductImageUrl(
                item.product?.image_produk_belanja || item.product?.image_1,
              ) || "/placeholder.jpg",
            personality_type: item.product?.personality_type || "prestige",
          }));
          setItems(formattedItems);
        } else if (type === "buynow" && productId) {
          const productData = await getProduct(productId);
          setItems([
            {
              id: `buy-${productData.id}`,
              product_id: productData.id,
              title: productData.title,
              price: parseFloat(productData.price || "0"),
              quantity: 1,
              image:
                getProductImageUrl(
                  productData.image_produk_belanja || productData.image_1,
                ) || "/placeholder.jpg",
              personality_type: productData.personality_type || "prestige",
            },
          ]);
        } else {
          setError("Data pesanan tidak valid.");
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat data checkout.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [type, productId]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalTagihan = subtotal + ongkosKirim;

  // Fungsi untuk memproses data internal ke Laravel backend
  const processInternalCheckout = async (customInvoiceId: string) => {
    // const token = localStorage.getItem("auth_token");

    // Pastikan token dibersihkan dari spasi ekstra atau kutip yang tidak sengaja terbawa
    const rawToken = localStorage.getItem("auth_token");
    const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;

    console.log("token : " + token);

    // 2. Jika tidak ada token, hentikan proses dan minta login
    if (!token) {
      alert("Sesi Anda telah habis. Silakan login kembali untuk melanjutkan.");
      router.push("/login"); // Arahkan ke halaman login
      return;
    }

    try {
      setIsProcessing(true);

      const formattedPaymentMethod =
        paymentMethod === "qris" ? "QRIS" : "Cash on Delivery";

      // 1. Kirim data transaksi ke OrderController
      // UBAH: Gunakan BASE_URL, jangan hardcode http://127.0.0.1:8000
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoice_id: customInvoiceId,
          items: items,
          payment_method: formattedPaymentMethod,
          total: totalTagihan,
          recipient_name: formData.name,
          recipient_phone: formData.phone,
          recipient_address: formData.address,
          courier: formData.courier,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "🔥 DETAIL ERROR LARAVEL:",
          JSON.stringify(errorData, null, 2),
        );
        throw new Error(
          errorData.error_detail ||
            errorData.message ||
            "Gagal memproses pembuatan pesanan",
        );
      }

      // 2. Simpan ke sistem Order Tracking
      // UBAH: Gunakan BASE_URL di sini juga
      await fetch(`${BASE_URL}/api/trackings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // Gunakan variabel token yang sudah dibersihkan
        },
        body: JSON.stringify({
          order_id: customInvoiceId,
          status: "Menunggu Konfirmasi",
          courier: formData.courier,
          recipient_name: formData.name,
          recipient_phone: formData.phone,
          recipient_address: formData.address,
          timeline: [
            { status: "Pesanan dibuat", date: new Date().toISOString() },
          ],
        }),
      });

      setModal({
        isOpen: true,
        title: "Berhasil!",
        message: "Pesanan Anda berhasil dibuat dan sedang diproses.",
        type: "success",
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Mohon lengkapi data pengiriman!");
      return;
    }

    const invoiceId = `INV-${Math.floor(Math.random() * 1000000)}`;

    if (paymentMethod === "qris") {
      setIsProcessing(true);
      try {
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // Masa berlaku QRIS 15 Menit

        const res = await fetch("https://api.xendit.co/qr_codes", {
          method: "POST",
          headers: {
            "api-version": "2022-07-31",
            "Content-Type": "application/json",
            Authorization: XENDIT_AUTH,
          },
          body: JSON.stringify({
            reference_id: invoiceId,
            type: "DYNAMIC",
            currency: "IDR",
            amount: totalTagihan,
            expires_at: expiresAt,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Gagal menggenerate QRIS dari sistem",
          );
        }

        // Tampilkan modal QRIS dan simpan data reference
        setQrisData({
          id: data.id,
          qr_string: data.qr_string,
          invoice_id: invoiceId,
        });
        setIsQrisModalOpen(true);
      } catch (err: any) {
        setModal({
          isOpen: true,
          title: "Gagal",
          message: err.message || "Gagal membuat QR Code",
          type: "error",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Jika COD (cash), langsung tembak ke internal checkout API Laravel
      await processInternalCheckout(invoiceId);
    }
  };

  // Polling Status QRIS Xendit
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkQrisStatus = async () => {
      if (!qrisData || !isQrisModalOpen) return;

      try {
        const res = await fetch(
          `https://api.xendit.co/qr_codes/${qrisData.id}`,
          {
            method: "GET",
            headers: {
              "api-version": "2022-07-31",
              Authorization: XENDIT_AUTH,
            },
          },
        );
        const data = await res.json();

        if (
          data.status === "INACTIVE" ||
          data.status === "COMPLETED" ||
          data.status === "SUCCEEDED"
        ) {
          clearInterval(interval);
          setIsQrisModalOpen(false);
          // Bila sukses terbayar di Xendit, simpan pesanan ke database Laravel
          await processInternalCheckout(qrisData.invoice_id);
        }
      } catch (error) {
        console.error("Gagal mengecek status QRIS:", error);
      }
    };

    if (isQrisModalOpen) {
      interval = setInterval(checkQrisStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQrisModalOpen, qrisData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-['Parkinsans']">
          Mempersiapkan pesanan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4 font-['Nohemi']">{error}</p>
        <button
          // Gunakan router.back() untuk kembali ke halaman sebelumnya
          onClick={() => router.back()}
          className="px-6 py-2 bg-black text-white rounded-xl"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <section className="bg-[#F6F6F6] w-full pt-6 pb-24 relative overflow-hidden">
      <style>{`
        @keyframes slideRightSeamless {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-slide-right-40s {
          animation: slideRightSeamless 80s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold font-['Nohemi']"
            style={{ color: visual.navbarColor }}
          >
            Penyelesaian Pesanan
          </h1>
          <div className="hidden md:block w-20 h-20">
            <Image
              src={visual.characterPath}
              alt="Character"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* KIRI: Form Pengiriman & Metode Pembayaran */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Form Informasi Pengiriman */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 md:p-8 transition-all">
              <h2
                className="text-xl font-bold font-['Nohemi'] mb-6 flex items-center gap-2"
                style={{ color: visual.navbarColor }}
              >
                <MapPin className="w-5 h-5" />
                Informasi Pengiriman
              </h2>

              <div className="space-y-5 font-['Parkinsans']">
                {/* Grid untuk Nama dan Nomor HP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nama Penerima"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 outline-none transition-all focus:bg-white focus:shadow-sm"
                      style={{
                        ...(formData.name ? { borderColor: visual.navbarColor } : {}),
                      }}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Nomor HP"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 outline-none transition-all focus:bg-white focus:shadow-sm"
                      style={{
                        ...(formData.phone ? { borderColor: visual.navbarColor } : {}),
                      }}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <textarea
                    placeholder="Alamat Lengkap"
                    rows={3}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 outline-none transition-all focus:bg-white focus:shadow-sm resize-none"
                    style={{
                      ...(formData.address ? { borderColor: visual.navbarColor } : {}),
                    }}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Truck className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 outline-none transition-all focus:bg-white focus:shadow-sm appearance-none cursor-pointer"
                    style={{
                      ...(formData.courier ? { borderColor: visual.navbarColor } : {}),
                    }}
                    onChange={(e) =>
                      setFormData({ ...formData, courier: e.target.value })
                    }
                  >
                    <option value="JNE">JNE Express</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SiCepat">SiCepat Ekspres</option>
                    <option value="Grab">GrabExpress</option>
                  </select>
                  {/* Custom Arrow for Select */}
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Pilihan Metode Pembayaran */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 md:p-8 transition-all">
              <h2
                className="text-xl font-bold font-['Nohemi'] mb-6 flex items-center gap-2"
                style={{ color: visual.navbarColor }}
              >
                <Banknote className="w-5 h-5" />
                Metode Pembayaran
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Parkinsans']">
                {[
                  { id: "qris", title: "QRIS", desc: "Scan via M-Banking / E-Wallet", icon: QrCode },
                  { id: "cash", title: "Cash on Delivery", desc: "Bayar saat barang sampai", icon: Banknote }
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Icon = m.icon;
                  
                  return (
                    <label
                      key={m.id}
                      className={`relative border-2 rounded-2xl p-5 cursor-pointer flex flex-col gap-2 transition-all duration-300 overflow-hidden ${
                        isSelected 
                          ? "shadow-sm transform scale-[1.02]" 
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      }`}
                      style={{
                        borderColor: isSelected ? visual.navbarColor : "",
                        backgroundColor: isSelected ? `${visual.navbarColor}08` : "", // Efek transparan 8% (glass/tinted)
                      }}
                    >
                      {/* Checkmark Indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 className="w-5 h-5" style={{ color: visual.navbarColor }} />
                        </div>
                      )}
                      
                      <input
                        type="radio"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(m.id)}
                      />
                      
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors"
                        style={{ 
                          backgroundColor: isSelected ? visual.navbarColor : "#F3F4F6",
                          color: isSelected ? "#FFF" : "#9CA3AF"
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <span
                          className="block font-bold text-base mb-0.5"
                          style={{
                            color: isSelected ? visual.navbarColor : "#374151",
                          }}
                        >
                          {m.title}
                        </span>
                        <span className="text-sm text-gray-500 block leading-tight">
                          {m.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* KANAN: Ringkasan Pesanan */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[24px] p-6 shadow-md border border-gray-100 sticky top-24">
              <h2
                className="text-xl font-bold font-['Nohemi'] mb-6"
                style={{ color: visual.navbarColor }}
              >
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0"
                      style={{ backgroundColor: visual.navbarColor + "10" }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 font-['Nohemi']">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-['Parkinsans']">
                        {item.quantity} x {formatProductPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm font-['Parkinsans'] border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatProductPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Ongkos Kirim</span>
                  <span>{formatProductPrice(ongkosKirim)}</span>
                </div>
                <div
                  className="flex justify-between text-xl font-bold pt-2 font-['Nohemi']"
                  style={{ color: visual.navbarColor }}
                >
                  <span>Total</span>
                  <span>{formatProductPrice(totalTagihan)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full text-white px-6 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-lg disabled:bg-gray-300 flex items-center justify-center gap-2"
                style={{ backgroundColor: visual.navbarColor }}
              >
                {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                {isProcessing ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER DEKORASI LINGKARAN */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none z-0">
        <div className="flex w-max gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="w-[46px] h-[46px] rounded-full flex-shrink-0"
              style={{ backgroundColor: visual.navbarColor }}
            />
          ))}
        </div>
      </div>

      {/* MODAL QRIS MODAL */}
      {isQrisModalOpen && qrisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-xl transform transition-all text-center">
            <button
              onClick={() => setIsQrisModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3
              className="text-xl font-bold font-['Nohemi'] mb-2"
              style={{ color: visual.navbarColor }}
            >
              Selesaikan Pembayaran
            </h3>
            <p className="text-sm text-gray-500 font-['Parkinsans'] mb-6">
              Scan QR Code ini menggunakan aplikasi e-wallet atau m-banking
              Anda.
            </p>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  qrisData.qr_string,
                )}`}
                alt="QRIS Payment"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 text-blue-800 text-sm font-['Parkinsans'] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Menunggu pembayaran...
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUS */}
      <StatusModal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
          // Gunakan router.push untuk navigasi SPA (Single Page Application)
          if (modal.type === "success") {
            router.push("/profile/history");
          }
        }}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        themeColor={visual.navbarColor}
      />
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

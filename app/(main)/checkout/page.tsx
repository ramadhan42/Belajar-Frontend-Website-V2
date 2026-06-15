"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  getCartItems,
  getProduct,
  getProductImageUrl,
  formatProductPrice,
  Product,
} from "@/lib/api";
import { useNavbarColor } from "@/context/NavbarColorContext";
import StatusModal from "@/components/StatusModal";

// Tipe data untuk item checkout
interface CheckoutItemType {
  id: string | number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  personality_type: string; // Tambahkan ini agar bisa menentukan warna
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

function CheckoutContent() {
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
  const { setNavbarAndFooterColor } = useNavbarColor();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const [items, setItems] = useState<CheckoutItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const ongkosKirim = 10000;

  // 1. Tentukan visual berdasarkan item pertama yang di-checkout
  const visual = useMemo(() => {
    const firstItemType = items[0]?.personality_type;
    return VISUAL_BY_PERSONALITY[firstItemType ?? ""] ?? VISUAL_FALLBACK;
  }, [items]);

  // 2. Set warna navbar & footer saat visual berubah
  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
    // Cleanup saat meninggalkan halaman (opsional: kembalikan ke warna default)
    return () => setNavbarAndFooterColor("#000000");
  }, [visual.navbarColor, setNavbarAndFooterColor]);

  // 3. Fetch Data
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

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          items: items,
          payment_method: paymentMethod,
          total: totalTagihan,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Gagal memproses pembayaran");

      // Tampilkan modal sukses
      setModal({
        isOpen: true,
        title: "Berhasil!",
        message: "Pembayaran Anda telah kami terima.",
        type: "success",
      });
    } catch (err: any) {
      // Tampilkan modal error
      setModal({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-black text-white rounded-xl"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <section className="bg-[#F6F6F6] w-full pt-6 pb-24 relative overflow-hidden">
      {/* Animasi Lingkaran Bawah (Sama dengan ProductDetailSection) */}
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
          {/* Karakter SVG */}
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
          {/* KIRI: Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8">
              <h2
                className="text-xl font-bold font-['Nohemi'] mb-6"
                style={{ color: visual.navbarColor }}
              >
                Informasi Pengiriman
              </h2>
              <div className="space-y-4 font-['Parkinsans']">
                <input
                  type="text"
                  placeholder="Nama Penerima"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 outline-none transition-all"
                  style={{ "--tw-ring-color": visual.navbarColor } as any}
                />
                <textarea
                  placeholder="Alamat Lengkap"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 outline-none resize-none transition-all"
                  style={{ "--tw-ring-color": visual.navbarColor } as any}
                />
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8">
              <h2
                className="text-xl font-bold font-['Nohemi'] mb-6"
                style={{ color: visual.navbarColor }}
              >
                Metode Pembayaran
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Parkinsans']">
                {["qris", "cash"].map((m) => (
                  <label
                    key={m}
                    className={`border-2 rounded-2xl p-4 cursor-pointer flex flex-col items-center gap-1 transition-all ${paymentMethod === m ? "bg-gray-50" : "border-gray-100"}`}
                    style={{
                      borderColor:
                        paymentMethod === m ? visual.navbarColor : "",
                    }}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={paymentMethod === m}
                      onChange={() => setPaymentMethod(m)}
                    />
                    <span
                      className="font-bold uppercase"
                      style={{
                        color:
                          paymentMethod === m ? visual.navbarColor : "#333",
                      }}
                    >
                      {m === "qris" ? "QRIS" : "Cash on Delivery"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {m === "qris"
                        ? "Gopay, OVO, Dana, LinkAja"
                        : "Bayar saat barang sampai"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* KANAN: Ringkasan */}
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
                className="w-full text-white px-6 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-lg disabled:bg-gray-300"
                style={{ backgroundColor: visual.navbarColor }}
              >
                {isProcessing ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Lingkaran (Sama dengan ProductDetailSection) */}
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

      <StatusModal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
          if (modal.type === "success")
            window.location.href = "/profile/history";
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
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getCartItems,
  getProduct,
  getProductImageUrl,
  formatProductPrice,
} from "@/lib/api"; // Sesuaikan path ini

// Tipe data seragam agar mudah di-render di tabel ringkasan
interface CheckoutItemType {
  id: string | number;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'cart' atau 'buynow'
  const productId = searchParams.get("productId");

  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [items, setItems] = useState<CheckoutItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ongkosKirim = 20000; // Statis untuk sementara

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // 1. Panggil API Checkout (Pastikan Anda sudah menambahkannya di api.ts)
      // Jika API belum ada, Anda bisa mengirim payload ke endpoint POST /api/checkout
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          items: items, // Mengirim data produk yang sedang di-checkout
          payment_method: paymentMethod,
          total: totalTagihan,
        }),
      });

      if (!res.ok) throw new Error("Gagal memproses pembayaran");

      // 2. Redirect ke halaman riwayat atau sukses
      alert("Pembayaran berhasil!");
      window.location.href = "/profile/history";
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (type === "cart") {
          // ALUR 1: Bawa data dari Keranjang
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
          }));
          setItems(formattedItems);
        } else if (type === "buynow" && productId) {
          // ALUR 2: Beli Langsung 1 Produk
          const productData = await getProduct(productId);

          setItems([
            {
              id: `buy-${productData.id}`,
              product_id: productData.id,
              title: productData.title,
              price: parseFloat(productData.price || "0"),
              quantity: 1, // Beli langsung default qty 1
              image:
                getProductImageUrl(
                  productData.image_produk_belanja || productData.image_1,
                ) || "/placeholder.jpg",
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

  // Kalkulasi Total
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalTagihan = subtotal + ongkosKirim;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-gray-500">Mempersiapkan halaman checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form Pengiriman & Pembayaran */}
      <div className="md:col-span-2 space-y-6">
        {/* Section Alamat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Pengiriman</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nama Penerima"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
            />
            <textarea
              placeholder="Alamat Lengkap Pengiriman"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>
        </div>

        {/* Section Metode Pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === "qris" ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200"}`}
            >
              <input
                type="radio"
                name="payment"
                value="qris"
                className="hidden"
                checked={paymentMethod === "qris"}
                onChange={() => setPaymentMethod("qris")}
              />
              <span className="font-semibold text-gray-900">QRIS</span>
              <span className="text-xs text-gray-500">
                Gopay, OVO, Dana, dll
              </span>
            </label>

            <label
              className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === "cash" ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200"}`}
            >
              <input
                type="radio"
                name="payment"
                value="cash"
                className="hidden"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              <span className="font-semibold text-gray-900">Cash (COD)</span>
              <span className="text-xs text-gray-500">Bayar di tempat</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ringkasan Pesanan (Sidebar Checkout) */}
      <div className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-100 sticky top-8">
        <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

        {/* List Produk yang di-checkout */}
        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {item.quantity} x {formatProductPrice(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 text-sm text-gray-600 mb-6 border-t border-b border-gray-200 py-4">
          <div className="flex justify-between">
            <span>Subtotal produk</span>
            <span className="font-medium text-gray-900">
              {formatProductPrice(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ongkos Kirim</span>
            <span className="font-medium text-gray-900">
              {formatProductPrice(ongkosKirim)}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 mb-8">
          <span>Total Tagihan</span>
          <span>{formatProductPrice(totalTagihan)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400"
        >
          {isProcessing ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </div>
  );
}

// Komponen Utama yang membungkus di dalam Suspense
export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Penyelesaian Pesanan
      </h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </div>
  );
}

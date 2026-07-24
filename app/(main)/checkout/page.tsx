"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  getCartItems,
  getProduct,
  getProductImageUrl,
  formatProductPrice,
  guestCheckoutApi,
  Product,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import { useCms } from "@/context/CmsContext";
import { useTrackLocaleLoad } from "@/hooks/useTrackLocaleLoad";
import { useProductThemeTransition } from "@/hooks/useProductThemeTransition";
import StatusModal from "@/components/StatusModal";
import { SITE_STRINGS } from "@/components/constans/strings";

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
    badge: { id: string; en: string };
    characterPath: string;
  }
> = {
  purpose_prestige: {
    navbarColor: "#1172BA",
    badge: { id: "Optimis", en: "Optimistic" },
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  prestige: {
    navbarColor: "#1172BA",
    badge: { id: "Optimis", en: "Optimistic" },
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  peaceful_calm: {
    navbarColor: "#5EA14A",
    badge: { id: "Damai", en: "Peaceful" },
    characterPath: "/src/images/belanja/detail/peaceful-character.svg",
  },
  rebel_brave: {
    navbarColor: "#E33D35",
    badge: { id: "Berani", en: "Bold" },
    characterPath: "/src/images/belanja/detail/rebel-character.svg",
  },
  sweet_shy: {
    navbarColor: "#DD74A5",
    badge: { id: "Manis", en: "Sweet" },
    characterPath: "/src/images/belanja/detail/sweet-character.svg",
  },
};

const VISUAL_FALLBACK = VISUAL_BY_PERSONALITY["purpose_prestige"];

const XENDIT_AUTH =
  "Basic eG5kX2RldmVsb3BtZW50X3RLblFjYm5aVDVzbEFKYjJqSTVVeUQ3cVQ3VWRZUHE4cUp6MmdFNjFySXo3YUEyZklSTGdiOEJ2TEZsZDo=";

function CheckoutContent() {
  const BASE_URL = SITE_STRINGS.base_url.url_backend;
  const { locale } = useLocale();
  const { tUi } = useCms();

  const router = useRouter();
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    courier: "JNE",
  });

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");
  const isGuestBuyNow = type === "buynow";
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const [items, setItems] = useState<CheckoutItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isLoading, setIsLoading] = useState(true);
  useTrackLocaleLoad(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  type KurirOption = {
    id: number;
    nama: string;
    jenis: string;
    harga: number | string;
    destinasi?: string;
    estimasi_hari?: number;
    is_active?: boolean;
  };

  const [kurirs, setKurirs] = useState<KurirOption[]>([]);
  const [selectedKurirId, setSelectedKurirId] = useState<number | null>(null);

  const [qrisData, setQrisData] = useState<{
    id: string;
    qr_string: string;
    invoice_id: string;
  } | null>(null);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);

  const qtyParam = searchParams.get("qty");
  const kurirIdParam = searchParams.get("kurirId");
  const unitPriceParam = searchParams.get("unitPrice");

  const selectedKurir = useMemo(
    () => kurirs.find((k) => k.id === selectedKurirId) ?? kurirs[0] ?? null,
    [kurirs, selectedKurirId],
  );

  /** Ongkir hanya dari harga kurir API — tidak dicampur ke harga produk */
  const ongkosKirim = selectedKurir ? Number(selectedKurir.harga) || 0 : 0;

  const courierLabel = selectedKurir
    ? `${selectedKurir.nama}${selectedKurir.jenis ? ` ${selectedKurir.jenis}` : ""}`.trim()
    : formData.courier;

  const shippingEtaLabel = useMemo(() => {
    if (!selectedKurir) {
      return L(
        locale,
        "Estimasi tiba 2–4 hari kerja",
        "Estimated arrival in 2–4 business days",
      );
    }
    const days = Number(selectedKurir.estimasi_hari) || 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateStr = date.toLocaleDateString(
      locale === "en" ? "en-US" : "id-ID",
      { day: "numeric", month: "short" },
    );
    return L(
      locale,
      `Estimasi tiba ${dateStr} (±${days} hari)`,
      `Est. arrival ${dateStr} (±${days} days)`,
    );
  }, [selectedKurir, locale]);

  const visual = useMemo(() => {
    const firstItemType = items[0]?.personality_type;
    return VISUAL_BY_PERSONALITY[firstItemType ?? ""] ?? VISUAL_FALLBACK;
  }, [items]);

  const copy = useMemo(
    () => ({
      badge: L(locale, visual.badge.id, visual.badge.en),
      emptyCart: L(locale, "Keranjang Anda kosong.", "Your cart is empty."),
      productFallback: L(locale, "Produk", "Product"),
      invalidOrder: L(
        locale,
        "Data pesanan tidak valid.",
        "Invalid order data.",
      ),
      loadFailed: L(
        locale,
        "Gagal memuat data checkout.",
        "Failed to load checkout data.",
      ),
      orderCreateFailed: L(
        locale,
        "Gagal memproses pembuatan pesanan",
        "Failed to process order creation",
      ),
      successTitle: L(locale, "Berhasil!", "Success!"),
      successMessage: L(
        locale,
        "Pesanan Anda berhasil dibuat dan sedang diproses. Notifikasi dikirim ke email Anda.",
        "Your order has been created and is being processed. A notification was sent to your email.",
      ),
      failedTitle: L(locale, "Gagal", "Failed"),
      systemErrorMessage: L(
        locale,
        "Terjadi kesalahan sistem.",
        "A system error occurred.",
      ),
      qrisGenerateFailed: L(
        locale,
        "Gagal menggenerate QRIS dari sistem",
        "Failed to generate QRIS from the system",
      ),
      qrisCreateFailed: L(
        locale,
        "Gagal membuat QR Code",
        "Failed to create QR Code",
      ),
      preparingOrder: L(
        locale,
        "Mempersiapkan pesanan...",
        "Preparing your order...",
      ),
      back: L(locale, "Kembali", "Back"),
      shippingAddress: L(locale, "Alamat Pengiriman", "Shipping Address"),
      changeAddress: L(locale, "Ganti", "Change"),
      saveAddress: L(locale, "Simpan Alamat", "Save Address"),
      cancelEdit: L(locale, "Batal", "Cancel"),
      orderDetails: L(locale, "Detail Pesanan", "Order Details"),
      storeName: L(locale, "Evomi Official", "Evomi Official"),
      shippingMethod: L(locale, "Pengiriman", "Shipping"),
      addNote: L(locale, "Kasih Catatan", "Add a note"),
      notePlaceholder: L(
        locale,
        "Contoh: titip di satpam, warna, dll.",
        "E.g. leave with security, color preference, etc.",
      ),
      summaryTitle: L(
        locale,
        "Cek ringkasan transaksimu, yuk",
        "Review your transaction summary",
      ),
      totalPrice: (n: number) =>
        L(
          locale,
          `Total Harga Produk (${n} Barang)`,
          `Product Total (${n} item${n === 1 ? "" : "s"})`,
        ),
      totalShipping: L(locale, "Total Ongkos Kirim", "Total Shipping"),
      totalBill: L(locale, "Total Tagihan", "Total Bill"),
      termsHint: L(
        locale,
        "Dengan lanjut bayar, kamu menyetujui Syarat & Ketentuan Evomi.",
        "By continuing, you agree to Evomi Terms & Conditions.",
      ),
      addressIncomplete: L(
        locale,
        "Lengkapi alamat pengiriman terlebih dahulu",
        "Please complete your shipping address first",
      ),
      homeLabel: L(locale, "Rumah", "Home"),
      qty: L(locale, "Jumlah", "Qty"),
      seeAll: L(locale, "Lihat Semua", "See all"),
      emptyAddressHint: L(
        locale,
        "Belum ada alamat. Isi data penerima di bawah.",
        "No address yet. Fill in recipient details below.",
      ),
      pageTitle: tUi(
        "checkout",
        "page_title",
        L(locale, "Checkout", "Checkout"),
      ),
      shippingInfo: tUi(
        "checkout",
        "shipping_info",
        L(locale, "Informasi Pengiriman", "Shipping Information"),
      ),
      recipientName: L(locale, "Nama Penerima", "Recipient Name"),
      emailAddress: L(locale, "Email (untuk notifikasi)", "Email (for notifications)"),
      phoneNumber: L(locale, "Nomor HP", "Phone Number"),
      fullAddress: L(locale, "Alamat Lengkap", "Full Address"),
      fillShippingData: L(
        locale,
        "Mohon lengkapi data pengiriman dan email!",
        "Please complete shipping details and email!",
      ),
      invalidEmail: L(
        locale,
        "Format email tidak valid.",
        "Invalid email format.",
      ),
      loginRequiredCart: L(
        locale,
        "Silakan login untuk checkout dari keranjang.",
        "Please log in to checkout from your cart.",
      ),
      sessionExpired: L(
        locale,
        "Sesi login tidak valid. Harap login kembali.",
        "Your session expired. Please log in again.",
      ),
      paymentMethod: tUi(
        "checkout",
        "payment_method",
        L(locale, "Metode Pembayaran", "Payment Method"),
      ),
      qrisDesc: L(
        locale,
        "Scan via M-Banking / E-Wallet",
        "Scan via M-Banking / E-Wallet",
      ),
      codTitle: L(locale, "Cash on Delivery", "Cash on Delivery"),
      codDesc: L(
        locale,
        "Bayar saat barang sampai",
        "Pay when the item arrives",
      ),
      orderSummary: tUi(
        "checkout",
        "order_summary",
        L(locale, "Ringkasan Pesanan", "Order Summary"),
      ),
      subtotal: L(locale, "Subtotal", "Subtotal"),
      shippingCost: L(locale, "Ongkir", "Shipping"),
      total: L(locale, "Total", "Total"),
      processing: L(locale, "Memproses...", "Processing..."),
      payNow: tUi(
        "checkout",
        "pay_now",
        L(locale, "Bayar Sekarang", "Pay Now"),
      ),
      completePayment: L(
        locale,
        "Selesaikan Pembayaran",
        "Complete Payment",
      ),
      qrisScanHint: L(
        locale,
        "Scan QR Code ini menggunakan aplikasi e-wallet atau m-banking",
        "Scan this QR Code using your e-wallet or m-banking app",
      ),
      waitingPayment: L(
        locale,
        "Menunggu pembayaran...",
        "Waiting for payment...",
      ),
    }),
    [locale, visual, tUi],
  );

  const brand = visual.navbarColor;
  const themeReady = !isLoading;
  const isThemeLoading = useProductThemeTransition(
    items.length > 0 ? visual.navbarColor : "#1172BA",
    themeReady,
    { textFx: false },
  ).isThemeLoading;
  const isContentRevealed = !isLoading && !error && !isThemeLoading;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) return;
      const user = JSON.parse(raw);
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || user.nama_lengkap || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.alamat_lengkap || "",
      }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (selectedKurir) {
      setFormData((prev) => ({
        ...prev,
        courier: `${selectedKurir.nama}${selectedKurir.jenis ? ` ${selectedKurir.jenis}` : ""}`.trim(),
      }));
    }
  }, [selectedKurir]);

  useEffect(() => {
    const loadKurirs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/kurirs`);
        if (!res.ok) throw new Error("Failed to load couriers");
        const data = await res.json();
        const list: KurirOption[] = Array.isArray(data?.data) ? data.data : [];
        setKurirs(list);
        if (list.length === 0) return;

        const preferredId = kurirIdParam ? Number(kurirIdParam) : NaN;
        const match = list.find((k) => k.id === preferredId);
        setSelectedKurirId(match?.id ?? list[0].id);
      } catch (err) {
        console.error(err);
        setKurirs([]);
      }
    };
    loadKurirs();
  }, [BASE_URL, kurirIdParam]);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (type === "cart") {
          const rawToken = localStorage.getItem("auth_token");
          const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;
          if (!token) {
            alert(copy.loginRequiredCart);
            router.push("/login");
            return;
          }

          const cartData = await getCartItems();
          if (cartData.length === 0) {
            setError(copy.emptyCart);
            return;
          }

          const formattedItems = cartData.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            title: item.product?.title || copy.productFallback,
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
          const productData = await getProduct(productId, locale);
          const qty = Math.max(1, Number(qtyParam) || 1);

          // Harga produk murni saja (tanpa ongkir).
          // unitPrice dari belanja details = (harga katalog - promo).
          const catalogPrice = parseFloat(String(productData.price || "0")) || 0;
          const fromQuery = Number(unitPriceParam);
          const unitPrice =
            Number.isFinite(fromQuery) && fromQuery >= 0
              ? fromQuery
              : catalogPrice;

          setItems([
            {
              id: `buy-${productData.id}`,
              product_id: productData.id,
              title: productData.title,
              price: unitPrice,
              quantity: qty,
              image:
                getProductImageUrl(
                  productData.image_produk_belanja || productData.image_1,
                ) || "/placeholder.jpg",
              personality_type: productData.personality_type || "prestige",
            },
          ]);
        } else {
          setError(copy.invalidOrder);
        }
      } catch (err: any) {
        setError(err.message || copy.loadFailed);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [type, productId, qtyParam, unitPriceParam, locale, copy, router]);

  /** Subtotal produk saja — ongkir dihitung terpisah dari API kurir */
  const productSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const subtotal = productSubtotal;
  const totalTagihan = productSubtotal + ongkosKirim;

  const processInternalCheckout = async (customInvoiceId: string) => {
    const rawToken = localStorage.getItem("auth_token");
    const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;
    const isGuest = isGuestBuyNow && !token;

    if (!isGuestBuyNow && !token) {
      alert(copy.loginRequiredCart);
      router.push("/login");
      return;
    }

    if (!isGuest && !token) {
      alert(copy.sessionExpired);
      router.push("/login");
      return;
    }

    try {
      setIsProcessing(true);

      const formattedPaymentMethod =
        paymentMethod === "qris" ? "QRIS" : "Cash on Delivery";

      if (isGuest) {
        await guestCheckoutApi({
          guest_email: formData.email.trim(),
          invoice_id: customInvoiceId,
          items: items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          })),
          payment_method: formattedPaymentMethod,
          total: totalTagihan,
          recipient_name: formData.name,
          recipient_phone: formData.phone,
          recipient_address: formData.address,
          courier: courierLabel,
        });
        setCompletedOrderId(customInvoiceId);
      } else {
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
            guest_email: formData.email.trim() || undefined,
            recipient_name: formData.name,
            recipient_phone: formData.phone,
            recipient_address: formData.address,
            courier: courierLabel,
            kurir_id: selectedKurir?.id,
            shipping_cost: ongkosKirim,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error_detail ||
              errorData.message ||
              copy.orderCreateFailed,
          );
        }

        await fetch(`${BASE_URL}/api/trackings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: customInvoiceId,
            status: "Menunggu Konfirmasi",
            courier: courierLabel,
            recipient_name: formData.name,
            recipient_phone: formData.phone,
            recipient_address: formData.address,
            timeline: [
              { status: "Pesanan dibuat", time: new Date().toISOString() },
            ],
          }),
        });
        setCompletedOrderId(null);
      }

      setModal({
        isOpen: true,
        title: copy.successTitle,
        message: copy.successMessage,
        type: "success",
      });
      window.dispatchEvent(new Event("cart_updated"));
      window.dispatchEvent(new Event("history_updated"));
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: copy.failedTitle,
        message: err.message || copy.systemErrorMessage,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      alert(copy.fillShippingData);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert(copy.invalidEmail);
      return;
    }

    if (type === "cart") {
      const rawToken = localStorage.getItem("auth_token");
      const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;
      if (!token) {
        alert(copy.loginRequiredCart);
        router.push("/login");
        return;
      }
    }

    const invoiceId = `INV-${Math.floor(Math.random() * 1000000)}`;

    if (paymentMethod === "qris") {
      setIsProcessing(true);
      try {
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

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
            data.message || copy.qrisGenerateFailed,
          );
        }

        setQrisData({
          id: data.id,
          qr_string: data.qr_string,
          invoice_id: invoiceId,
        });
        setIsQrisModalOpen(true);
      } catch (err: any) {
        setModal({
          isOpen: true,
          title: copy.failedTitle,
          message: err.message || copy.qrisCreateFailed,
          type: "error",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      await processInternalCheckout(invoiceId);
    }
  };

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center bg-[#F0F3F7] min-h-[50vh]">
        <p className="text-red-500 mb-4 font-nohemi">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold"
          style={{ backgroundColor: brand }}
        >
          {copy.back}
        </button>
      </div>
    );
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const hasAddress =
    Boolean(formData.name?.trim()) &&
    Boolean(formData.phone?.trim()) &&
    Boolean(formData.address?.trim()) &&
    Boolean(formData.email?.trim());

  const updateQty = (id: string | number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = Math.max(1, item.quantity + delta);
        return { ...item, quantity: next };
      }),
    );
  };

  return (
    <section className="bg-[#F0F3F7] w-full min-h-screen pt-4 pb-16 relative">
      {!isContentRevealed && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center min-h-[70vh] bg-[#F0F3F7]"
          aria-busy="true"
        >
          <Loader2
            className="w-10 h-10 animate-spin mb-4"
            style={{ color: brand }}
          />
          <p className="text-gray-500 font-parkinsans text-sm">
            {copy.preparingOrder}
          </p>
        </div>
      )}

      {!isLoading && (
        <div
          className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 relative z-10 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]"
          style={{
            opacity: isContentRevealed ? 1 : 0,
            transform: isContentRevealed
              ? "translateY(0)"
              : "translateY(14px)",
            pointerEvents: isContentRevealed ? "auto" : "none",
          }}
        >
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h1
            className="text-2xl md:text-[28px] font-bold font-nohemi tracking-tight"
            style={{ color: brand }}
          >
            {copy.pageTitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
          {/* ===== LEFT ===== */}
          <div className="lg:col-span-8 space-y-3 md:space-y-4">
            {/* Alamat */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                {copy.shippingAddress}
              </p>

              {!isEditingAddress && hasAddress ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: brand }}
                    >
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        <span style={{ color: brand }}>{copy.homeLabel}</span>
                        <span className="text-gray-400 font-medium"> · </span>
                        {formData.name}
                      </p>
                      <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                        {formData.address}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        {formData.phone}
                        {formData.email ? ` · ${formData.email}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="shrink-0 px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    {copy.changeAddress}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 font-parkinsans">
                  {!hasAddress && !isEditingAddress ? (
                    <p className="text-sm text-gray-500 mb-2">
                      {copy.emptyAddressHint}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        placeholder={copy.recipientName}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        placeholder={copy.emailAddress}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        placeholder={copy.phoneNumber}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={selectedKurirId ?? ""}
                        className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none appearance-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setSelectedKurirId(Number(e.target.value))
                        }
                        disabled={kurirs.length === 0}
                      >
                        {kurirs.length === 0 ? (
                          <option value="">
                            {L(locale, "Memuat kurir...", "Loading couriers...")}
                          </option>
                        ) : (
                          kurirs.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.nama} {k.jenis} —{" "}
                              {formatProductPrice(Number(k.harga) || 0)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.address}
                      rows={3}
                      placeholder={copy.fullAddress}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none resize-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    {hasAddress ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {copy.cancelEdit}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasAddress) {
                          alert(copy.fillShippingData);
                          return;
                        }
                        setIsEditingAddress(false);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: brand }}
                    >
                      {copy.saveAddress}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detail Pesanan */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: brand }}
                />
                <h2 className="text-sm font-bold text-gray-900">
                  {copy.storeName}
                </h2>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 sm:gap-4 items-start"
                  >
                    <div
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${brand}12` }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: brand }}
                          >
                            {formatProductPrice(item.price)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {L(
                              locale,
                              `${item.quantity} × ${formatProductPrice(item.price)} = ${formatProductPrice(item.price * item.quantity)}`,
                              `${item.quantity} × ${formatProductPrice(item.price)} = ${formatProductPrice(item.price * item.quantity)}`,
                            )}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                          <button
                            type="button"
                            aria-label="-"
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-md text-gray-600 hover:bg-white text-sm font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="+"
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-md text-gray-600 hover:bg-white text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping box */}
              <div className="mt-4 rounded-xl border border-gray-200 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        {courierLabel || copy.shippingMethod}{" "}
                        <span className="font-semibold text-gray-700">
                          ({formatProductPrice(ongkosKirim)})
                        </span>
                      </p>
                      {paymentMethod === "cash" ? (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            color: brand,
                            borderColor: `${brand}55`,
                            backgroundColor: `${brand}10`,
                          }}
                        >
                          COD
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {shippingEtaLabel}
                    </p>
                    {selectedKurir?.destinasi ? (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {selectedKurir.destinasi}
                      </p>
                    ) : null}
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={selectedKurirId ?? ""}
                      onChange={(e) =>
                        setSelectedKurirId(Number(e.target.value))
                      }
                      className="appearance-none text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer outline-none max-w-[160px]"
                      aria-label={copy.shippingMethod}
                      disabled={kurirs.length === 0}
                    >
                      {kurirs.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama} {k.jenis}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="flex items-center justify-between gap-2 text-sm text-gray-600 mb-1.5">
                  <span className="font-medium">{copy.addNote}</span>
                  <span className="text-[11px] text-gray-400">
                    {orderNote.length}/200
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={copy.notePlaceholder}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 bg-white"
                  style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                />
              </div>
            </div>
          </div>

          {/* ===== RIGHT ===== */}
          <div className="lg:col-span-4 space-y-3 md:space-y-4 lg:sticky lg:top-24">
            {/* Payment */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  {copy.paymentMethod}
                </h2>
                <span
                  className="text-xs font-semibold"
                  style={{ color: brand }}
                >
                  {copy.seeAll}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "qris",
                    title: "QRIS",
                    desc: copy.qrisDesc,
                    icon: QrCode,
                  },
                  {
                    id: "cash",
                    title: copy.codTitle,
                    desc: copy.codDesc,
                    icon: Banknote,
                  },
                ].map((m) => {
                  const selected = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                        selected
                          ? "border-transparent"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                      style={
                        selected
                          ? {
                              borderColor: brand,
                              backgroundColor: `${brand}0A`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: selected ? brand : "#F3F4F6",
                          color: selected ? "#fff" : "#9CA3AF",
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-gray-900">
                          {m.title}
                        </span>
                        <span className="block text-[11px] text-gray-500 truncate">
                          {m.desc}
                        </span>
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-transparent" : "border-gray-300"
                        }`}
                        style={
                          selected
                            ? { backgroundColor: brand, borderColor: brand }
                            : undefined
                        }
                      >
                        {selected ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {copy.summaryTitle}
              </h2>

              <div className="space-y-2.5 text-sm font-parkinsans">
                <div className="flex justify-between text-gray-600">
                  <span>{copy.totalPrice(itemCount)}</span>
                  <span className="font-medium text-gray-800">
                    {formatProductPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{copy.totalShipping}</span>
                  <span className="font-medium text-gray-800">
                    {formatProductPrice(ongkosKirim)}
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{copy.totalBill}</span>
                  <span
                    className="text-lg font-bold font-nohemi"
                    style={{ color: brand }}
                  >
                    {formatProductPrice(totalTagihan)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="mt-4 w-full text-white px-5 py-3.5 rounded-xl font-bold text-[15px] transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                style={{
                  backgroundColor: brand,
                  boxShadow: `0 8px 20px ${brand}33`,
                }}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {isProcessing ? copy.processing : copy.payNow}
              </button>

              <p className="mt-3 text-[11px] text-gray-400 leading-relaxed text-center">
                {copy.termsHint}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {isQrisModalOpen && qrisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 relative shadow-xl text-center">
            <button
              onClick={() => setIsQrisModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3
              className="text-lg font-bold font-nohemi mb-1"
              style={{ color: brand }}
            >
              {copy.completePayment}
            </h3>
            <p className="text-xs text-gray-500 font-parkinsans mb-4">
              {copy.qrisScanHint}
            </p>

            <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 inline-block shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  qrisData.qr_string,
                )}`}
                alt="QRIS Payment"
                className="w-40 h-40 mx-auto"
              />
            </div>

            <div
              className="mt-4 p-3 rounded-xl text-xs font-parkinsans flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${brand}12`,
                color: brand,
              }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {copy.waitingPayment}
            </div>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
          if (modal.type === "success") {
            if (isGuestBuyNow) {
              router.push("/pengiriman");
            } else {
              router.push("/profile/history");
            }
          }
        }}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        themeColor={brand}
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

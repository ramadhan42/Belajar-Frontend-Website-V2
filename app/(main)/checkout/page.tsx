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
  userProfileApi,
  Product,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import { useCms } from "@/context/CmsContext";
import { resolveCmsImage } from "@/lib/cms";
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
  stock: number;
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
  const { tCheckout, checkout: checkoutCms } = useCms();

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
  /** Draft saat mengedit — baru di-commit ke formData saat klik Simpan */
  const [addressDraft, setAddressDraft] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

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
  const [isEditingAddress, setIsEditingAddress] = useState(true);
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
  const productDiscountParam = searchParams.get("productDiscount");

  /** Potongan produk tetap dari belanja details — tidak di-fetch / di-apply ulang sebagai promo */
  const [productDiscount, setProductDiscount] = useState(0);

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
      emptyCart: tCheckout(
        "messages",
        "empty_cart",
        L(locale, "Keranjang Anda kosong.", "Your cart is empty."),
      ),
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
      successTitle: tCheckout(
        "messages",
        "success_title",
        L(locale, "Berhasil!", "Success!"),
      ),
      successMessage: tCheckout(
        "messages",
        "success_message",
        L(
          locale,
          "Pesanan Anda berhasil dibuat dan sedang diproses. Notifikasi dikirim ke email Anda.",
          "Your order has been created and is being processed. A notification was sent to your email.",
        ),
      ),
      failedTitle: tCheckout(
        "messages",
        "failed_title",
        L(locale, "Gagal", "Failed"),
      ),
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
      preparingOrder: tCheckout(
        "header",
        "preparing",
        L(locale, "Mempersiapkan pesanan...", "Preparing your order..."),
      ),
      back: L(locale, "Kembali", "Back"),
      shippingAddress: tCheckout(
        "sections",
        "shipping_address",
        L(locale, "Alamat Pengiriman", "Shipping Address"),
      ),
      changeAddress: tCheckout(
        "labels",
        "change_address",
        L(locale, "Ganti", "Change"),
      ),
      saveAddress: tCheckout(
        "labels",
        "save_address",
        L(locale, "Simpan Alamat", "Save Address"),
      ),
      cancelEdit: L(locale, "Batal", "Cancel"),
      orderDetails: tCheckout(
        "sections",
        "order_details",
        L(locale, "Detail Pesanan", "Order Details"),
      ),
      storeName: tCheckout(
        "labels",
        "store_name",
        L(locale, "Evomi Official", "Evomi Official"),
      ),
      shippingMethod: tCheckout(
        "labels",
        "shipping_method",
        L(locale, "Pengiriman", "Shipping"),
      ),
      addNote: tCheckout(
        "labels",
        "add_note",
        L(locale, "Kasih Catatan", "Add a note"),
      ),
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
      totalBill: tCheckout(
        "labels",
        "total_bill",
        L(locale, "Total Tagihan", "Total Bill"),
      ),
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
      homeLabel: tCheckout(
        "labels",
        "home",
        L(locale, "Rumah", "Home"),
      ),
      qty: L(locale, "Jumlah", "Qty"),
      seeAll: L(locale, "Lihat Semua", "See all"),
      emptyAddressHint: L(
        locale,
        "Belum ada alamat. Isi data penerima di bawah.",
        "No address yet. Fill in recipient details below.",
      ),
      pageTitle: tCheckout(
        "header",
        "page_title",
        L(locale, "Checkout", "Checkout"),
      ),
      shippingInfo: tCheckout(
        "sections",
        "shipping_address",
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
      paymentMethod: tCheckout(
        "sections",
        "payment",
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
      orderSummary: tCheckout(
        "sections",
        "summary",
        L(locale, "Ringkasan Pesanan", "Order Summary"),
      ),
      subtotal: L(locale, "Subtotal", "Subtotal"),
      shippingCost: L(locale, "Ongkir", "Shipping"),
      total: L(locale, "Total", "Total"),
      processing: L(locale, "Memproses...", "Processing..."),
      payNow: tCheckout(
        "labels",
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
    [locale, visual, tCheckout],
  );

  const checkoutBanner = resolveCmsImage(checkoutCms?.images?.banner);

  const brand = visual.navbarColor;
  const themeReady = !isLoading;
  const isThemeLoading = useProductThemeTransition(
    items.length > 0 ? visual.navbarColor : "#1172BA",
    themeReady,
    { textFx: false },
  ).isThemeLoading;
  const isContentRevealed = !isLoading && !error && !isThemeLoading;

  useEffect(() => {
    let cancelled = false;

    const isCompleteAddress = (data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    }) =>
      Boolean(data.name?.trim()) &&
      Boolean(data.email?.trim()) &&
      Boolean(data.phone?.trim()) &&
      Boolean(data.address?.trim());

    const applyAddress = (next: {
      name: string;
      email: string;
      phone: string;
      address: string;
    }) => {
      if (cancelled) return;
      setFormData((prev) => ({ ...prev, ...next }));
      setAddressDraft(next);
      setIsEditingAddress(!isCompleteAddress(next));
    };

    const loadShippingAddress = async () => {
      const rawToken = localStorage.getItem("auth_token");
      const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;

      if (token) {
        try {
          const res = await userProfileApi.getProfile();
          const user = res?.data ?? res;
          if (user && !cancelled) {
            const next = {
              name: String(user.name || user.nama_lengkap || "").trim(),
              email: String(user.email || "").trim(),
              phone: String(user.phone || "").trim(),
              address: String(user.alamat_lengkap || "").trim(),
            };
            applyAddress(next);
            try {
              const raw = localStorage.getItem("auth_user");
              const prev = raw ? JSON.parse(raw) : {};
              localStorage.setItem(
                "auth_user",
                JSON.stringify({ ...prev, ...user }),
              );
            } catch {
              /* ignore */
            }
            return;
          }
        } catch {
          /* fallback ke localStorage */
        }
      }

      try {
        const raw = localStorage.getItem("auth_user");
        if (!raw || cancelled) return;
        const user = JSON.parse(raw);
        applyAddress({
          name: String(user.name || user.nama_lengkap || "").trim(),
          email: String(user.email || "").trim(),
          phone: String(user.phone || "").trim(),
          address: String(user.alamat_lengkap || "").trim(),
        });
      } catch {
        /* ignore */
      }
    };

    loadShippingAddress();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAddressEditor = () => {
    setAddressDraft({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });
    setIsEditingAddress(true);
  };

  const cancelAddressEdit = () => {
    const hasCommitted =
      Boolean(formData.name?.trim()) &&
      Boolean(formData.email?.trim()) &&
      Boolean(formData.phone?.trim()) &&
      Boolean(formData.address?.trim());
    if (!hasCommitted) return;
    setAddressDraft({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });
    setIsEditingAddress(false);
  };

  const saveAddress = async () => {
    const next = {
      name: addressDraft.name.trim(),
      email: addressDraft.email.trim(),
      phone: addressDraft.phone.trim(),
      address: addressDraft.address.trim(),
    };

    if (!next.name || !next.email || !next.phone || !next.address) {
      alert(copy.fillShippingData);
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      alert(copy.invalidEmail);
      return null;
    }

    setFormData((prev) => ({ ...prev, ...next }));
    setAddressDraft(next);
    setIsEditingAddress(false);

    const rawToken = localStorage.getItem("auth_token");
    const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;
    if (!token) return next;

    try {
      setIsSavingAddress(true);
      const data = await userProfileApi.updateProfile({
        name: next.name,
        nama_lengkap: next.name,
        email: next.email,
        phone: next.phone,
        alamat_lengkap: next.address,
      });
      const userRaw = localStorage.getItem("auth_user");
      const prev = userRaw ? JSON.parse(userRaw) : {};
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ ...prev, ...(data?.data || next) }),
      );
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      console.error("Gagal menyimpan alamat ke profil:", err);
    } finally {
      setIsSavingAddress(false);
    }

    return next;
  };
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

          const formattedItems = cartData.map((item) => {
            const stock = Math.max(0, Number(item.product?.quantity ?? 0));
            const qty = Math.max(1, Number(item.quantity) || 1);
            return {
              id: item.id,
              product_id: item.product_id,
              title: item.product?.title || copy.productFallback,
              price: parseFloat(item.product?.price || "0"),
              quantity: stock > 0 ? Math.min(qty, stock) : qty,
              stock,
              image:
                getProductImageUrl(
                  item.product?.image_produk_belanja || item.product?.image_1,
                ) || "/placeholder.jpg",
              personality_type: item.product?.personality_type || "prestige",
            };
          });
          setItems(formattedItems);
          setProductDiscount(0);
        } else if (type === "buynow" && productId) {
          const productData = await getProduct(productId, locale);
          const qty = Math.max(1, Number(qtyParam) || 1);
          const catalogPrice =
            parseFloat(String(productData.price || "0")) || 0;

          // Checkout tidak menerapkan promo. Harga item = katalog.
          // Potongan (jika ada) hanya sekali dari query belanja details — tidak dikali qty.
          const fromQuery = Number(unitPriceParam);
          const discountFromQuery = Number(productDiscountParam);
          let discount = 0;

          if (Number.isFinite(discountFromQuery) && discountFromQuery >= 0) {
            discount = discountFromQuery;
          } else if (
            Number.isFinite(fromQuery) &&
            fromQuery >= 0 &&
            fromQuery < catalogPrice
          ) {
            // Legacy link: unitPrice lama = harga setelah promo
            discount = Math.max(catalogPrice - fromQuery, 0) * qty;
          }

          setProductDiscount(discount);
          const available = Math.max(0, Number(productData.quantity ?? 0));
          const safeQty =
            available > 0 ? Math.min(qty, available) : Math.max(1, qty);
          if (available <= 0) {
            setError(
              L(locale, "Stok produk habis.", "Product is out of stock."),
            );
          }
          setItems([
            {
              id: `buy-${productData.id}`,
              product_id: productData.id,
              title: productData.title,
              price: catalogPrice,
              quantity: safeQty,
              stock: available,
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
  }, [
    type,
    productId,
    qtyParam,
    unitPriceParam,
    productDiscountParam,
    locale,
    copy,
    router,
  ]);

  /** Subtotal katalog — potongan details (jika ada) hanya dikurangi sekali, bukan per unit */
  const rawProductSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const productSubtotal = Math.max(rawProductSubtotal - productDiscount, 0);
  const subtotal = productSubtotal;
  const totalTagihan = productSubtotal + ongkosKirim;

  const processInternalCheckout = async (
    customInvoiceId: string,
    shipping?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    },
  ) => {
    const rawToken = localStorage.getItem("auth_token");
    const token = rawToken ? rawToken.replace(/['"]+/g, "").trim() : null;
    const isGuest = isGuestBuyNow && !token;
    const recipient = shipping ?? {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

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

      // Simpan harga katalog di order; ongkir & promo dikirim terpisah (sekali).
      if (isGuest) {
        await guestCheckoutApi({
          guest_email: recipient.email,
          invoice_id: customInvoiceId,
          items: items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          })),
          payment_method: formattedPaymentMethod,
          total: totalTagihan,
          shipping_cost: ongkosKirim,
          promo_discount: productDiscount,
          recipient_name: recipient.name,
          recipient_phone: recipient.phone,
          recipient_address: recipient.address,
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
            shipping_cost: ongkosKirim,
            promo_discount: productDiscount,
            guest_email: recipient.email || undefined,
            recipient_name: recipient.name,
            recipient_phone: recipient.phone,
            recipient_address: recipient.address,
            courier: courierLabel,
            kurir_id: selectedKurir?.id,
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
            recipient_name: recipient.name,
            recipient_phone: recipient.phone,
            recipient_address: recipient.address,
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
    let recipient = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    if (isEditingAddress) {
      const saved = await saveAddress();
      if (!saved) return;
      recipient = saved;
    } else if (
      !recipient.name ||
      !recipient.email ||
      !recipient.phone ||
      !recipient.address
    ) {
      alert(copy.fillShippingData);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
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
          throw new Error(data.message || copy.qrisGenerateFailed);
        }

        setFormData((prev) => ({ ...prev, ...recipient }));
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
      await processInternalCheckout(invoiceId, recipient);
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
        const max = Math.max(1, Number(item.stock) || 1);
        const next = Math.min(max, Math.max(1, item.quantity + delta));
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

        {checkoutBanner ? (
          <div className="relative w-full h-28 md:h-36 rounded-xl overflow-hidden mb-4 border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={checkoutBanner}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

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
                    onClick={openAddressEditor}
                    className="shrink-0 px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    {copy.changeAddress}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 font-parkinsans">
                  {!hasAddress ? (
                    <p className="text-sm text-gray-500 mb-2">
                      {copy.emptyAddressHint}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={addressDraft.name}
                        placeholder={copy.recipientName}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setAddressDraft((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={addressDraft.email}
                        placeholder={copy.emailAddress}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setAddressDraft((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={addressDraft.phone}
                        placeholder={copy.phoneNumber}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                        onChange={(e) =>
                          setAddressDraft((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
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
                      value={addressDraft.address}
                      rows={3}
                      placeholder={copy.fullAddress}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none resize-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: `${brand}40` }}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    {hasAddress ? (
                      <button
                        type="button"
                        onClick={cancelAddressEdit}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {copy.cancelEdit}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void saveAddress()}
                      disabled={isSavingAddress}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: brand }}
                    >
                      {isSavingAddress ? copy.processing : copy.saveAddress}
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
                {items.map((item) => {
                  const chargedUnit =
                    items.length === 1 &&
                    item.quantity > 0 &&
                    productDiscount > 0
                      ? productSubtotal / item.quantity
                      : item.price;
                  return (
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
                            {formatProductPrice(chargedUnit)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {L(
                              locale,
                              `${item.quantity} × ${formatProductPrice(chargedUnit)} = ${formatProductPrice(chargedUnit * item.quantity)}`,
                              `${item.quantity} × ${formatProductPrice(chargedUnit)} = ${formatProductPrice(chargedUnit * item.quantity)}`,
                            )}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                          <button
                            type="button"
                            aria-label="-"
                            onClick={() => updateQty(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-md text-gray-600 hover:bg-white text-sm font-bold disabled:opacity-40"
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
                            disabled={item.quantity >= Math.max(1, item.stock || 1)}
                            className="w-7 h-7 rounded-md text-gray-600 hover:bg-white text-sm font-bold disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
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

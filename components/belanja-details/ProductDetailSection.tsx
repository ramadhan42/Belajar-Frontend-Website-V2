"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useNavbarColor } from "@/context/NavbarColorContext";
import {
  getProduct,
  getProductImageUrl,
  formatProductPrice,
  addToCart,
  addToWishlist,
  Product,
} from "@/lib/api";

import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import { useTrackLocaleLoad } from "@/hooks/useTrackLocaleLoad";
import {
  MessageCircle, // Kita pakai ini untuk WhatsApp
  Minus,
  Plus,
  Heart,
  Share2,
  Clock,
  MapPin,
  Truck,
  Shield,
  CheckCircle,
  Copy,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { SITE_STRINGS } from "../constans/strings";

// Tambahkan di area interface
interface ContactReply {
  id: number;
  reply_message: string;
  replied_by: number;
  created_at: string;
  is_read_by_user?: number | boolean;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read_by_admin?: number | boolean;
  replies?: ContactReply[];
}

interface ChatBubble {
  id: string;
  type: "user" | "admin";
  text: string;
  createdAt: string;
  subject?: string;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
}

// ---------------------------------------------------------------------------
// Data visual statis
// ---------------------------------------------------------------------------

// Custom Icons untuk Sosial Media
const FacebookIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const BASE_URL = SITE_STRINGS.base_url.url_backend;

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

// Skeleton block
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block bg-gray-200 animate-pulse rounded-xl ${className ?? ""}`}
    />
  );
}

export default function ProductDetailSection({
  forcedId,
  showDivider = true,
}: {
  forcedId?: string;
  showDivider?: boolean;
}) {
  const router = useRouter();
  const params = useParams();
  const id = forcedId || (params?.id as string) || "1";
  const { locale } = useLocale();

  const { setNavbarAndFooterColor } = useNavbarColor();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useTrackLocaleLoad(isLoading);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dummy Data State for Right Column Cart Box
  const [quantity, setQuantity] = useState(1);
  const dummyStock = 968;
  const dummyPrice = 189000;

  const [hargaPromo, setHargaPromo] = useState<number>(0);

  // Cart & Wishlist state
  const [cartStatus, setCartStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [wishlistStatus, setWishlistStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "admin"; text: string }[]
  >([
    {
      sender: "admin",
      text: L(
        locale,
        "Halo! Ada yang bisa kami bantu terkait produk ini?",
        "Hi! Is there anything we can help you with about this product?",
      ),
    },
  ]);

  // State untuk menyimpan data API
  const [kurirs, setKurirs] = useState<any[]>([]);
  const [selectedKurir, setSelectedKurir] = useState<any>(null);
  const [showKurirList, setShowKurirList] = useState(false);

  // Fungsi Hitung Estimasi Tiba (Bulan format 'Jul', 'Agt', dll)
  const getEstimasiTiba = (jenis: string) => {
    if (!jenis) return "-";
    const date = new Date();
    const j = jenis.toLowerCase();

    // Jika tipe pengiriman cepat (+1 hari)
    if (
      j.includes("yes") ||
      j.includes("express") ||
      j.includes("sameday") ||
      j.includes("same day")
    ) {
      date.setDate(date.getDate() + 1);
    } else {
      // Jika reguler/ekonomi (+3 hari)
      date.setDate(date.getDate() + 3);
    }

    // Format menjadi "08 Jul"
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const diskusiBoxRef = useRef<HTMLDivElement>(null);
  const jaminanBoxRef = useRef<HTMLDivElement>(null);
  const [detailScrollHeight, setDetailScrollHeight] = useState<number | null>(
    null,
  );

  // Tinggi tengah = Diskusi Terbuka + Jaminan & Bebas Ongkir (+ gap antar box)
  useEffect(() => {
    const diskusiEl = diskusiBoxRef.current;
    const jaminanEl = jaminanBoxRef.current;
    if (!diskusiEl || !jaminanEl || typeof ResizeObserver === "undefined")
      return;

    const syncHeight = () => {
      if (window.innerWidth < 1024) {
        setDetailScrollHeight(null);
        return;
      }
      const diskusiH = diskusiEl.getBoundingClientRect().height;
      const jaminanH = jaminanEl.getBoundingClientRect().height;
      // gap-4 = 16px antara kedua box di kolom kanan
      const next = Math.round(diskusiH + jaminanH + 16);
      setDetailScrollHeight(next > 0 ? next : null);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(diskusiEl);
    observer.observe(jaminanEl);
    window.addEventListener("resize", syncHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [product, isLoading, quantity, cartMessage, wishlistMessage, locale]);

  // Dapatkan URL saat ini (Aman untuk Next.js SSR)
  const productUrl = typeof window !== "undefined" ? window.location.href : "";

  // Fungsi Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset tulisan 'Disalin' setelah 2 detik
  };

  // URL Encode untuk Social Media
  const textToShare = encodeURIComponent(
    `Cek produk keren ini: ${product?.title || L(locale, "Produk Evomi", "Evomi Product")}`,
  );
  const urlToShare = encodeURIComponent(productUrl);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${textToShare}%20${urlToShare}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`,
    twitter: `https://twitter.com/intent/tweet?url=${urlToShare}&text=${textToShare}`,
  };

  // State untuk Modal Chat
  const [showChatModal, setShowChatModal] = useState(false);

  // Fungsi Kirim Chat via API Contact
  const handleSendChat = async (text: string) => {
    if (!text || text.trim() === "") return;

    // 1. CEK LOGIN
    const userDataStr =
      typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;

    if (!userDataStr) {
      setAlertInfo({
        show: true,
        type: "error", // Menggunakan tipe error
        message: copy.loginRequiredMsg,
      });
      return;
    }

    const user = JSON.parse(userDataStr);
    const productName = product?.title || copy.productFallback;

    // 2. Siapkan Data Form
    const formData = new FormData();
    formData.append("name", user.name || "User Evomi");
    formData.append("email", user.email || "user@evomi.com");
    formData.append("subject", `Chat Produk, ${productName}`);
    formData.append("message", `${text}\n\nLink Produk: ${productUrl}`);

    // 3. Kirim Data ke API Laravel
    setIsSendingChat(true);
    try {
      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok || data.success) {
        // MODAL SUKSES
        setAlertInfo({
          show: true,
          type: "success",
          message: copy.chatSentSuccess,
        });
        setShowChatModal(false);
        setCustomMessage("");
      } else {
        // MODAL ERROR (RESPON API)
        setAlertInfo({
          show: true,
          type: "error",
          message: data.message || copy.chatSendFailed,
        });
      }
    } catch (error) {
      console.error("Error sending chat:", error);
      // MODAL ERROR (SISTEM)
      setAlertInfo({
        show: true,
        type: "error",
        message: copy.chatSystemError,
      });
    } finally {
      setIsSendingChat(false);
    }
  };

  const [customMessage, setCustomMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // State untuk Custom Alert
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success";
  }>({
    show: false,
    message: "",
    type: "error",
  });
  

  useEffect(() => {
    fetch(`${BASE_URL}/api/kurirs`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data kurir");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setKurirs(data.data);
          setSelectedKurir(data.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/promos`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data promo");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setHargaPromo(Number(data.data[0].harga_promo));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Pastikan product.price diubah menjadi Number agar bisa dikurangi
  const productPrice = product?.price ? Number(product.price) : 0;

  // Rumus: (Harga Produk - Harga Promo) * Kuantitas
  // Menggunakan Math.max agar hasil tidak minus jika harga promo lebih besar dari harga produk
  const dummySubtotalPrice = Math.max(
    (productPrice - hargaPromo) * quantity,
    0,
  );

  useEffect(() => {
    setIsLoading(true);
    setCurrentIndex(0);
    getProduct(id, locale)
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id, locale]);

  const visual =
    VISUAL_BY_PERSONALITY[product?.personality_type ?? ""] ?? VISUAL_FALLBACK;

  const copy = useMemo(
    () => ({
      badge: L(locale, visual.badge.id, visual.badge.en),
      productFallback: L(locale, "Produk", "Product"),
      productEvomiFallback: L(locale, "Produk Evomi", "Evomi Product"),
      gambar: L(locale, "gambar", "image"),
      descriptionFallback: L(
        locale,
        "Menghadirkan aroma yang merefleksikan ketenangan, kepercayaan diri, dan kejelasan tujuan.",
        "Presenting a scent that reflects calmness, confidence, and clarity of purpose.",
      ),
      detailProduk: L(locale, "Detail Produk", "Product Details"),
      harga: L(locale, "Harga", "Price"),
      kondisi: L(locale, "Kondisi", "Condition"),
      kondisiValue: L(locale, "Baru", "New"),
      beratSatuan: L(locale, "Berat Satuan", "Unit Weight"),
      kategori: L(locale, "Kategori", "Category"),
      minBeli: L(locale, "Min. Beli", "Min. Order"),
      minBeliValue: L(locale, "1 Buah", "1 Piece"),
      etalase: L(locale, "Etalase", "Showcase"),
      etalaseValue: L(locale, "Semua Etalase", "All Showcases"),
      disclaimerTitle: L(
        locale,
        "Disclaimer untuk Ketentuan COMPLAIN",
        "Disclaimer for Complaint Terms",
      ),
      loadingPolicy: L(
        locale,
        "Memuat kebijakan toko...",
        "Loading store policy...",
      ),
      pengiriman: L(locale, "Pengiriman", "Shipping"),
      dikirimDari: L(locale, "Dikirim dari", "Shipped from"),
      loadingLokasi: L(locale, "Memuat lokasi...", "Loading location..."),
      ongkirMulai: L(locale, "Ongkir Mulai", "Shipping cost from"),
      bisaCod: L(
        locale,
        "Bisa COD, estimasi tiba",
        "COD available, arrives",
      ),
      lihatKurirLainnya: L(
        locale,
        "Lihat Kurir Lainnya",
        "See Other Couriers",
      ),
      diskusiTerbuka: L(locale, "Diskusi Terbuka", "Open Discussion"),
      aturJumlah: L(
        locale,
        "Atur jumlah dan catatan",
        "Set quantity and notes",
      ),
      stok: L(locale, "Stok:", "Stock:"),
      subtotal: L(locale, "Subtotal", "Subtotal"),
      beliLangsung: L(locale, "Beli Langsung", "Buy Now"),
      memproses: L(locale, "Memproses...", "Processing..."),
      tambahKeranjang: L(locale, "+ Keranjang", "+ Cart"),
      chat: L(locale, "Chat", "Chat"),
      wishlist: L(locale, "Wishlist", "Wishlist"),
      share: L(locale, "Share", "Share"),
      promoBerlaku: L(
        locale,
        "Promo berlaku hari ini! Hemat hingga",
        "Promo valid today! Save up to",
      ),
      jaminanProduk: L(locale, "Jaminan Produk", "Product Guarantee"),
      uangKembali: L(
        locale,
        "Uang kembali bila produk tidak sesuai",
        "Money back if the product doesn't match",
      ),
      bebasOngkir: L(locale, "Bebas Ongkir", "Free Shipping"),
      syaratBerlaku: L(
        locale,
        "Syarat & ketentuan berlaku",
        "Terms & conditions apply",
      ),
      biasanyaMembalas: L(
        locale,
        "Biasanya membalas dalam 5 menit",
        "Usually replies within 5 minutes",
      ),
      ketikPesan: L(
        locale,
        "Ketik pesan Anda ke admin di sini...",
        "Type your message to admin here...",
      ),
      mengirim: L(locale, "Mengirim...", "Sending..."),
      kirimPesan: L(locale, "Kirim Pesan", "Send Message"),
      atauPesanCepat: L(
        locale,
        "- Atau pilih pesan cepat -",
        "- Or pick a quick message -",
      ),
      pilihPengiriman: L(locale, "Pilih Pengiriman", "Choose Shipping"),
      estimasiTiba: L(locale, "Estimasi tiba", "Arrives"),
      loadingKurir: L(
        locale,
        "Memuat data kurir...",
        "Loading courier data...",
      ),
      bagikanProduk: L(locale, "Bagikan Produk", "Share Product"),
      disalin: L(locale, "Disalin", "Copied"),
      salin: L(locale, "Salin", "Copy"),
      berhasil: L(locale, "Berhasil!", "Success!"),
      perluLogin: L(locale, "Perlu Login", "Login Required"),
      tutup: L(locale, "Tutup", "Close"),
      loginSekarang: L(locale, "Login Sekarang", "Login Now"),
      loginRequiredMsg: L(
        locale,
        "Anda harus login terlebih dahulu untuk mengirim pesan ke admin.",
        "You must log in first to send a message to admin.",
      ),
      chatSentSuccess: L(
        locale,
        "Pesan berhasil dikirim ke Admin!",
        "Message sent to Admin successfully!",
      ),
      chatSendFailed: L(
        locale,
        "Gagal mengirim pesan.",
        "Failed to send message.",
      ),
      chatSystemError: L(
        locale,
        "Terjadi kesalahan sistem saat mengirim pesan.",
        "A system error occurred while sending the message.",
      ),
      loginFirst: L(
        locale,
        "Silakan login terlebih dahulu.",
        "Please log in first.",
      ),
      addedToCart: L(
        locale,
        "Produk berhasil ditambahkan!",
        "Product added successfully!",
      ),
      addFailed: L(locale, "Gagal menambahkan.", "Failed to add."),
      loginOnly: L(locale, "Silakan login.", "Please log in."),
      addedToWishlist: L(
        locale,
        "Ditambahkan ke wishlist!",
        "Added to wishlist!",
      ),
      adminAutoReply: L(
        locale,
        "Terima kasih atas pesannya! Saat ini admin sedang offline, namun kami akan segera membalas pertanyaan Anda.",
        "Thank you for your message! Admin is currently offline, but we will reply to your question soon.",
      ),
      chatTemplates: [
        L(locale, "Hai, barang ini ready?", "Hi, is this item in stock?"),
        L(locale, "Bisa dikirim hari ini?", "Can it be shipped today?"),
        L(locale, "Terima kasih", "Thank you"),
      ],
    }),
    [locale, visual],
  );

  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
  }, [visual.navbarColor, setNavbarAndFooterColor]);

  // Slider belanja details: hanya image_1 … image_3
  const imageSlots = ["image_1", "image_2", "image_3"] as const;
  const currentImages: string[] = product
    ? imageSlots
        .map((k) => getProductImageUrl(product[k]))
        .filter((url): url is string => url !== null)
    : [];

  // Ganti dengan ini:
  const [disclaimers, setDisclaimers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Disclaimer
    fetch(`${BASE_URL}/api/disclaimers`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil disclaimer");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setDisclaimers(data.data); // Simpan semua data array ke state
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []); // <-- KUNCI PENTING: Array kosong ini memastikan fetch hanya dijalankan 1x saat render pertama

  useEffect(() => {
    if (currentImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentImages.length]);

  // Handlers
  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
    if (type === "inc" && quantity < dummyStock) setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setCartMessage(copy.loginFirst);
      setCartStatus("error");
      return;
    }
    setCartStatus("loading");
    setCartMessage("");
    try {
      await addToCart(Number(id), quantity);
      setCartStatus("success");
      setCartMessage(copy.addedToCart);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err: unknown) {
      setCartStatus("error");
      setCartMessage(err instanceof Error ? err.message : copy.addFailed);
    }
  };

  const handleAddToWishlist = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setWishlistMessage(copy.loginOnly);
      setWishlistStatus("error");
      return;
    }
    setWishlistStatus("loading");
    setWishlistMessage("");
    try {
      await addToWishlist(Number(id));
      setWishlistStatus("success");
      setWishlistMessage(copy.addedToWishlist);
      window.dispatchEvent(new Event("wishlist_updated"));
    } catch (err: unknown) {
      setWishlistStatus("error");
      setWishlistMessage(
        err instanceof Error ? err.message : copy.addFailed,
      );
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const newMessages = [
      ...chatMessages,
      { sender: "user" as const, text: currentMessage },
    ];
    setChatMessages(newMessages);
    setCurrentMessage("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "admin" as const,
          text: copy.adminAutoReply,
        },
      ]);
    }, 1000);
  };

  const subtitle = product
    ? `${product.bottle_size ?? 50}ml • ${product.perfume_type ?? "Eau de Parfum"}`
    : "50ml • Eau de Parfum";

  return (
    <section className="bg-[#F8F9FA] w-full pt-6 sm:pt-8 pb-12 md:pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start mt-2 md:mt-4 mb-10 z-10">
        {/* ================= KIRI: IMAGE GALLERY (Col 4) ================= */}
        <div className="lg:col-span-4 flex flex-col items-center w-full select-none">
          <div
            className="w-full aspect-square rounded-[24px] overflow-hidden flex justify-center items-center relative shadow-sm"
            style={{ backgroundColor: visual.navbarColor }}
          >
            {isLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : currentImages.length > 0 ? (
              currentImages.map((imgSrc, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex justify-center items-center ${
                    currentIndex === index
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={imgSrc}
                      alt={`${product?.title ?? copy.productFallback} ${copy.gambar} ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/40 text-[19px]">No image</div>
            )}
          </div>

          {/* Dots Indicator */}
          {currentImages.length > 1 && (
            <div className="flex justify-center items-center gap-2 my-5">
              {currentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-[8px] rounded-full transition-all duration-300 ${
                    currentIndex === index ? "w-[24px]" : "w-[8px] opacity-30"
                  }`}
                  style={{ backgroundColor: visual.navbarColor }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {currentImages.length > 0 && (
            <div
              className={`grid gap-3 w-full mt-2 ${
                currentImages.length >= 3 ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-full aspect-square rounded-[16px] overflow-hidden border-2 transition-all duration-300 bg-white ${
                    currentIndex === index
                      ? "border-opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    borderColor:
                      currentIndex === index
                        ? visual.navbarColor
                        : "transparent",
                  }}
                >
                  <div
                    className="relative w-full h-full flex justify-center items-center"
                    style={{
                      backgroundColor:
                        currentIndex === index
                          ? "transparent"
                          : visual.navbarColor + "1A",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: visual.navbarColor }}
                    />
                    <Image
                      src={image}
                      alt={`${product?.title ?? ""} thumbnail ${index + 1}`}
                      fill
                      className="object-contain z-10"
                      unoptimized
                      sizes="100px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= TENGAH: DETAIL INFO (Col 5) ================= */}
        <div
          id="detail-info-scroll"
          className="lg:col-span-5 flex flex-col text-left w-full relative lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]"
          style={
            detailScrollHeight
              ? {
                  height: detailScrollHeight,
                  maxHeight: detailScrollHeight,
                }
              : undefined
          }
        >
          {/* TITLE & DESC (Sesuai title desc.PNG) */}
          <h1
            className="font-nohemi text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-tight mb-2 tracking-tight"
            style={{ color: visual.navbarColor }}
          >
            {isLoading ? (
              <Skeleton className="w-48 h-12 block" />
            ) : (
              product?.title
            )}
          </h1>

          <p className="font-nohemi text-[16px] sm:text-[18px] md:text-[23px] font-semibold text-[#5D5D5D] mb-4 md:mb-6">
            {isLoading ? <Skeleton className="w-40 h-6 block" /> : subtitle}
          </p>

          <p className="font-parkinsans text-[14px] md:text-[17px] font-normal text-[#5D5D5D] leading-[1.6] mb-6 md:mb-8">
            {isLoading ? (
              <Skeleton className="w-full h-20 block" />
            ) : (
              product?.description || copy.descriptionFallback
            )}
          </p>

          {/* CARD NOTES (Sesuai notes.PNG) */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 sm:p-6 shadow-sm mb-6 md:mb-8 flex flex-col gap-4 md:gap-5">
            <h4
              className="font-nohemi text-[18px] md:text-[20.36px] font-semibold tracking-tight"
              style={{ color: visual.navbarColor }}
            >
              Notes {isLoading ? "" : product?.title}
            </h4>

            <div className="flex flex-col gap-3.5">
              {[
                {
                  label: "Top Note",
                  value: product?.top_note || "Plum • Grapefruit • Bergamot",
                },
                {
                  label: "Middle Note",
                  value:
                    product?.middle_note ||
                    "Hazelnut • Honey • Milk • Amberwood",
                },
                {
                  label: "Base Note",
                  value:
                    product?.base_note ||
                    "Cedarwood • Cashmere Wood • Vetiver • Marine",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span
                    className="text-white font-nohemi text-[11px] md:text-[11.42px] regular px-3 md:px-4 py-1.5 rounded-full w-fit sm:min-w-[100px] text-center"
                    style={{ backgroundColor: visual.navbarColor }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[13px] md:text-[14.15px] font-parkinsans font-normal opacity-80"
                    style={{ color: visual.navbarColor }}
                  >
                    {isLoading ? (
                      <Skeleton className="w-40 h-4 inline-block" />
                    ) : (
                      value
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HARGA */}
          <div className="mb-6">
            <h4
              className="font-nohemi text-[18px] md:text-[20px] font-bold mb-1"
              style={{ color: visual.navbarColor }}
            >
              {copy.harga}
            </h4>
            <span className="font-nohemi text-[26px] md:text-[32px] font-semibold text-[#1A1A1A]">
              {isLoading ? (
                <Skeleton className="w-36 h-10 block" />
              ) : (
                formatProductPrice(product?.price)
              )}
            </span>
          </div>

          {/* DETAIL PRODUK (Sesuai detail produk.PNG) */}
          <div className="mb-8">
            <h4
              className="font-nohemi text-[20px] font-semibold mb-4"
              style={{ color: visual.navbarColor }}
            >
              {copy.detailProduk}
            </h4>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[14px] font-parkinsans font-normal">
              {/* Kondisi */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">{copy.kondisi}</span>
                <span className="text-[#364153]">
                  {product?.kondisi || copy.kondisiValue}
                </span>
              </div>

              {/* Berat Satuan */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">
                  {copy.beratSatuan}
                </span>
                <span className="text-[#364153]">
                  {product?.berat_satuan ? `${product.berat_satuan} g` : "-"}
                </span>
              </div>

              {/* Kategori */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">{copy.kategori}</span>
                <span className="text-[#364153]">
                  {product?.kategori || "-"}
                </span>
              </div>

              {/* Brand */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Brand</span>
                <span className="text-[#364153]">{product?.brand || "-"}</span>
              </div>

              {/* Min. Beli */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">{copy.minBeli}</span>
                <span className="text-[#364153]">{copy.minBeliValue}</span>
              </div>

              {/* Etalase */}
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">{copy.etalase}</span>
                <span className="text-[#364153]">
                  {product?.etalase || copy.etalaseValue}
                </span>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="mb-8">
            <h4
              className="font-nohemi text-[20px] font-semibold mb-3"
              style={{ color: visual.navbarColor }}
            >
              {copy.disclaimerTitle}
            </h4>
            <div className="text-[14px] font-parkinsans font-normal text-[#4A5565] leading-relaxed flex flex-col gap-1.5">
              {disclaimers.length > 0 ? (
                disclaimers.map((item, index) => (
                  <p key={item.id}>
                    {index + 1}. {item.deskripsi}
                  </p>
                ))
              ) : (
                <p>{copy.loadingPolicy}</p>
              )}
            </div>
          </div>

          {/* PENGIRIMAN */}
          {/* PENGIRIMAN */}
          <div className="bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm flex flex-col gap-5">
            <h4 className="font-nohemi text-[20px] font-semibold text-[#1E2939]">
              {copy.pengiriman}
            </h4>

            {/* Dikirim Dari */}
            <div className="flex gap-4 items-start">
              <MapPin className="text-gray-400 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-[15px] text-[#6A7282] font-parkinsans font-normal">
                  {copy.dikirimDari}
                </p>
                <p className="text-[16px] font-semibold text-[#364153] font-parkinsans">
                  {product?.alamat_awal_pengiriman || copy.loadingLokasi}
                </p>
              </div>
            </div>

            {/* Info Kurir Terpilih */}
            <div className="flex gap-4 items-start">
              <Truck className="text-gray-400 mt-0.5 shrink-0" size={20} />
              <div className="w-full relative">
                <p className="text-[15px] text-[#6A7282] font-parkinsans font-normal">
                  {selectedKurir
                    ? `${selectedKurir.nama} - ${selectedKurir.jenis}`
                    : copy.ongkirMulai}
                </p>
                <p className="text-[16px] font-semibold text-[#364153] font-parkinsans">
                  {selectedKurir
                    ? `Rp${Number(selectedKurir.harga).toLocaleString("id-ID")}`
                    : "-"}
                </p>
                <p className="text-[15px] text-[#99A1AF] font-parkinsans font-normal mt-0.5">
                  {copy.bisaCod}{" "}
                  {selectedKurir ? getEstimasiTiba(selectedKurir.jenis) : "-"}
                </p>

                {/* Tombol & Dropdown Kurir Lainnya */}
                {/* Tombol Kurir Lainnya */}
                <div className="mt-3">
                  <button
                    onClick={() => setShowKurirList(true)}
                    className="text-left font-parkinsans text-[15px] font-semibold underline-offset-4 hover:underline"
                    style={{ color: visual.navbarColor }}
                  >
                    {copy.lihatKurirLainnya}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= KANAN: ACTION BOX CART (Col 3) ================= */}
        <div className="lg:col-span-3 w-full relative">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* MAIN CART BOX (Sesuai card kanan.PNG) */}
            <div
              ref={diskusiBoxRef}
              className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden w-full lg:w-[295px] flex flex-col"
            >
              {/* Header Box */}
              <div
                className="px-4 py-2 text-[#FFFFFF] flex items-center gap-2 font-parkinsans font-medium text-[14px]"
                style={{ backgroundColor: visual.navbarColor }}
              >
                <MessageCircle size={18} /> {copy.diskusiTerbuka}
              </div>

              {/* Box Content */}
              <div className="p-5 flex flex-col gap-5">
                {/* Harga Detail */}
                <div>
                  <div className="font-nohemi text-[28px] font-bold text-[#101828] leading-none">
                    {formatProductPrice(dummyPrice)}
                  </div>
                </div>

                {/* Quantity & Stock */}
                <div>
                  <p className="font-parkinsans text-[14px] text-[#6A7282] font-normal mb-2">
                    {copy.aturJumlah}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-[8px] h-[38px]">
                      <button
                        onClick={() => handleQuantityChange("dec")}
                        className="px-3 text-gray-500 hover:text-black transition flex h-full items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={quantity}
                        className="w-12 text-center text-[15px] font-bold border-x border-gray-300 h-full focus:outline-none text-[#1A1A1A]"
                      />
                      <button
                        onClick={() => handleQuantityChange("inc")}
                        className="px-3 text-gray-500 hover:text-black transition flex h-full items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="font-parkinsans text-[14px] text-[#6A7282] font-normal">
                      {copy.stok}{" "}
                      <span className="font-normal text-[#6A7282]">
                        {product?.quantity}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[17px] font-parkinsans text-[#6A7282] font-normal">
                    {copy.subtotal}
                  </span>
                  <span className="text-[17px] font-nohemi font-bold text-[#101828]">
                    {formatProductPrice(dummySubtotalPrice)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-1">
                  <button
                    onClick={() =>
                      router.push(
                        `/checkout?type=buynow&productId=${id}&qty=${quantity}`,
                      )
                    }
                    className="w-full text-white font-nohemi text-[16px] font-semibold py-3 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: visual.navbarColor }}
                  >
                    {copy.beliLangsung}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={cartStatus === "loading"}
                    className="w-full bg-white font-nohemi text-[16px] font-semibold py-3 rounded-full border shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                    style={{
                      color: visual.navbarColor,
                      borderColor: visual.navbarColor,
                    }}
                  >
                    {cartStatus === "loading" ? copy.memproses : copy.tambahKeranjang}
                  </button>
                </div>

                {/* Small Actions (Chat, Wishlist, Share) */}
                <div
                  className="flex justify-center gap-12 mt-2 font-parkinsans font-medium text-[14px] text-[#6A7282]"
                  style={
                    {
                      "--hover-color": visual.navbarColor,
                    } as React.CSSProperties
                  }
                >
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex flex-col items-center gap-1.5 hover:text-[var(--hover-color)] transition"
                  >
                    <MessageCircle size={20} strokeWidth={1.5} /> {copy.chat}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className={`flex flex-col items-center gap-1.5 transition ${wishlistStatus === "success" ? "text-red-500" : "hover:text-[var(--hover-color)]"}`}
                  >
                    <Heart
                      size={20}
                      strokeWidth={1.5}
                      className={
                        wishlistStatus === "success" ? "fill-red-500" : ""
                      }
                    />{" "}
                    {copy.wishlist}
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex flex-col items-center gap-1.5 hover:text-[var(--hover-color)] transition"
                  >
                    <Share2 size={20} strokeWidth={1.5} /> {copy.share}
                  </button>
                </div>

                {/* Promo Banner */}
                <div className="bg-[#FFF4E5] border border-[#FFE8CC] text-[#CA3500] rounded-[8px] p-3 flex gap-2.5 items-center mt-2 font-parkinsans">
                  <Clock size={18} className="shrink-0" />
                  <p className="text-[14px] font-normal leading-snug">
                    {copy.promoBerlaku}{" "}
                    {formatProductPrice(hargaPromo)}
                  </p>
                </div>

                {/* Notifications */}
                {(cartMessage || wishlistMessage) && (
                  <div className="text-center text-[14px] font-medium text-green-600 mt-[-10px]">
                    {cartMessage || wishlistMessage}
                  </div>
                )}
              </div>
            </div>

            {/* JAMINAN & BEBAS ONGKIR BOX */}
            <div
              ref={jaminanBoxRef}
              className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col gap-4"
            >
              <div className="flex gap-3 items-start">
                <Shield
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: visual.navbarColor }}
                />
                <div>
                  <h5 className="font-parkinsans font-semibold text-[14px] text-[#364153]">
                    {copy.jaminanProduk}
                  </h5>
                  <p className="font-parkinsans font-normal text-[14px] text-[#99A1AF] mt-0.5">
                    {copy.uangKembali}
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="flex gap-3 items-start">
                <CheckCircle
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: visual.navbarColor }}
                />
                <div>
                  <h5 className="font-parkinsans font-semibold text-[14px] text-[#364153]">
                    {copy.bebasOngkir}
                  </h5>
                  <p className="font-parkinsans font-normal text-[14px] text-[#99A1AF] mt-0.5">
                    {copy.syaratBerlaku}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHAT POPUP MODAL ================= */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[350px] h-[500px] md:h-[550px] bg-white md:rounded-2xl shadow-2xl flex flex-col z-[100] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between text-white shadow-sm"
            style={{ backgroundColor: visual.navbarColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] font-nohemi">
                  Admin Evomi
                </h3>
                <p className="text-[12px] opacity-90 font-parkinsans">
                  {copy.biasanyaMembalas}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3 font-parkinsans custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl text-[14px] ${msg.sender === "user" ? "self-end text-white rounded-tr-sm" : "self-start bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"}`}
                style={
                  msg.sender === "user"
                    ? { backgroundColor: visual.navbarColor }
                    : {}
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          {/* Body Modal - Chat */}
          <div className="p-5 flex flex-col gap-4 bg-[#F8F9FA]">
            {/* Text Area Custom Pesan */}
            <div className="flex flex-col gap-2">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={copy.ketikPesan}
                className="w-full p-3 rounded-[16px] border border-[#E5E7EB] text-[14px] font-parkinsans outline-none focus:border-[#101828] resize-none"
                rows={3}
              />
              <button
                onClick={() => handleSendChat(customMessage)}
                disabled={!customMessage.trim() || isSendingChat}
                className="w-full py-3 rounded-[12px] font-parkinsans font-bold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: visual.navbarColor }}
              >
                {isSendingChat ? copy.mengirim : copy.kirimPesan}
              </button>
            </div>

            {/* Template Cepat */}
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[12px] text-gray-500 font-parkinsans text-center mb-1">
                {copy.atauPesanCepat}
              </p>
              {copy.chatTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleSendChat(template)}
                  disabled={isSendingChat}
                  className="w-full text-left p-3.5 bg-white rounded-[16px] border border-[#E5E7EB] hover:border-gray-300 hover:shadow-sm transition-all font-parkinsans text-[14px] text-[#364153] flex justify-between items-center group disabled:opacity-50"
                >
                  <span className="line-clamp-1">"{template}"</span>
                  <MessageCircle
                    size={16}
                    className="text-gray-300 group-hover:text-gray-700 transition-colors shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PILIH KURIR ================= */}
      {showKurirList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Container Modal */}
          <div className="bg-white w-full max-w-[450px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden relative">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-nohemi text-[18px] font-bold text-[#1E2939]">
                {copy.pilihPengiriman}
              </h3>
              <button
                onClick={() => setShowKurirList(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body / List Kurir */}
            <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-3">
              {kurirs.length > 0 ? (
                kurirs.map((kurir) => (
                  <div
                    key={kurir.id}
                    onClick={() => {
                      setSelectedKurir(kurir);
                      setShowKurirList(false); // Otomatis tutup modal setelah milih
                    }}
                    className={`cursor-pointer p-4 flex justify-between items-center rounded-[16px] border transition-all ${
                      selectedKurir?.id === kurir.id
                        ? "border-[2px] bg-blue-50/30"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 border-[1px]"
                    }`}
                    style={{
                      borderColor:
                        selectedKurir?.id === kurir.id
                          ? visual.navbarColor
                          : undefined,
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-parkinsans font-semibold text-[15px] text-[#364153]">
                        {kurir.nama}{" "}
                        <span className="font-normal text-gray-500">
                          ({kurir.jenis})
                        </span>
                      </span>
                      <span className="font-parkinsans text-[13px] text-[#6A7282]">
                        {copy.estimasiTiba} {getEstimasiTiba(kurir.jenis)}
                      </span>
                    </div>
                    <span
                      className="font-parkinsans font-bold text-[16px]"
                      style={{ color: visual.navbarColor }}
                    >
                      Rp{Number(kurir.harga).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[14px] text-gray-500 font-parkinsans">
                  {copy.loadingKurir}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SHARE PRODUK ================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[400px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden relative">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-nohemi text-[18px] font-bold text-[#1E2939]">
                {copy.bagikanProduk}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal - Social Icons */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* WhatsApp */}
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <MessageCircle size={24} />
                  </div>
                  <span className="text-[12px] font-parkinsans font-medium text-[#6A7282]">
                    WhatsApp
                  </span>
                </a>

                {/* Facebook */}
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FacebookIcon size={24} />
                  </div>
                  <span className="text-[12px] font-parkinsans font-medium text-[#6A7282]">
                    Facebook
                  </span>
                </a>

                {/* Twitter / X */}
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-800 group-hover:text-white transition-colors">
                    <TwitterIcon size={24} />
                  </div>
                  <span className="text-[12px] font-parkinsans font-medium text-[#6A7282]">
                    Twitter
                  </span>
                </a>

                {/* Instagram (Menyalin Link) */}
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <InstagramIcon size={24} />
                  </div>
                  <span className="text-[12px] font-parkinsans font-medium text-[#6A7282]">
                    Instagram
                  </span>
                </button>
              </div>

              {/* Box Copy Link */}
              <div className="flex items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-[12px] border border-[#E5E7EB]">
                <div className="pl-3 text-gray-400">
                  <LinkIcon size={16} />
                </div>
                <input
                  type="text"
                  value={productUrl}
                  readOnly
                  className="bg-transparent outline-none flex-1 text-[13px] text-[#6A7282] font-parkinsans w-full overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-[8px] text-[13px] font-semibold text-[#364153] hover:bg-gray-50 flex items-center gap-1.5 transition-colors shrink-0"
                  style={{ color: isCopied ? visual.navbarColor : undefined }}
                >
                  {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {isCopied ? copy.disalin : copy.salin}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CUSTOM ALERT ================= */}
      {/* ================= MODAL CUSTOM ALERT (Dinamis: Error & Success) ================= */}
      {alertInfo.show && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[360px] rounded-[24px] shadow-2xl p-6 text-center relative overflow-hidden">
            {/* Ikon Dinamis */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                alertInfo.type === "success"
                  ? "bg-green-50 text-green-500"
                  : "bg-amber-50 text-amber-500"
              }`}
            >
              {alertInfo.type === "success" ? (
                <CheckCircle size={28} />
              ) : (
                <Shield size={28} />
              )}
            </div>

            {/* Judul & Pesan */}
            <h3 className="font-nohemi text-[18px] font-bold text-[#1E2939] mb-2">
              {alertInfo.type === "success" ? copy.berhasil : copy.perluLogin}
            </h3>
            <p className="font-parkinsans text-[14px] text-[#6A7282] mb-6">
              {alertInfo.message}
            </p>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              {alertInfo.type === "error" ? (
                <>
                  <button
                    onClick={() =>
                      setAlertInfo({ show: false, message: "", type: "error" })
                    }
                    className="flex-1 py-3 rounded-[12px] font-parkinsans font-semibold text-[14px] bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {copy.tutup}
                  </button>
                  <button
                    onClick={() => {
                      setAlertInfo({ show: false, message: "", type: "error" });
                      router.push("/login"); // Mengarahkan ke halaman login
                    }}
                    className="flex-1 py-3 rounded-[12px] font-parkinsans font-semibold text-[14px] text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: visual.navbarColor }}
                  >
                    {copy.loginSekarang}
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setAlertInfo({ show: false, message: "", type: "error" })
                  }
                  className="w-full py-3 rounded-[12px] font-parkinsans font-semibold text-[14px] text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: visual.navbarColor }}
                >
                  {copy.tutup}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= STICKY LINGKARAN DIVIDER BAWAH ================= */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[15px] md:h-[23px] pointer-events-none">
        <style>{`
          @keyframes slideLeftSeamless {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-slide-left-40s {
            animation: slideLeftSeamless 80s linear infinite;
          }
          #detail-info-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex w-max gap-[10px] md:gap-[15px] animate-slide-left-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`bottom-${index}`}
              className="w-[30px] h-[30px] md:w-[46px] md:h-[46px] rounded-full flex-shrink-0"
              style={{ backgroundColor: visual.navbarColor }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
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
import {
  MessageCircle,
  Minus,
  Plus,
  Heart,
  Share2,
  Clock,
  MapPin,
  Truck,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data visual statis
// ---------------------------------------------------------------------------
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

  const { setNavbarAndFooterColor } = useNavbarColor();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dummy Data State for Right Column Cart Box
  const [quantity, setQuantity] = useState(1);
  const dummyStock = 968;
  const dummyPrice = 189000;
  const dummySubtotalPrice = 169000;

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
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "admin"; text: string }[]>([
    { sender: "admin", text: "Halo! Ada yang bisa kami bantu terkait produk ini?" }
  ]);

  useEffect(() => {
    setIsLoading(true);
    setCurrentIndex(0);
    getProduct(id)
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const visual =
    VISUAL_BY_PERSONALITY[product?.personality_type ?? ""] ?? VISUAL_FALLBACK;

  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
  }, [visual.navbarColor, setNavbarAndFooterColor]);

  const imageSlots = ["image_1", "image_2", "image_3"] as const;
  const currentImages: string[] = product
    ? imageSlots
      .map((k) => getProductImageUrl(product[k]))
      .filter((url): url is string => url !== null)
    : [];

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
      setCartMessage("Silakan login terlebih dahulu.");
      setCartStatus("error");
      return;
    }
    setCartStatus("loading");
    setCartMessage("");
    try {
      await addToCart(Number(id), quantity);
      setCartStatus("success");
      setCartMessage("Produk berhasil ditambahkan!");
    } catch (err: unknown) {
      setCartStatus("error");
      setCartMessage(err instanceof Error ? err.message : "Gagal menambahkan.");
    }
  };

  const handleAddToWishlist = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setWishlistMessage("Silakan login.");
      setWishlistStatus("error");
      return;
    }
    setWishlistStatus("loading");
    setWishlistMessage("");
    try {
      await addToWishlist(Number(id));
      setWishlistStatus("success");
      setWishlistMessage("Ditambahkan ke wishlist!");
    } catch (err: unknown) {
      setWishlistStatus("error");
      setWishlistMessage(
        err instanceof Error ? err.message : "Gagal menambahkan.",
      );
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text: currentMessage }];
    setChatMessages(newMessages);
    setCurrentMessage("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "admin" as const, text: "Terima kasih atas pesannya! Saat ini admin sedang offline, namun kami akan segera membalas pertanyaan Anda." }
      ]);
    }, 1000);
  };

  const subtitle = product
    ? `${product.bottle_size ?? 50}ml • ${product.perfume_type ?? "Eau de Parfum"}`
    : "50ml • Eau de Parfum";

  return (
    <section className="bg-[#F8F9FA] w-full pt-8 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-4 mb-10 z-10">
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
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex justify-center items-center ${currentIndex === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                    }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={imgSrc}
                      alt={`${product?.title ?? "Produk"} gambar ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={index === 0}
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
                  className={`h-[8px] rounded-full transition-all duration-300 ${currentIndex === index ? "w-[24px]" : "w-[8px] opacity-30"
                    }`}
                  style={{ backgroundColor: visual.navbarColor }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {currentImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-full aspect-square rounded-[16px] overflow-hidden border-2 transition-all duration-300 bg-white ${currentIndex === index
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
          className="lg:col-span-5 flex flex-col text-left w-full relative overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 8rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties}
        >
          {/* TITLE & DESC (Sesuai title desc.PNG) */}
          <h1
            className="font-nohemi text-[42px] font-semibold leading-tight mb-2 tracking-tight"
            style={{ color: visual.navbarColor }}
          >
            {isLoading ? (
              <Skeleton className="w-48 h-12 block" />
            ) : (
              product?.title
            )}
          </h1>

          <p className="font-nohemi text-[23px] font-semibold text-[#5D5D5D] mb-6">
            {isLoading ? <Skeleton className="w-40 h-6 block" /> : subtitle}
          </p>

          <p className="font-parkinsans text-[17px] font-normal text-[#5D5D5D] leading-[1.6] mb-8">
            {isLoading ? (
              <Skeleton className="w-full h-20 block" />
            ) : (
              product?.description ||
              "Menghadirkan aroma yang merefleksikan ketenangan, kepercayaan diri, dan kejelasan tujuan."
            )}
          </p>

          {/* CARD NOTES (Sesuai notes.PNG) */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm mb-8 flex flex-col gap-5">
            <h4
              className="font-nohemi text-[20.36px] font-semibold tracking-tight"
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
                <div key={label} className="flex flex-row items-center gap-4">
                  <span
                    className="text-white font-nohemi text-[11.42px] regular px-4 py-1.5 rounded-full min-w-[100px] text-center"
                    style={{ backgroundColor: visual.navbarColor }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[14.15px] font-parkinsans font-normal opacity-80"
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
              className="font-['Nohemi'] text-[20px] font-bold mb-1"
              style={{ color: visual.navbarColor }}
            >
              Harga
            </h4>
            <span className="font-['Nohemi'] text-[32px] font-semibold text-[#1A1A1A]">
              {isLoading ? (
                <Skeleton className="w-36 h-10 block" />
              ) : (
                formatProductPrice(dummyPrice)
              )}
            </span>
          </div>

          {/* DETAIL PRODUK (Sesuai detail produk.PNG) */}
          <div className="mb-8">
            <h4
              className="font-nohemi text-[20px] font-semibold mb-4"
              style={{ color: visual.navbarColor }}
            >
              Detail Produk
            </h4>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[14px] font-parkinsans font-normal">
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Kondisi</span>
                <span className="text-[#364153]">Baru</span>
              </div>
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">
                  Berat Satuan
                </span>
                <span className="text-[#364153]">100 g</span>
              </div>

              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Kategori</span>
                <span className="text-[#364153]">Parfum & Cologne</span>
              </div>
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Brand</span>
                <span className="text-[#364153]">Evomi</span>
              </div>

              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Min. Beli</span>
                <span className="text-[#364153]">1 Buah</span>
              </div>
              <div className="flex">
                <span className="w-28 text-[#99A1AF] shrink-0">Etalase</span>
                <span className="text-[#364153]">Semua Etalase</span>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="mb-8">
            <h4
              className="font-nohemi text-[20px] font-semibold mb-3"
              style={{ color: visual.navbarColor }}
            >
              Disclaimer untuk Ketentuan COMPLAIN
            </h4>
            <div className="text-[14px] font-parkinsans font-normal text-[#4A5565] leading-relaxed flex flex-col gap-1.5">
              <p>
                1. Setiap complain kerusakan barang WAJIB menyertakan video
                unboxing (tanpa cut dan tanpa edit). Complain TANPA MENGIRIMKAN
                VIDEO UNBOXING tidak dapat kami terima dan proses.
              </p>
              <p>
                2. Untuk kartu ucapan bisa ditambahkan di catatan saat co
                payment
              </p>
            </div>
          </div>

          {/* PENGIRIMAN */}
          <div className="bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm flex flex-col gap-5">
            <h4 className="font-nohemi text-[20px] font-semibold text-[#1E2939]">
              Pengiriman
            </h4>

            <div className="flex gap-4 items-start">
              <MapPin className="text-gray-400 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-[15px] text-[#6A7282] font-parkinsans font-normal">
                  Dikirim dari
                </p>
                <p className="text-[16x] font-semibold text-[#364153] font-parkinsans">
                  Kota Tangerang, Kec Cisauk
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Truck className="text-gray-400 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-[15px] text-[#6A7282] font-parkinsans font-normal">
                  Ongkir Mulai
                </p>
                <p className="text-[16px] font-semibold text-[#364153] font-parkinsans">
                  Rp9.000
                </p>
                <p className="text-[15px] text-[#99A1AF] font-parkinsans font-normal mt-0.5">
                  Bisa COD, estimasi tiba 08 Jul
                </p>
              </div>
            </div>

            <button
              className="text-left font-parkinsans text-[15px] font-semibold mt-1"
              style={{ color: visual.navbarColor }}
            >
              Lihat Kurir Lainnya
            </button>
          </div>
        </div>

        {/* ================= KANAN: ACTION BOX CART (Col 3) ================= */}
        <div className="lg:col-span-3 w-full relative">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* MAIN CART BOX (Sesuai card kanan.PNG) */}
            <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden w-[295px] h-[567.3px]">
              {/* Header Box */}
              <div
                className="px-4 py-2 text-[#FFFFFF] flex items-center gap-2 font-parkinsans font-medium text-[14px]"
                style={{ backgroundColor: visual.navbarColor }}
              >
                <MessageCircle size={18} /> Diskusi Terbuka
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
                    Atur jumlah dan catatan
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
                      Stok:{" "}
                      <span className="font-normal text-[#6A7282]">
                        {dummyStock}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[17px] font-parkinsans text-[#6A7282] font-normal">
                    Subtotal
                  </span>
                  <span className="text-[17px] font-nohemi font-bold text-[#101828]">
                    {formatProductPrice(dummySubtotalPrice * quantity)}
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
                    Beli Langsung
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
                    {cartStatus === "loading" ? "Memproses..." : "+ Keranjang"}
                  </button>
                </div>

                {/* Small Actions (Chat, Wishlist, Share) */}
                <div
                  className="flex justify-center gap-12 mt-2 font-parkinsans font-medium text-[14px] text-[#6A7282]"
                  style={
                    { "--hover-color": visual.navbarColor } as React.CSSProperties
                  }
                >
                  <button onClick={() => setIsChatOpen(true)} className="flex flex-col items-center gap-1.5 hover:text-[var(--hover-color)] transition">
                    <MessageCircle size={20} strokeWidth={1.5} /> Chat
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
                    Wishlist
                  </button>
                  <button className="flex flex-col items-center gap-1.5 hover:text-[var(--hover-color)] transition">
                    <Share2 size={20} strokeWidth={1.5} /> Share
                  </button>
                </div>

                {/* Promo Banner */}
                <div className="bg-[#FFF4E5] border border-[#FFE8CC] text-[#CA3500] rounded-[8px] p-3 flex gap-2.5 items-center mt-2 font-parkinsans">
                  <Clock size={18} className="shrink-0" />
                  <p className="text-[14px] font-normal leading-snug">
                    Promo berlaku hari ini! Hemat hingga Rp41.000
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
            <div className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex gap-3 items-start">
                <Shield
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: visual.navbarColor }}
                />
                <div>
                  <h5 className="font-parkinsans font-semibold text-[14px] text-[#364153]">
                    Jaminan Produk
                  </h5>
                  <p className="font-parkinsans font-normal text-[14px] text-[#99A1AF] mt-0.5">
                    Uang kembali bila produk tidak sesuai
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
                    Bebas Ongkir
                  </h5>
                  <p className="font-parkinsans font-normal text-[14px] text-[#99A1AF] mt-0.5">
                    Syarat & ketentuan berlaku
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
                <h3 className="font-bold text-[15px] font-['Nohemi']">Admin Evomi</h3>
                <p className="text-[12px] opacity-90 font-['Parkinsans']">Biasanya membalas dalam 5 menit</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3 font-['Parkinsans'] custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 rounded-2xl text-[14px] ${msg.sender === 'user' ? 'self-end text-white rounded-tr-sm' : 'self-start bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`} style={msg.sender === 'user' ? { backgroundColor: visual.navbarColor } : {}}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Tulis pesan..." 
                className="flex-1 bg-gray-100 text-[14px] rounded-full px-4 py-2.5 outline-none focus:ring-2 transition-all font-['Parkinsans']"
                style={{ '--tw-ring-color': visual.navbarColor + '80' } as React.CSSProperties}
              />
              <button 
                type="submit"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: visual.navbarColor }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
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

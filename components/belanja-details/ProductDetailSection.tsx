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

import { useParams, useRouter } from "next/navigation"; // Tambahkan useRouter

// ---------------------------------------------------------------------------
// Data visual statis — hanya warna UI, dipetakan dari personality_type
// (tidak dari database, sesuai permintaan)
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
  showCharacter = true,
}: {
  forcedId?: string;
  showDivider?: boolean;
  showCharacter?: boolean;
}) {
  // ... di dalam komponen ProductDetailSection:
  const router = useRouter();
  const params = useParams();
  const id = forcedId || (params?.id as string) || "1";

  const { setNavbarAndFooterColor } = useNavbarColor();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cart & Wishlist state
  const [cartStatus, setCartStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [wishlistStatus, setWishlistStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  // Fetch produk dari API
  useEffect(() => {
    setIsLoading(true);
    setCurrentIndex(0);
    getProduct(id)
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Warna UI dari personality_type produk
  const visual =
    VISUAL_BY_PERSONALITY[product?.personality_type ?? ""] ?? VISUAL_FALLBACK;

  // Set warna navbar & footer
  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
  }, [visual.navbarColor, setNavbarAndFooterColor]);

  // Susun array gambar dari image_1 – image_4
  const imageSlots = ["image_1", "image_2", "image_3", "image_4"] as const;
  const currentImages: string[] = product
    ? imageSlots
        .map((k) => getProductImageUrl(product[k]))
        .filter((url): url is string => url !== null)
    : [];

  // Auto-slide
  useEffect(() => {
    if (currentImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentImages.length]);

  // ---------------------------------------------------------------------------
  // Handler Cart
  // ---------------------------------------------------------------------------
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
      await addToCart(Number(id), 1);
      setCartStatus("success");
      setCartMessage("Produk berhasil ditambahkan ke keranjang!");
    } catch (err: unknown) {
      setCartStatus("error");
      setCartMessage(
        err instanceof Error ? err.message : "Gagal menambahkan ke keranjang.",
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Handler Wishlist
  // ---------------------------------------------------------------------------
  const handleAddToWishlist = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setWishlistMessage("Silakan login terlebih dahulu.");
      setWishlistStatus("error");
      return;
    }
    setWishlistStatus("loading");
    setWishlistMessage("");
    try {
      await addToWishlist(Number(id));
      setWishlistStatus("success");
      setWishlistMessage("Produk ditambahkan ke wishlist!");
    } catch (err: unknown) {
      setWishlistStatus("error");
      setWishlistMessage(
        err instanceof Error ? err.message : "Gagal menambahkan ke wishlist.",
      );
    }
  };

  // Subtitle dari data API
  const subtitle = product
    ? `${product.bottle_size ?? 50}ml • ${product.perfume_type ?? "Eau de Parfum"}`
    : "50ml • Eau de Parfum";

  return (
    <section className="bg-[#F6F6F6] w-full pt-12 pb-24 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <style>{`
        @keyframes slideRightSeamless {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-slide-right-40s {
          animation: slideRightSeamless 80s linear infinite;
        }
      `}</style>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-6 mb-16 z-10">
        {/* ================= KIRI: IMAGE SLIDER ================= */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full select-none">
          {/* Gambar Utama */}
          <div
            className="w-full max-w-[482px] aspect-square rounded-[24px] overflow-hidden flex justify-center items-center relative shadow-sm"
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
                      alt={`${product?.title ?? "Produk"} gambar ${index + 1}`}
                      fill
                      className="object-contain p-4"
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 482px"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/40 text-sm">No image</div>
            )}
          </div>

          {/* Dots Indicator */}
          {currentImages.length > 1 && (
            <div className="flex justify-center items-center w-full max-w-[482px] gap-2 my-6">
              {currentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index ? "w-6" : "w-2 opacity-30"
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
              className={`grid gap-4 w-full max-w-[482px] ${
                currentImages.length === 4 ? "grid-cols-4" : "grid-cols-3"
              }`}
            >
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-full aspect-square flex-shrink-0 rounded-[16px] overflow-hidden border-2 transition-all duration-300 ${
                    currentIndex === index
                      ? "border-opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                  style={{
                    borderColor:
                      currentIndex === index
                        ? visual.navbarColor
                        : "transparent",
                    backgroundColor: visual.navbarColor + "33",
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${product?.title ?? ""} thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="120px"
                      priority // Tambahkan properti ini!
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= KANAN: DETAIL INFO ================= */}
        <div className="lg:col-span-7 flex flex-col text-left w-full lg:pl-4 relative">
          {/* Karakter SVG */}
          {showCharacter && (
            <div className="absolute top-0 right-0 md:right-[-110px] hidden lg:block w-[100px] h-[100px]">
              <Image
                src={visual.characterPath}
                alt="Character"
                width={100}
                height={100}
                className="object-contain"
                priority // Tambahkan properti ini!
              />
            </div>
          )}

          {/* Judul */}
          <h1
            className="font-['Nohemi'] text-[40px] md:text-[56px] font-semibold leading-tight mb-2"
            style={{ color: visual.navbarColor }}
          >
            {isLoading ? (
              <Skeleton className="w-56 h-12 block" />
            ) : (
              product?.title
            )}
          </h1>

          {/* Subtitle (bottle_size + perfume_type dari API) */}
          <p className="font-['Nohemi'] text-[18px] md:text-[20px] font-medium text-[#5D5D5D] mb-4">
            {isLoading ? <Skeleton className="w-40 h-5 block" /> : subtitle}
          </p>

          {/* Deskripsi */}
          <p className="font-['Parkinsans'] text-[15px] md:text-[16px] font-normal text-[#5D5D5D] leading-relaxed max-w-2xl mb-8">
            {isLoading ? (
              <Skeleton className="w-full h-16 block" />
            ) : (
              (product?.description ?? "")
            )}
          </p>

          {/* Card Notes — dari top_note, middle_note, base_note API */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm max-w-2xl mb-8 flex flex-col gap-5">
            <h4
              className="font-['Nohemi'] text-[18px] md:text-[20px] font-bold"
              style={{ color: visual.navbarColor }}
            >
              Notes {isLoading ? "" : product?.title}
            </h4>

            {[
              { label: "Top Note", value: product?.top_note },
              { label: "Middle Note", value: product?.middle_note },
              { label: "Base Note", value: product?.base_note },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <span
                  className="text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center"
                  style={{ backgroundColor: visual.navbarColor }}
                >
                  {label}
                </span>
                <span
                  className="text-[14px] font-medium"
                  style={{ color: `${visual.navbarColor}CC` }}
                >
                  {isLoading ? (
                    <Skeleton className="w-40 h-4 inline-block" />
                  ) : (
                    (value ?? "-")
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Harga */}
          <div className="font-['Nohemi'] flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 md:gap-8 mb-8 md:mb-12 md:mt-5">
            <span
              className="text-[22px] md:text-[24px] font-medium"
              style={{ color: visual.navbarColor }}
            >
              Harga
            </span>
            <span className="text-[36px] md:text-[40px] font-semibold text-[#5D5D5D]">
              {isLoading ? (
                <Skeleton className="w-36 h-10 block" />
              ) : (
                formatProductPrice(product?.price)
              )}
            </span>
          </div>

          {/* Notifikasi Cart */}
          {cartMessage && (
            <div
              className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
                cartStatus === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {cartMessage}
            </div>
          )}

          {/* Notifikasi Wishlist */}
          {wishlistMessage && (
            <div
              className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
                wishlistStatus === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {wishlistMessage}
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex flex-wrap items-center gap-4 max-w-2xl">
            {/* Tambah ke Keranjang */}
            <button
              onClick={handleAddToCart}
              disabled={cartStatus === "loading"}
              className="font-['Nohemi'] flex items-center justify-center gap-2 bg-white text-[16px] font-bold px-6 py-4 rounded-full border shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                color: visual.navbarColor,
                borderColor: `${visual.navbarColor}33`,
              }}
            >
              <div
                className="w-5 h-5"
                style={{
                  backgroundColor: visual.navbarColor,
                  WebkitMaskImage: `url(/src/images/belanja/detail/purpose/cart.svg)`,
                  maskImage: `url(/src/images/belanja/detail/purpose/cart.svg)`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
              {cartStatus === "loading"
                ? "Menambahkan..."
                : "Tambah ke Keranjang"}
            </button>

            {/* Beli Langsung */}
            <button
              onClick={() =>
                router.push(`/checkout?type=buynow&productId=${id}`)
              }
              className="font-['Nohemi'] flex items-center justify-center gap-2 text-white text-[16px] font-medium px-8 py-4 rounded-full shadow-md active:scale-95 transition-all duration-200"
              style={{ backgroundColor: visual.navbarColor }}
            >
              Beli langsung
              <Image
                src="/src/images/belanja/detail/purpose/right-arrow.svg"
                alt="Arrow Icon"
                width={20}
                height={20}
                className="object-contain w-5 h-5 brightness-0 invert"
                priority
              />
            </button>

            {/* Wishlist */}
            <button
              onClick={handleAddToWishlist}
              disabled={
                wishlistStatus === "loading" || wishlistStatus === "success"
              }
              className="w-14 h-14 bg-white rounded-full flex justify-center items-center border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Add to Wishlist"
              style={{ borderColor: `${visual.navbarColor}33` }}
            >
              <div
                className="w-5 h-5"
                style={{
                  backgroundColor:
                    wishlistStatus === "success"
                      ? "#22c55e"
                      : visual.navbarColor,
                  WebkitMaskImage: `url(/src/images/belanja/detail/purpose/love.svg)`,
                  maskImage: `url(/src/images/belanja/detail/purpose/love.svg)`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Lingkaran bawah dinamis */}
      {showDivider && (
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
      )}
    </section>
  );
}

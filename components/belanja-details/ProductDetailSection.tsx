"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import {
  getProduct,
  addToCart,
  addToWishlist,
  Product,
} from "@/lib/api";

// Data visual statis berdasarkan ID — tetap dipakai karena backend tidak menyediakan warna UI
const productsData: Record<
  string,
  {
    navbarColor: string;
    badge: string;
    topNote: string;
    middleNote: string;
    baseNote: string;
    images: string[];
    characterPath: string;
  }
> = {
  "1": {
    navbarColor: "#1172BA",
    badge: "Optimis",
    topNote: "Bergamot • Lemon Italia • Daun Mint",
    middleNote: "Lavender • Iris • Geranium",
    baseNote: "Cedarwood • Musk Putih • Amber",
    images: [
      "/src/images/belanja/detail/purpose/gambar1.png",
      "/src/images/belanja/detail/purpose/gambar2.png",
      "/src/images/belanja/detail/purpose/gambar3.png",
    ],
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  "2": {
    navbarColor: "#5EA14A",
    badge: "Damai",
    topNote: "Green Tea • Bergamot • Mandarin Orange",
    middleNote: "Jasmine • Camelia • White Violet",
    baseNote: "Musk • Cedarwood • Amber",
    images: [
      "/src/images/belanja/detail/peaceful/gambar1.png",
      "/src/images/belanja/detail/peaceful/gambar2.png",
      "/src/images/belanja/detail/peaceful/gambar3.png",
    ],
    characterPath: "/src/images/belanja/detail/peaceful-character.svg",
  },
  "3": {
    navbarColor: "#E33D35",
    badge: "Berani",
    topNote: "Spicy Pepper • Pink Grapefruit",
    middleNote: "Lavender • Vetiver",
    baseNote: "Leather • Patchouli • Oakmoss",
    images: [
      "/src/images/belanja/detail/rebel/gambar1.png",
      "/src/images/belanja/detail/rebel/gambar2.png",
      "/src/images/belanja/detail/rebel/gambar3.png",
    ],
    characterPath: "/src/images/belanja/detail/rebel-character.svg",
  },
  "4": {
    navbarColor: "#DD74A5",
    badge: "Manis",
    topNote: "Red Berries • Pear • Mandarin",
    middleNote: "Gardenia • Frangipani",
    baseNote: "Patchouli • Brown Sugar",
    images: [
      "/src/images/belanja/detail/sweet/gambar1.png",
      "/src/images/belanja/detail/sweet/gambar2.png",
      "/src/images/belanja/detail/sweet/gambar3.png",
    ],
    characterPath: "/src/images/belanja/detail/sweet-character.svg",
  },
};

// Fallback data lokal jika API belum tersedia
const FALLBACK_PRODUCTS: Record<string, { title: string; price: string; desc: string }> = {
  "1": { title: "Purpose Prestige", price: "Rp189.000", desc: "Sebuah komposisi elegan untuk kamu yang menemukan kekuatan dalam ketenangan." },
  "2": { title: "Peaceful Calm", price: "Rp199.000", desc: "Keberanian dan semangat untuk mengekspresikan diri lewat kesegaran alami." },
  "3": { title: "Rabel Brave", price: "Rp179.000", desc: "Aroma menenangkan yang menyatu dengan diri, memberikan energi keberanian." },
  "4": { title: "Sweet Shy", price: "Rp189.000", desc: "Aroma manis lembut menenangkan yang menyatu harmonis dengan kehangatan kulitmu." },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace("IDR", "Rp");
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
  const params = useParams();
  const id = forcedId || (params?.id as string) || "1";

  const { setNavbarAndFooterColor } = useNavbarColor();
  const { footerColor } = useNavbarColor();

  // State produk dari API
  const [apiProduct, setApiProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // State aksi cart & wishlist
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [wishlistStatus, setWishlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cartMessage, setCartMessage] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil data visual statis (warna, gambar, notes) berdasarkan ID
  const visual = productsData[id] ?? productsData["1"];

  // Ambil produk dari API, fallback ke data lokal
  useEffect(() => {
    setIsLoadingProduct(true);
    getProduct(id)
      .then((data) => setApiProduct(data))
      .catch(() => setApiProduct(null))
      .finally(() => setIsLoadingProduct(false));
  }, [id]);

  // Data final produk (gabungan API + fallback lokal)
  const fallback = FALLBACK_PRODUCTS[id] ?? FALLBACK_PRODUCTS["1"];
  const productTitle = apiProduct?.name ?? fallback.title;
  const productDesc = apiProduct?.description ?? fallback.desc;
  const productPrice = apiProduct?.price
    ? formatPrice(apiProduct.price)
    : fallback.price;

  // Set warna navbar & footer berdasarkan visual produk
  useEffect(() => {
    setNavbarAndFooterColor(visual.navbarColor);
  }, [id, visual.navbarColor, setNavbarAndFooterColor]);

  // Auto-slide gambar
  useEffect(() => {
    const images = visual.images;
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [visual.images]);

  const currentImages = visual.images.slice(0, 3);

  // ---------------------------------------------------------------------------
  // Handler: Tambah ke Keranjang
  // ---------------------------------------------------------------------------
  const handleAddToCart = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setCartMessage('Silakan login terlebih dahulu.');
      setCartStatus('error');
      return;
    }
    setCartStatus('loading');
    setCartMessage('');
    try {
      await addToCart(Number(id), 1);
      setCartStatus('success');
      setCartMessage('Produk berhasil ditambahkan ke keranjang!');
    } catch (err: unknown) {
      setCartStatus('error');
      setCartMessage(err instanceof Error ? err.message : 'Gagal menambahkan ke keranjang.');
    }
  };

  // ---------------------------------------------------------------------------
  // Handler: Tambah ke Wishlist
  // ---------------------------------------------------------------------------
  const handleAddToWishlist = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setWishlistMessage('Silakan login terlebih dahulu.');
      setWishlistStatus('error');
      return;
    }
    setWishlistStatus('loading');
    setWishlistMessage('');
    try {
      await addToWishlist(Number(id));
      setWishlistStatus('success');
      setWishlistMessage('Produk ditambahkan ke wishlist!');
    } catch (err: unknown) {
      setWishlistStatus('error');
      setWishlistMessage(err instanceof Error ? err.message : 'Gagal menambahkan ke wishlist.');
    }
  };

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
        {/* ================= BAGIAN KIRI: IMAGE SLIDER ================= */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full select-none">
          {/* Gambar Utama Slide */}
          <div
            className="w-full max-w-[482px] aspect-square rounded-[24px] overflow-hidden flex justify-center items-center relative shadow-sm"
            style={{ backgroundColor: visual.navbarColor }}
          >
            {currentImages.map((imgSrc, index) => {
              const isGambar2 = imgSrc.includes("gambar2.png");
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-2000 ease-in-out flex justify-center items-center ${
                    currentIndex === index
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={imgSrc}
                      alt={`Gambar Utama Produk ${index + 1}`}
                      fill
                      className={isGambar2 ? "object-contain" : "object-cover"}
                      priority={index === 0}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= BAGIAN INDIKATOR / DOTS ================= */}
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

          {/* ================= BAGIAN THUMBNAIL ================= */}
          <div className={`grid gap-4 w-full max-w-[482px] ${currentImages.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {currentImages.map((image, index) => {
              const isGambar2 = image.includes("gambar2.png");
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-full aspect-square flex-shrink-0 rounded-[16px] overflow-hidden border-2 transition-all duration-300 flex justify-center items-center ${
                    currentIndex === index
                      ? "border-opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: currentIndex === index ? visual.navbarColor : "transparent",
                    backgroundColor: isGambar2 ? visual.navbarColor : "transparent",
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${productTitle} thumbnail ${index + 1}`}
                      fill
                      className={isGambar2 ? "object-contain" : "object-cover"}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= BAGIAN KANAN: DETAIL INFO PRODUK ================= */}
        <div className="lg:col-span-7 flex flex-col text-left w-full lg:pl-4 relative">
          {/* Karakter SVG Dinamis */}
          {showCharacter && (
            <div className="absolute top-0 right-0 md:right-[-110px] hidden lg:block w-[100px] h-[100px] opacity-100">
              <Image
                src={visual.characterPath}
                alt="Character"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          )}

          {/* Judul Produk */}
          <h1
            className="font-['Nohemi'] text-[40px] md:text-[56px] font-semibold leading-tight mb-2"
            style={{ color: visual.navbarColor }}
          >
            {isLoadingProduct ? (
              <span className="inline-block w-48 h-12 bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              productTitle
            )}
          </h1>

          <p className="font-['Nohemi'] text-[18px] md:text-[20px] font-medium text-[#5D5D5D] mb-4">
            50ml • Eau de Parfum 20%
          </p>

          <p className="font-['Parkinsans'] text-[15px] md:text-[16px] font-normal text-[#5D5D5D] leading-relaxed max-w-2xl mb-8">
            {isLoadingProduct ? (
              <span className="inline-block w-full h-16 bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              productDesc
            )}
          </p>

          {/* Card Notes */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm max-w-2xl mb-8 flex flex-col gap-5">
            <h4
              className="font-['Nohemi'] text-[18px] md:text-[20px] font-bold"
              style={{ color: visual.navbarColor }}
            >
              Notes {productTitle}
            </h4>

            {[
              { label: "Top Note", value: visual.topNote },
              { label: "Middle Note", value: visual.middleNote },
              { label: "Base Note", value: visual.baseNote },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
                  {value}
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
              {isLoadingProduct ? (
                <span className="inline-block w-32 h-10 bg-gray-200 animate-pulse rounded-xl" />
              ) : (
                productPrice
              )}
            </span>
          </div>

          {/* Notifikasi Cart */}
          {cartMessage && (
            <div
              className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
                cartStatus === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {cartMessage}
            </div>
          )}

          {/* Notifikasi Wishlist */}
          {wishlistMessage && (
            <div
              className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
                wishlistStatus === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {wishlistMessage}
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex flex-wrap items-center gap-4 max-w-2xl">
            {/* Tombol Tambah ke Keranjang */}
            <button
              onClick={handleAddToCart}
              disabled={cartStatus === 'loading'}
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
              {cartStatus === 'loading' ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </button>

            {/* Tombol Beli Langsung */}
            <button
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
              />
            </button>

            {/* Tombol Wishlist */}
            <button
              onClick={handleAddToWishlist}
              disabled={wishlistStatus === 'loading' || wishlistStatus === 'success'}
              className="w-14 h-14 bg-white rounded-full flex justify-center items-center border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Add to Wishlist"
              style={{ borderColor: `${visual.navbarColor}33` }}
            >
              <div
                className="w-5 h-5"
                style={{
                  backgroundColor: wishlistStatus === 'success' ? '#22c55e' : visual.navbarColor,
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

      {/* Sticky lingkaran bawah dinamis */}
      {showDivider && (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none z-0">
          <div className="flex w-max gap-[15px] animate-slide-right-40s">
            {Array.from({ length: 80 }).map((_, index) => (
              <div
                key={`bottom-${index}`}
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
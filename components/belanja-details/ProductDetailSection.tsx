"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation"; // 1. Import useParams untuk ambil ID dari URL
import { useNavbarColor } from "@/context/NavbarColorContext"; // 2. Import context navbar

// 3. Pindahkan data spek produk ke objek berdasarkan ID supaya mudah dipanggil
const productsData: Record<
  string,
  {
    title: string;
    price: string;
    navbarColor: string;
    badge: string;
    desc: string;
    topNote: string;
    middleNote: string;
    baseNote: string;
    images: string[];
    characterPath: string; // Tambahkan ini
  }
> = {
  "1": {
    title: "Purpose Prestige",
    price: "Rp189.000",
    navbarColor: "#1172BA",
    badge: "Optimis",
    desc: "Sebuah komposisi elegan untuk kamu yang menemukan kekuatan dalam ketenangan. Sentuhan citrus segar berpadu dengan kehangatan kayu cedarwood, menghadirkan rasa percaya diri yang tidak perlu berbicara keras.",
    topNote: "Bergamot • Lemon Italia • Daun Mint",
    middleNote: "Lavender • Iris • Geranium",
    baseNote: "Cedarwood • Musk Putih • Amber",
    images: [
      "/src/images/belanja/detail/purpose/gambar-bawah-card-ke2.png",
      "/src/images/belanja/detail/purpose/gambar-card-utama.png",
      "/src/images/belanja/detail/purpose/gambar-bawah-card-ke2.png",
    ],
    characterPath: "/src/images/belanja/detail/purpose-character.svg",
  },
  "2": {
    title: "Peaceful Calm",
    price: "Rp199.000",
    navbarColor: "#5EA14A",
    badge: "Damai",
    desc: "Keberanian dan semangat untuk mengekspresikan diri lewat kesegaran alami yang menenangkan.",
    topNote: "Green Tea • Bergamot • Mandarin Orange",
    middleNote: "Jasmine • Camelia • White Violet",
    baseNote: "Musk • Cedarwood • Amber",
    images: [
      "/src/images/section 5/peaceful-calm.png", // Sesuaikan dengan path gambar kamu
    ],
    characterPath: "/src/images/belanja/detail/peaceful-character.svg",
  },
  "3": {
    title: "Rabel Brave",
    price: "Rp179.000",
    navbarColor: "#E33D35",
    badge: "Berani",
    desc: "Aroma menenangkan yang menyatu dengan diri, memberikan energi keberanian sepanjang hari.",
    topNote: "Spicy Pepper • Pink Grapefruit",
    middleNote: "Lavender • Vetiver",
    baseNote: "Leather • Patchouli • Oakmoss",
    images: ["/src/images/section 5/rabel-brave.png"],
    characterPath: "/src/images/belanja/detail/rebel-character.svg",
  },
  "4": {
    title: "Sweet Shy",
    price: "Rp189.000",
    navbarColor: "#DD74A5",
    badge: "Manis",
    desc: "Aroma manis lembut menenangkan yang menyatu harmonis dengan kehangatan kulitmu.",
    topNote: "Red Berries • Pear • Mandarin",
    middleNote: "Gardenia • Frangipani",
    baseNote: "Patchouli • Brown Sugar",
    images: ["/src/images/section 5/sweet-shy.png"],
    characterPath: "/src/images/belanja/detail/sweet-character.svg",
  },
};

export default function ProductDetailSection() {
  const params = useParams();
  const id = (params?.id as string) || "1"; // Ambil ID dari URL (contoh: /halaman/belanja/2 -> id = "2")

  const { setNavbarAndFooterColor } = useNavbarColor();
  const { footerColor } = useNavbarColor(); // Ambil footerColor

  // Ambil data produk berdasarkan ID dari URL, jika tidak ketemu redirect/fallback ke ID 1
  const product = productsData[id] || productsData["1"];

  const [currentIndex, setCurrentIndex] = useState(0);

  // ================= PENTING: OTOMATIS GANTI WARNA NAVBAR DI SINI =================
  useEffect(() => {
    if (product) {
      setNavbarAndFooterColor(product.navbarColor); // Set warna navbar dan footer sesuai warna produk aktif
    }
  }, [id, product, setNavbarAndFooterColor]);

  useEffect(() => {
    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % product.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [product.images.length]);

  // Mengamankan jika ada gambar kosong/thumbnail bermasalah saat data dinamis
  const currentImages =
    product.images.length > 0
      ? product.images
      : ["/src/images/belanja/detail/purpose/gambar-card-utama.png"];

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
          {/* Background dinamis mengikuti produk */}
          <div
            className="w-full max-w-[482px] aspect-square rounded-[24px] overflow-hidden flex justify-center items-center relative shadow-sm"
            style={{ backgroundColor: product.navbarColor }}
          >
            {/* Mapping semua gambar agar bertumpuk dan beranimasi fade halus */}
            {currentImages.map((imgSrc, index) => (
              <Image
                key={index}
                src={imgSrc}
                alt={`Gambar Utama Produk ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-2000 ease-in-out ${
                  currentIndex === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
                priority={index === 0}
              />
            ))}
          </div>

          {/* Indicator Titik (Dots) */}
          <div className="flex gap-2.5 my-5 justify-center w-full max-w-[482px]">
            {currentImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? "w-6" : "bg-gray-300 w-2.5"}`}
                style={{
                  backgroundColor:
                    currentIndex === index ? product.navbarColor : undefined,
                }}
                aria-label={`Ke slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail Gambar */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[482px]">
            {currentImages.map((imgSrc, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-full aspect-square rounded-[16px] overflow-hidden flex justify-center items-center border-2 transition-all ${currentIndex === index ? "border-white scale-95 shadow-lg" : "border-transparent hover:border-white/50"}`}
                style={{ backgroundColor: product.navbarColor }}
              >
                <Image
                  src={imgSrc}
                  alt={`Thumbnail ${index + 1}`}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full drop-shadow-md"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ================= BAGIAN KANAN: DETAIL INFO PRODUK ================= */}
        <div className="lg:col-span-7 flex flex-col text-left w-full lg:pl-4 relative">
          {/* Karakter SVG Dinamis (Posisi Pojok Kanan Atas) */}
          <div className="absolute top-0 right-0 md:right-[-110px] hidden lg:block w-[100px] h-[100px] opacity-100">
            <Image
              src={product.characterPath}
              alt="Character"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Warna teks judul dinamis */}
          <h1
            className="font-['Nohemi'] text-[40px] md:text-[56px] font-semibold leading-tight mb-2"
            style={{ color: product.navbarColor }}
          >
            {product.title}
          </h1>

          <p className="font-['Nohemi'] text-[18px] md:text-[20px] font-medium text-[#5D5D5D] mb-4">
            50ml • Eau de Parfum 20%
          </p>

          <p className="font-['Parkinsans'] text-[15px] md:text-[16px] font-normal text-[#5D5D5D] leading-relaxed max-w-2xl mb-8">
            {product.desc}
          </p>

          {/* Card Notes */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm max-w-2xl mb-8 flex flex-col gap-5">
            <h4
              className="font-['Nohemi'] text-[18px] md:text-[20px] font-bold"
              style={{ color: product.navbarColor }}
            >
              Notes {product.title}
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span
                className="text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center"
                style={{ backgroundColor: product.navbarColor }}
              >
                Top Note
              </span>
              <span
                className="text-[14px] font-medium"
                style={{ color: `${product.navbarColor}CC` }}
              >
                {product.topNote}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span
                className="text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center"
                style={{ backgroundColor: product.navbarColor }}
              >
                Middle Note
              </span>
              <span
                className="text-[14px] font-medium"
                style={{ color: `${product.navbarColor}CC` }}
              >
                {product.middleNote}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span
                className="text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center"
                style={{ backgroundColor: product.navbarColor }}
              >
                Base Note
              </span>
              <span
                className="text-[14px] font-medium"
                style={{ color: `${product.navbarColor}CC` }}
              >
                {product.baseNote}
              </span>
            </div>
          </div>

          <div className="font-['Nohemi'] flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 md:gap-8 mb-8 md:mb-12 md:mt-5">
            <span
              className="text-[22px] md:text-[24px] font-medium"
              style={{ color: product.navbarColor }}
            >
              Harga
            </span>
            <span className="text-[36px] md:text-[40px] font-semibold text-[#5D5D5D]">
              {product.price}
            </span>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-wrap items-center gap-4 max-w-2xl">
            <button
              className="font-['Nohemi'] flex items-center justify-center gap-2 bg-white text-[16px] font-bold px-6 py-4 rounded-full border shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200"
              style={{
                color: product.navbarColor,
                borderColor: `${product.navbarColor}33`,
              }}
            >
              {/* Ganti bagian Image untuk ikon cart dengan kode ini */}
              <div
                className="w-5 h-5 md:bottom-10"
                style={{
                  backgroundColor: product.navbarColor,
                  WebkitMaskImage: `url(/src/images/belanja/detail/purpose/cart.svg)`,
                  maskImage: `url(/src/images/belanja/detail/purpose/cart.svg)`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
              Tambah ke Keranjang
            </button>

            <button
              className="font-['Nohemi'] flex items-center justify-center gap-2 text-white text-[16px] font-medium px-8 py-4 rounded-full shadow-md active:scale-95 transition-all duration-200"
              style={{ backgroundColor: product.navbarColor }}
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

            <button
              className="w-14 h-14 bg-white rounded-full flex justify-center items-center border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200"
              aria-label="Add to Wishlist"
              style={{ borderColor: `${product.navbarColor}33` }} // Optional: border sedikit mengikuti warna produk agar senada
            >
              <div
                className="w-5 h-5"
                style={{
                  backgroundColor: product.navbarColor,
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
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none z-0">
        <div className="flex w-max gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`bottom-${index}`}
              className="w-[46px] h-[46px] rounded-full flex-shrink-0"
              style={{ backgroundColor: product.navbarColor }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

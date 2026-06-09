"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductDetailSection() {
    const sliderImages = [
        "/src/images/belanja/detail/purpose/gambar-card-utama.png", // Contoh gambar slide 2
        "/src/images/belanja/detail/purpose/gambar-bawah-card-ke2.png",
        "/src/images/belanja/detail/purpose/gambar-bawah-card-ke2.png",  // Contoh gambar slide 3
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [sliderImages.length]);

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

                    {/* Gambar Utama - Background diubah ke bg-[#1172BA] */}
                    <div className="w-full max-w-[482px] aspect-square bg-[#1172BA] rounded-[24px] overflow-hidden flex justify-center items-center relative shadow-sm">
                        <Image
                            src={sliderImages[currentIndex]}
                            alt="Gambar Utama Produk"
                            fill // Menggunakan fill sebagai pengganti width dan height
                            className="object-cover transition-all duration-500 ease-in-out" // object-contain diubah ke object-cover
                            priority
                        />
                    </div>

                    {/* Indicator Titik (Dots) */}
                    <div className="flex gap-2.5 my-5 justify-center w-full max-w-[482px]">
                        {sliderImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-[#1172BA] w-6" : "bg-gray-300 w-2.5"
                                    }`}
                                aria-label={`Ke slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* 3 Gambar Thumbnail - Background diubah ke bg-[#1172BA] */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[482px]">
                        {sliderImages.map((imgSrc, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                // Border active diubah ke putih (border-white) agar kontras dengan bg biru
                                className={`w-full aspect-square bg-[#1172BA] rounded-[16px] overflow-hidden flex justify-center items-center border-2 transition-all ${currentIndex === index ? "border-white scale-95 shadow-lg" : "border-transparent hover:border-white/50"
                                    }`}
                            >
                                <Image
                                    src={imgSrc}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={160}
                                    height={160}
                                    // Cukup ubah object-contain menjadi object-cover
                                    className="object-cover w-full h-full drop-shadow-md"
                                />
                            </button>
                        ))}
                    </div>
                </div>


                {/* ================= BAGIAN KANAN: DETAIL INFO PRODUK ================= */}
                <div className="lg:col-span-7 flex flex-col text-left w-full lg:pl-4">

                    <h1 className="font-['Nohemi'] text-[40px] md:text-[56px] font-semibold text-[#1172BA] leading-tight mb-2">
                        Purpose Prestige
                    </h1>

                    <p className="font-['Nohemi'] text-[18px] md:text-[20px] font-medium text-[#5D5D5D] mb-4">
                        50ml • Eau de Parfum 20%
                    </p>

                    <p className="font-['Parkinsans'] text-[15px] md:text-[16px] font-normal text-[#5D5D5D] leading-relaxed max-w-2xl mb-8">
                        Sebuah komposisi elegan untuk kamu yang menemukan kekuatan dalam ketenangan.
                        Sentuhan citrus segar berpadu dengan kehangatan kayu cedarwood, menghadirkan rasa
                        percaya diri yang tidak perlu berbicara keras.
                    </p>

                    <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm max-w-2xl mb-8 flex flex-col gap-5">
                        <h4 className="font-['Nohemi'] text-[18px] md:text-[20px] font-bold text-[#1172BA]">
                            Notes Purpose Prestige
                        </h4>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="bg-[#1172BA] text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center">
                                Top Note
                            </span>
                            <span className="text-[14px] font-medium text-[#1172BACC]">
                                Bergamot • Lemon Italia • Daun Mint
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="bg-[#1172BA] text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center">
                                Middle Note
                            </span>
                            <span className="text-[14px] font-medium text-[#1172BACC]">
                                Lavender • Iris • Geranium
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="bg-[#1172BA] text-white text-[14px] font-medium px-4 py-1.5 rounded-full min-w-[110px] text-center">
                                Base Note
                            </span>
                            <span className="text-[14px] font-medium text-[#1172BACC]">
                                Cedarwood • Musk Putih • Amber
                            </span>
                        </div>
                    </div>

                    <div className="font-['Nohemi'] flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 md:gap-8 mb-8 md:mb-12 md:mt-5">
                        <span className="text-[22px] md:text-[24px] font-medium text-[#1D7BC1]">
                            Harga
                        </span>
                        <span className="text-[36px] md:text-[40px] font-semibold text-[#5D5D5D]">
                            Rp189.000
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 max-w-2xl">

                        <button className="font-['Nohemi'] flex items-center justify-center gap-2 bg-white text-[#1172BA] text-[16px] font-bold px-6 py-4 rounded-full border border-[#1172BA]/20 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200">
                            <Image
                                src="/src/images/belanja/detail/purpose/cart.svg"
                                alt="Cart Icon"
                                width={20}
                                height={20}
                                className="object-contain w-5 h-5"
                            />
                            Tambah ke Keranjang
                        </button>

                        <button className="font-['Nohemi'] flex items-center justify-center gap-2 bg-[#1172BA] text-white text-[16px] font-medium px-8 py-4 rounded-full shadow-md hover:bg-[#1172BA]/90 active:scale-95 transition-all duration-200">
                            Beli langsung
                            <Image
                                src="/src/images/belanja/detail/purpose/right-arrow.svg"
                                alt="Arrow Icon"
                                width={20}
                                height={20}
                                className="object-contain w-5 h-5 brightness-0 invert"
                            />
                        </button>

                        <button className="w-14 h-14 bg-white rounded-full flex justify-center items-center border border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200" aria-label="Add to Wishlist">
                            <Image
                                src="/src/images/belanja/detail/purpose/love.svg"
                                alt="Love Icon"
                                width={20}
                                height={20}
                                className="object-contain w-5 h-5"
                            />
                        </button>
                    </div>

                </div>
            </div>

            {/* ================= STICKY LINGKARAN DIVIDER BAWAH ================= */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none z-0">
                <div className="flex w-max gap-[15px] animate-slide-right-40s">
                    {Array.from({ length: 80 }).map((_, index) => (
                        <div
                            key={`bottom-${index}`}
                            className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0"
                        />
                    ))}
                </div>
            </div>

        </section>
    );
}
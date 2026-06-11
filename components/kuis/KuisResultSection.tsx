"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useNavbarColor } from "@/context/NavbarColorContext";
import ProductDetailSection from "@/components/belanja-details/ProductDetailSection";

// --- DATA MAPPING HASIL KUIS ---
const RESULT_DATA: Record<string, any> = {
  purpose_prestige: {
    id: "1",
    color: "#1172BA",
    title: "Kamu adalah \nPurpose Prestige",
    desc: "Menghadirkan aroma yang \nmerefleksikan ketenangan, \nkepercayaan diri, dan kejelasan tujuan.",
    bgImage: "/src/images/kuis/purpose-kanan.png",
    productImage: "/src/images/kuis/purpose-produk.png",
  },
  peaceful_calm: {
    id: "2",
    color: "#5EA14A",
    title: "Kamu adalah \nPeaceful Calm",
    desc: "Menghadirkan aroma yang \nmenenangkan, seimbang, dan \nmenyatu dengan diri.",
    bgImage: "/src/images/kuis/peaceful-kanan.png",
    productImage: "/src/images/kuis/peaceful-produk.png",
  },
  rebel_brave: {
    id: "3",
    color: "#E33D35",
    title: "Kamu adalah \nRebel Brave",
    desc: "Merepresentasikan keberanian, \nenergi, dan semangat untuk \nmengekspresikan diri.",
    bgImage: "/src/images/kuis/rebel-kanan.png",
    productImage: "/src/images/kuis/rebel-produk.png",
  },
  sweet_shy: {
    id: "4",
    color: "#DD74A5",
    title: "Kamu adalah \nSweet Shy",
    desc: "Menghadirkan aroma lembut yang \nmerefleksikan sisi manis, hangat, dan \npenuh empati.",
    bgImage: "/src/images/kuis/sweet-kanan.png",
    productImage: "/src/images/kuis/sweet-produk.png",
  },
};

interface KuisResultProps {
  resultKey: "purpose_prestige" | "peaceful_calm" | "rebel_brave" | "sweet_shy";
  onRestart: () => void;
}

export default function KuisResultSection({
  resultKey,
  onRestart,
}: KuisResultProps) {
  const { setNavbarAndFooterColor } = useNavbarColor();
  const data = RESULT_DATA[resultKey];
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      setNavbarAndFooterColor(data.color);
    }
  }, [data, setNavbarAndFooterColor]);

  const scrollToDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!data) return null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* ================= CARD HASIL UTAMA (ATAS) ================= */}
      <div className="mb-0 w-full max-w-7xl flex justify-center px-4 md:px-[20px] md:mt-[40px]">
        <div
          className="relative w-full h-[540px] rounded-[24px] overflow-hidden flex shadow-xl transition-colors duration-500"
          style={{ backgroundColor: data.color }}
        >
          {/* SISI KIRI: TEKS & TOMBOL */}
          <div className="relative z-20 w-full md:w-1/2 flex flex-col justify-center pl-10 md:pl-20 pr-4">
            <h1 className="font-['Nohemi'] text-[48px] font-semibold text-white leading-tight whitespace-pre-line mb-6">
              {data.title}
            </h1>
            <p className="font-sans text-[24px] font-normal text-white leading-relaxed mb-10 opacity-90 whitespace-pre-line">
              {data.desc}
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Tombol Lihat Produk */}
              <button
                onClick={scrollToDetail}
                className="font-['Nohemi'] flex items-center gap-3 bg-white text-[16px] font-normal py-[16px] px-[28px] rounded-full transition-transform active:scale-95 shadow-md"
                style={{ color: data.color }}
              >
                Lihat Produk
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Tombol Ulangi Kuis */}
              <button
                onClick={onRestart}
                className="font-['Nohemi'] flex items-center gap-3 border border-white text-white text-[16px] font-normal py-[16px] px-[28px] rounded-full transition-all hover:bg-white/10 active:scale-95"
                style={{ backgroundColor: data.color }}
              >
                Ulangi Kuis
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>

          {/* SISI KANAN: GAMBAR PRODUK */}
          <div className="absolute top-0 right-0 h-full w-full md:w-[700px] pointer-events-none overflow-visible">
            {/* Background Image z-0 */}
            <div className="absolute inset-0 z-0 flex items-end justify-end">
              <Image
                src={data.bgImage}
                alt="Background Decoration"
                width={500}
                height={500}
                quality={100} // Memaksimalkan kualitas gambar ke 100%
                priority // Membuka gambar langsung tanpa efek pemuatan malas (lazy load)
                className="object-contain object-bottom-right opacity-100 brightness-100" // Memastikan opacity & kecerahan penuh
              />
            </div>
            
            {/* Product Image z-10 */}
            <div className="absolute inset-0 z-10 flex items-end justify-end">
              <Image
                src={data.productImage}
                alt="Product Bottle"
                width={800}
                height={700}
                quality={100} // Memaksimalkan kualitas gambar ke 100%
                priority // Menginstruksikan Next.js untuk memuat dengan prioritas utama
                className="object-contain object-bottom-right transform scale-140 origin-bottom-right transition-transform duration-500 opacity-100 brightness-100" // Menjaga kecerahan asli gambar
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BAGIAN DETAIL PRODUK (BAWAH) ================= */}
      <div ref={detailRef} className="w-full">
        <ProductDetailSection
          forcedId={data.id}
          showDivider={false}
          showCharacter={false}
        />
      </div>
    </div>
  );
}
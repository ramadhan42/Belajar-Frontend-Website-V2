"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getProducts,
  getProductImageUrl,
  formatProductPrice,
  Product,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Data visual statis — hanya warna & badge, dipetakan dari personality_type
// ---------------------------------------------------------------------------
const VISUAL_BY_PERSONALITY: Record<
  string,
  {
    imgBg: string;
    cardBg: string;
    textColor: string;
    descColor: string;
    btnBg: string;
    badge: string;
  }
> = {
  purpose_prestige: {
    imgBg: "bg-[#1172BA]",
    cardBg: "bg-[#9CD6FF]",
    textColor: "text-[#1172BA]",
    descColor: "text-[#1172BAB2]",
    btnBg: "bg-[#1172BA]",
    badge: "Optimis",
  },
  peaceful_calm: {
    imgBg: "bg-[#5EA14A]",
    cardBg: "bg-[#C6F5B8]",
    textColor: "text-[#5EA14A]",
    descColor: "text-[#5EA14A]",
    btnBg: "bg-[#5EA14A]",
    badge: "Damai",
  },
  rebel_brave: {
    imgBg: "bg-[#E33D35]",
    cardBg: "bg-[#FFBBB5]",
    textColor: "text-[#E33D35]",
    descColor: "text-[#E33D35]",
    btnBg: "bg-[#E33D35]",
    badge: "Berani",
  },
  sweet_shy: {
    imgBg: "bg-[#DD74A5]",
    cardBg: "bg-[#F5D7E7]",
    textColor: "text-[#DD74A5]",
    descColor: "text-[#DD74A5]",
    btnBg: "bg-[#DD74A5]",
    badge: "Manis",
  },
};

// Fallback jika personality_type tidak dikenali
const VISUAL_FALLBACK = VISUAL_BY_PERSONALITY["purpose_prestige"];

// Skeleton card saat loading
function ProductSkeleton() {
  return (
    <div className="rounded-[16px] md:rounded-[24px] overflow-hidden border border-gray-100 flex flex-col animate-pulse">
      <div className="w-full aspect-square bg-gray-200" />
      <div className="p-3 md:p-6 bg-gray-100 flex flex-col gap-3 flex-grow">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function SecondSectionBelanja() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <section className="bg-white flex flex-col items-center text-center w-full pt-10 md:pt-10 pb-10 md:pb-10 px-2 md:px-4 relative overflow-hidden">
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[12px] md:h-[23px] pointer-events-none z-10">
        <style>{`
    @keyframes slideRightSeamless {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0%); }
    }
    .animate-slide-right-40s {
      animation: slideRightSeamless 80s linear infinite;
    }
  `}</style>

        {/* Mengubah gap-[10px] menjadi gap-[6px] di mobile, dan md:gap-[10px] di desktop */}
        <div className="flex w-max gap-[6px] md:gap-[10px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              // {/*
              //   Perubahan Ukuran:
              //   - Mobile: lebar/tinggi 24px dengan margin-top minus 12px (setengah dari 24px)
              //   - Desktop (md): kembali ke ukuran semula (46px dengan -mt 23px)
              // */}
              className="w-[24px] h-[24px] md:w-[46px] md:h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[12px] md:-mt-[23px]"
            />
          ))}
        </div>
      </div>

      {/* ================= GRID CARD PRODUK ================= */}
      {isLoading ? (
        <div className="relative z-10 w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 px-3 sm:px-4 py-5 mt-1">
          {[1, 2, 3, 4].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="relative z-10 w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 px-3 sm:px-4 py-5 mt-1"
        >
          {products.map((product, index) => {
            const visual =
              VISUAL_BY_PERSONALITY[product.personality_type ?? ""] ??
              VISUAL_FALLBACK;
            const imageUrl = getProductImageUrl(product.image_produk_belanja);

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{ rotate: index % 2 === 0 ? 5 : -5, scale: 1.02 }}
                onClick={() => router.push(`/belanja/${product.id}`)}
                className="font-nohemi relative rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col border border-gray-100 cursor-pointer"
              >
                {/* Bagian Atas: Gambar & Badge */}
                <div
                  className={`relative w-full md:h-[240px] aspect-square overflow-hidden ${visual.imgBg}`}
                >
                  <span
                    className={`absolute top-2 left-2 md:top-5 md:left-5 bg-white px-2 py-1 md:px-2 md:py-1 rounded-full text-[10px] md:text-[10px] font-bold z-20 ${visual.textColor}`}
                  >
                    {visual.badge}
                  </span>

                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      width={340}
                      height={340}
                      className="absolute bottom-[-18%] md:bottom-[-21%] left-[8%] md:left-[4%] w-[75%] md:w-[80%] max-w-none object-contain drop-shadow-xl rotate-[35deg] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Bagian Bawah: Teks & Info */}
                <div
                  className={`p-2.5 sm:p-3 md:p-4 flex flex-col flex-grow text-left ${visual.cardBg}`}
                >
                  <h3
                    className={`text-[12px] sm:text-[13px] md:text-[16px] font-bold mb-1 md:mb-2 ${visual.textColor}`}
                  >
                    {product.title}
                  </h3>

                  <p
                    className={`text-[10px] md:text-[10px] font-medium mb-3 md:mb-2 leading-[1.2] md:leading-[1.25] flex-grow line-clamp-3 ${visual.descColor}`}
                  >
                    {product.description ?? ""}
                  </p>

                  <div className="flex justify-between items-center mt-auto gap-1">
                    <span
                      className={`text-[11px] md:text-[10px] font-bold ${visual.textColor}`}
                    >
                      {formatProductPrice(product.price)}
                    </span>

                    <button
                      className={`w-7 h-7 rounded-full flex justify-center items-center text-white transition-transform hover:scale-105 active:scale-95 ${visual.btnBg}`}
                      aria-label={`Lihat detail ${product.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useNavbarColor } from "@/context/NavbarColorContext";
import ProductDetailSection from "@/components/belanja-details/ProductDetailSection";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import {
  getQuizResults,
  QuizPersonalityResultCopy,
} from "@/lib/api";
import { useTrackLocaleLoad } from "@/hooks/useTrackLocaleLoad";

/** Fallback jika API belum di-seed — tetap bilingual. */
const FALLBACK_RESULTS: Record<string, QuizPersonalityResultCopy> = {
  purpose_prestige: {
    personality_key: "purpose_prestige",
    title: "Kamu adalah, Purpose Prestige",
    description:
      "Menghadirkan aroma yang merefleksikan ketenangan, kepercayaan diri, dan kejelasan tujuan.",
    color: "#1172BA",
    bg_image: "/src/images/kuis/purpose-kanan.png",
    product_image: "/src/images/kuis/purpose-produk.png",
    forced_product_id: "1",
  },
  peaceful_calm: {
    personality_key: "peaceful_calm",
    title: "Kamu adalah, Peaceful Calm",
    description:
      "Menghadirkan aroma yang menenangkan, seimbang, dan menyatu dengan diri.",
    color: "#5EA14A",
    bg_image: "/src/images/kuis/peaceful-kanan.png",
    product_image: "/src/images/kuis/peaceful-produk.png",
    forced_product_id: "2",
  },
  rebel_brave: {
    personality_key: "rebel_brave",
    title: "Kamu adalah, Rebel Brave",
    description:
      "Merepresentasikan keberanian, energi, dan semangat untuk mengekspresikan diri.",
    color: "#E33D35",
    bg_image: "/src/images/kuis/rebel-kanan.png",
    product_image: "/src/images/kuis/rebel-produk.png",
    forced_product_id: "3",
  },
  sweet_shy: {
    personality_key: "sweet_shy",
    title: "Kamu adalah, Sweet Shy",
    description:
      "Menghadirkan aroma lembut yang merefleksikan sisi manis, hangat, dan penuh empati.",
    color: "#DD74A5",
    bg_image: "/src/images/kuis/sweet-kanan.png",
    product_image: "/src/images/kuis/sweet-produk.png",
    forced_product_id: "4",
  },
};

const FALLBACK_EN: Record<string, Pick<QuizPersonalityResultCopy, "title" | "description">> = {
  purpose_prestige: {
    title: "You are, Purpose Prestige",
    description:
      "Presenting a scent that reflects calmness, confidence, and clarity of purpose.",
  },
  peaceful_calm: {
    title: "You are, Peaceful Calm",
    description:
      "Presenting a soothing, balanced scent that feels at one with yourself.",
  },
  rebel_brave: {
    title: "You are, Rebel Brave",
    description:
      "Representing courage, energy, and the spirit of self-expression.",
  },
  sweet_shy: {
    title: "You are, Sweet Shy",
    description:
      "Presenting a soft scent that reflects a sweet, warm, and empathetic side.",
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
  const { locale } = useLocale();
  const detailRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<QuizPersonalityResultCopy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useTrackLocaleLoad(isLoading);

  const copy = {
    lihatProduk: L(locale, "Lihat Produk", "View Product"),
    ulangiKuis: L(locale, "Ulangi Kuis", "Retake Quiz"),
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getQuizResults(locale)
      .then((map) => {
        if (cancelled) return;
        const fromApi = map?.[resultKey];
        if (fromApi?.title) {
          setData(fromApi);
          return;
        }
        const fb = FALLBACK_RESULTS[resultKey];
        if (!fb) {
          setData(null);
          return;
        }
        if (locale === "en" && FALLBACK_EN[resultKey]) {
          setData({ ...fb, ...FALLBACK_EN[resultKey] });
        } else {
          setData(fb);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const fb = FALLBACK_RESULTS[resultKey];
        if (!fb) {
          setData(null);
          return;
        }
        if (locale === "en" && FALLBACK_EN[resultKey]) {
          setData({ ...fb, ...FALLBACK_EN[resultKey] });
        } else {
          setData(fb);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, resultKey]);

  useEffect(() => {
    if (data?.color) {
      setNavbarAndFooterColor(data.color);
    }
  }, [data, setNavbarAndFooterColor]);

  const scrollToDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading || !data) {
    return (
      <div className="w-full flex flex-col items-center py-16">
        <div className="w-full max-w-7xl px-4">
          <div className="h-[280px] md:h-[320px] rounded-[20px] bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-0 w-full max-w-7xl flex justify-center px-4 md:px-[5px] md:mt-[15px]">
        <div
          className="relative w-full min-h-[280px] h-auto md:h-[320px] rounded-[20px] overflow-hidden flex flex-col md:flex-row shadow-lg transition-colors duration-500 py-6 md:py-0"
          style={{ backgroundColor: data.color || "#1172BA" }}
        >
          <div className="relative z-20 w-full md:w-1/2 flex flex-col justify-center pl-5 sm:pl-6 md:pl-10 pr-4 pt-2 md:pt-[10px] pb-4 md:pb-0">
            <h1 className="font-nohemi text-[22px] sm:text-[26px] md:text-[34px] font-semibold text-white leading-tight mb-3 max-w-[70%] md:max-w-none">
              {data.title}
            </h1>

            <p className="font-sans text-[13px] md:text-[16px] font-normal text-white leading-relaxed mb-5 md:mb-6 opacity-90 max-w-[65%] md:max-w-sm">
              {data.description}
            </p>

            <div className="flex flex-wrap gap-2.5 relative z-30">
              <button
                onClick={scrollToDetail}
                className="font-nohemi flex items-center gap-2 bg-white text-[12px] md:text-[14px] font-semibold py-2.5 px-4 md:py-[10px] md:px-[20px] rounded-full transition-transform active:scale-95 shadow-sm"
                style={{ color: data.color || "#1172BA" }}
              >
                {copy.lihatProduk}
                <svg
                  width="10"
                  height="6"
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

              <button
                onClick={onRestart}
                className="font-nohemi flex items-center gap-2 border border-white text-white text-[12px] md:text-[14px] font-semibold py-2.5 px-4 md:py-[10px] md:px-[20px] rounded-full transition-all hover:bg-white/10 active:scale-95"
                style={{ backgroundColor: data.color || "#1172BA" }}
              >
                {copy.ulangiKuis}
                <svg
                  width="14"
                  height="14"
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

          <div className="absolute top-0 right-0 h-full w-[45%] md:w-[400px] pointer-events-none overflow-hidden md:overflow-visible">
            <div className="absolute inset-0 z-0 flex items-end justify-end">
              {data.bg_image && (
                <Image
                  src={data.bg_image}
                  alt=""
                  width={380}
                  height={380}
                  quality={100}
                  priority
                  className="object-contain object-bottom-right opacity-100 brightness-100 scale-90 md:scale-100"
                />
              )}
            </div>

            <div className="absolute inset-0 z-10 flex items-end justify-end">
              {data.product_image && (
                <Image
                  src={data.product_image}
                  alt=""
                  width={640}
                  height={580}
                  quality={100}
                  priority
                  className="object-contain object-bottom-right transform scale-[1.2] md:scale-[1.55] origin-bottom-right transition-transform duration-500 opacity-100 brightness-100"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={detailRef} className="w-full">
        <ProductDetailSection
          forcedId={data.forced_product_id || "1"}
          showDivider={false}
        />
      </div>
    </div>
  );
}

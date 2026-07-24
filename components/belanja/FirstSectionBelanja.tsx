"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { BELANJA_BLUE, BELANJA_EASE } from "@/lib/belanjaEnter";

export default function FirstSectionBelanja({
  suppressEnterMotion = false,
  forceBrandBlue = false,
}: {
  /** Parent sudah handle fade enter — jangan double-animate judul */
  suppressEnterMotion?: boolean;
  /** Paksa biru brand (halaman /belanja) — jangan ikut sisa warna produk */
  forceBrandBlue?: boolean;
}) {
  const { locale } = useLocale();
  const { navbarColor } = useNavbarColor();
  const brand = forceBrandBlue ? BELANJA_BLUE : navbarColor || BELANJA_BLUE;

  return (
    <section
      className="w-full flex flex-col justify-center items-center text-center px-4 py-6 md:py-10 mb-0 min-h-[12vh] md:min-h-[20vh] relative overflow-hidden"
      style={{
        backgroundColor: brand,
        transition: `background-color var(--theme-bg-duration, 0ms) ${BELANJA_EASE}`,
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        <motion.h1
          initial={suppressEnterMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: suppressEnterMotion ? 0 : 0.45,
            ease: "easeOut",
          }}
          className="font-nohemi text-[26px] md:text-[38px] font-semibold leading-tight mb-1 md:mb-0 tracking-tight"
        >
          {locale === "en" ? (
            <>
              <span className="text-white">Evomi </span>
              <span className="text-[#A5E194]">Scent </span>
              <span className="text-white">Collection</span>
            </>
          ) : (
            <>
              <span className="text-white">Koleksi </span>
              <span className="text-[#A5E194]">Aroma </span>
              <span className="text-white">Evomi</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={suppressEnterMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: suppressEnterMotion ? 0 : 0.45,
            ease: "easeOut",
            delay: suppressEnterMotion ? 0 : 0.08,
          }}
          className="font-nohemi text-[12px] md:text-[14px] font-normal text-white max-w-3xl opacity-95 leading-relaxed"
        >
          {locale === "en"
            ? "Pick your scent character, or try them all!"
            : "Pilih karakter aromamu, atau coba semuanya!"}
        </motion.p>
      </div>
    </section>
  );
}

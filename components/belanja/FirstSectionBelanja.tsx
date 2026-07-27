"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { useCms } from "@/context/CmsContext";
import { resolveCmsImage } from "@/lib/cms";
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
  const { navbarColor } = useNavbarColor();
  const { tBelanja, belanja } = useCms();
  const brand = forceBrandBlue ? BELANJA_BLUE : navbarColor || BELANJA_BLUE;

  const headline1 = tBelanja("hero", "headline_1", "Koleksi");
  const headline2 = tBelanja("hero", "headline_2", "Aroma");
  const headline3 = tBelanja("hero", "headline_3", "Evomi");
  const subtitle = tBelanja(
    "hero",
    "subtitle",
    "Pilih karakter aromamu, atau coba semuanya!",
  );
  const bannerSrc = resolveCmsImage(belanja?.hero?.banner_image);

  return (
    <section
      className="w-full flex flex-col justify-center items-center text-center px-4 py-6 md:py-10 mb-0 min-h-[12vh] md:min-h-[20vh] relative overflow-hidden"
      style={{
        backgroundColor: brand,
        backgroundImage: bannerSrc ? `url(${bannerSrc})` : undefined,
        backgroundSize: bannerSrc ? "cover" : undefined,
        backgroundPosition: bannerSrc ? "center" : undefined,
        transition: `background-color var(--theme-bg-duration, 0ms) ${BELANJA_EASE}`,
      }}
    >
      {bannerSrc ? (
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      ) : null}
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center relative z-10">
        <motion.h1
          initial={suppressEnterMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: suppressEnterMotion ? 0 : 0.45,
            ease: "easeOut",
          }}
          className="font-nohemi text-[26px] md:text-[38px] font-semibold leading-tight mb-1 md:mb-0 tracking-tight"
        >
          <span className="text-white">{headline1} </span>
          <span className="text-[#A5E194]">{headline2} </span>
          <span className="text-white">{headline3}</span>
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
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}

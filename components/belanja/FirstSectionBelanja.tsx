"use client";

import React from "react";
import { motion } from "framer-motion"; // Opsional: Untuk memberikan kesan premium & smooth saat halaman dimuat

export default function FirstSectionBelanja() {
  return (
    <section className="w-full bg-[#1172BA] flex flex-col justify-center items-center text-center px-4 py-2 mb-[4%] md:py-1 md:mb-[1%] min-h-[5vh] md:min-h-[18vh] relative overflow-hidden">
      {/* Catatan Posisi:
        - `flex flex-col justify-center items-center` memastikan semua teks berada di tengah secara vertikal dan horizontal.
        - `min-h` diset agar section memiliki ruang vertikal yang proposional di bawah navbar.
      */}

      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        {/* Teks Utama: Koleksi Aroma Evomi */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          // {/* PERUBAHAN: margin-bottom dikurangi dari mb-4 md:mb-2 menjadi mb-1 md:mb-0 */}
          className="font-nohemi text-[26px] md:text-[38px] font-semibold leading-tight mb-1 md:mb-0 tracking-tight"
        >
          <span className="text-white">Koleksi </span>
          <span className="text-[#A5E194]">Aroma </span>
          <span className="text-white">Evomi</span>
        </motion.h1>

        {/* Teks Detail / Subjudul */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="font-nohemi text-[12px] md:text-[14px] font-normal text-white max-w-3xl opacity-95 leading-relaxed"
        >
          Pilih karakter aromamu, atau coba semuanya!
        </motion.p>
      </div>
    </section>
  );
}


"use client";

import React from "react";
import { motion } from "framer-motion"; // Opsional: Untuk memberikan kesan premium & smooth saat halaman dimuat

export default function FirstSectionBelanja() {
  return (
    <section className="w-full bg-[#1172BA] flex flex-col justify-center items-center text-center px-4 py-10 mb-[0%] md:py-5 md:mb-[2%] min-h-[5vh] md:min-h-[28vh] relative overflow-hidden">
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
          className="font-['Nohemi'] text-[36px] sm:text-[48px] md:text-[56px] font-semibold leading-tight mb-4 md:mb-6 tracking-tight"
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
          className="font-['Nohemi'] text-[16px] sm:text-[20px] md:text-[20px] font-normal text-white max-w-3xl opacity-95 leading-relaxed"
        >
          Pilih karakter aromamu, atau coba semuanya!
        </motion.p>
      </div>
    </section>
  );
}

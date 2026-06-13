"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function SeventhSection() {
  // Varian untuk kontainer (mengatur urutan munculnya anak elemen)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Jeda 0.3 detik antar elemen
        delayChildren: 0.2,
      },
    },
  };

  // Varian untuk setiap bagian konten (muncul dari bawah + zoom)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative bg-white flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:pl-24 md:pr-0 py-12 md:py-24 overflow-hidden select-none">
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none">
        <style>{`
          @keyframes slideRightSeamless { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
          .animate-slide-right-80s { animation: slideRightSeamless 80s linear infinite; }
        `}</style>
        <div className="flex w-max gap-[15px] animate-slide-right-80s">
          {Array.from({ length: 160 }).map((_, index) => (
            <div
              key={index}
              className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[23px]"
            />
          ))}
        </div>
      </div>

      {/* Kontainer Utama untuk Animasi Berurutan */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="flex flex-col md:flex-row w-full items-center justify-between"
      >
        {/* 1. SISI KIRI (Teks & Tombol) */}
        <motion.div
          variants={itemVariants}
          className="relative z-10 top-10 flex flex-col justify-center items-center md:items-start w-full md:w-auto max-w-xl gap-8 mb-15 text-center md:text-left"
        >
          <h2 className="font-nohemi font-semibold text-[36px] md:text-[55px] leading-[1.1] whitespace-pre-line">
            <span className="text-[#1172BA]">Temukan</span>
            {"\n"}
            <span className="text-[#DD74A5]">aromamu</span>
            {"\n"}
            <span className="text-[#1172BA]">dengan</span>
            {"\n"}
            <span className="text-[#1172BA]">bermain </span>
            <span className="text-[#5EA14A]">kuis</span>
          </h2>

          <button className="font-['Nohemi'] mt-5 text-[22px] text-white bg-[#1172BA] px-12 py-2 rounded-full shadow-md hover:scale-95 transition-all">
            Mulai Kuis
          </button>
        </motion.div>
      </motion.div>

      {/* 2. SISI KANAN (Gambar Produk) */}
      <motion.div
        variants={itemVariants}
        className="relative z-10 flex justify-end w-full md:w-[750px] h-[250px] md:h-[550px] top-[78px] mt-[15px]"
      >
        <div className="z-5 absolute bottom-15 right-0 w-full md:w-[780px] h-[250px] md:h-[550px] bg-[#1172BA] rounded-[24px] md:rounded-l-[40px] shadow-lg"></div>
      </motion.div>

      {/* 3. Card Badges (Di atas Gambar Produk) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        // Dioptimalkan untuk S20 (lebar 360px): menggunakan right-[18%] agar pas di sisi kiri botol dan gap-1.5 agar hemat ruang
        className="absolute z-30 flex flex-row flex-wrap justify-center gap-1.5 md:gap-4 
                   bottom-[30%] md:bottom-auto md:top-[160px] right-[18%] sm:right-[25%] md:right-[280px]"
      >
        {/* Badge 1: Rebel (Menggunakan padding em, geser ke kiri dengan x, geser ke bawah dengan y) */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#E33D35] transition-transform hover:scale-105 cursor-pointer translate-x-[12px] translate-y-[5px] md:translate-x-[140px] md:translate-y-25">
          Rebel
        </div>

        {/* Badge 2: Sweet */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#DD74A5] transition-transform hover:scale-105 cursor-pointer translate-x-[15px] translate-y-[-30px] md:translate-x-[205px] md:translate-y-1">
          Sweet
        </div>

        {/* Badge 3: Prestige */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#5CB2ED] transition-transform hover:scale-105 cursor-pointer translate-x-[-18px] translate-y-[44px] md:translate-x-[180px] md:translate-y-50">
          Prestige
        </div>

        {/* Badge 4: Calm */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#5EA14A] transition-transform hover:scale-105 cursor-pointer translate-x-[-30px] translate-y-[10px] md:translate-x-[220px] md:translate-y-25">
          Calm
        </div>
      </motion.div>

      <img
        src="src/images/section 7/produk.png"
        alt="Produk Evomi"
        className="absolute z-20 bottom-0 md:top-[220px] bottom-[4.5%] right-[20%] md:-right-8 w-[60%] md:w-[52%] h-auto object-contain drop-shadow-2xl"
      />

      {/* 4. Animated Wave Background (Bottom - Original Kiri) */}
      <div className="absolute bottom-15 left-0 left-[-120px] w-full z-10 leading-[0]">
        <div className="relative w-full h-[100px] md:h-[200px]">
          <img
            src="/src/images/section 7/vector-diseksi7-1.svg"
            alt="Wave Layer 1"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none"
          />
          <img
            src="/src/images/section 7/vector-diseksi7-2.svg"
            alt="Wave Layer 2"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none"
          />
        </div>
      </div>

      {/* 5. Animated Wave Background (Bottom Right - Khusus Mobile & Rotate 180) */}
      <div className="absolute bottom-25 right-0 right-[-180px] w-full z-10 leading-[0] block md:hidden rotate-180 scale-x-[1]">
        <div className="relative w-full h-[100px]">
          <img
            src="/src/images/section 7/vector-diseksi7-1.svg"
            alt="Wave Layer 1 Rotated"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none"
          />
          <img
            src="/src/images/section 7/vector-diseksi7-2.svg"
            alt="Wave Layer 2 Rotated"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}

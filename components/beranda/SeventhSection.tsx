"use client";

import React, { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Tipe data untuk status modal
interface NavModalState {
  isOpen: boolean;
  type: "loading";
  title: string;
  message: string;
}

export default function SeventhSection() {
  const router = useRouter();

  // State untuk Custom Modal di SeventhSection
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  // Fungsi routing dengan delay animasi
  const handleQuizRouting = (e: React.MouseEvent) => {
    e.preventDefault();
    setNavModal({
      isOpen: true,
      type: "loading",
      title: "Kuis Persona",
      message: "Mengarahkan ke halaman Kuis Karakteristik...",
    });

    // Simulasi delay 800ms agar animasi terlihat sebelum pindah halaman
    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/kuis");
    }, 800);
  };

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
    <section className="relative bg-white flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:pl-24 md:pr-0 py-3 pb-8 md:py-17 overflow-hidden select-none">
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
      {/* PERUBAHAN: Tinggi container diubah menjadi h-[15px] untuk mobile, dan h-[23px] untuk desktop */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[15px] md:h-[23px] pointer-events-none">
        <style>{`
          @keyframes slideRightSeamless {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-slide-right-40s {
            animation: slideRightSeamless 80s linear infinite;
          }
        `}</style>
        {/* PERUBAHAN: Gap diubah menjadi 10px untuk mobile, dan 15px untuk desktop */}
        <div className="flex w-max gap-[10px] md:gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`top-${index}`}
              // {/* PERUBAHAN: Ukuran lingkaran & margin negatif diperkecil di mobile, dikembalikan ke normal dengan md: */}
              className="w-[30px] h-[30px] md:w-[46px] md:h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[15px] md:-mt-[23px]"
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
          // PERBAIKAN: Naikkan z-10 menjadi z-50 agar tombol tidak tertimpa elemen/gambar transparan lain
          className="relative z-50 top-10 flex flex-col justify-center items-center md:items-start w-full md:w-auto max-w-xl gap-8 mb-10 text-center md:text-left"
        >
          <h2 className="font-nohemi font-semibold text-[32px] md:text-[55px] leading-[1.1] whitespace-pre-line">
            <span className="text-[#1172BA]">Temukan</span>
            {"\n"}
            <span className="text-[#DD74A5]">aromamu</span>
            {"\n"}
            <span className="text-[#1172BA]">dengan</span>
            {"\n"}
            <span className="text-[#1172BA]">bermain </span>
            <span className="text-[#5EA14A]">kuis</span>
          </h2>

          <button
            onClick={handleQuizRouting}
            // PERBAIKAN: Tambahkan relative, z-50, dan cursor-pointer untuk memastikan interaksi aman
            className="relative z-50 cursor-pointer font-['Nohemi'] mt-5 text-[16px] md:text-[24px] text-white bg-[#1172BA] px-12 py-2 rounded-full shadow-md hover:scale-95 transition-all"
          >
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
        className="absolute z-30 flex flex-row flex-wrap justify-center gap-1.5 md:gap-4 bottom-[30%] md:bottom-auto md:top-[135px] right-[18%] sm:right-[25%] md:right-[210px]"
      >
        {/* Badge 1: Rebel */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#E33D35] transition-transform hover:scale-105 cursor-pointer translate-x-[15px] translate-y-[-17px] md:translate-x-[95px] md:translate-y-23">
          Rebel
        </div>

        {/* Badge 2: Sweet */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#DD74A5] transition-transform hover:scale-105 cursor-pointer translate-x-[13px] translate-y-[-50px] md:translate-x-[145px] md:translate-y-1">
          Sweet
        </div>

        {/* Badge 3: Prestige */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#5CB2ED] transition-transform hover:scale-105 cursor-pointer translate-x-[-15px] translate-y-[18px] md:translate-x-[130px] md:translate-y-47">
          Prestige
        </div>

        {/* Badge 4: Calm */}
        <div className="bg-white px-[1.2em] py-[0.4em] rounded-full shadow-md text-[10px] md:text-[16px] font-bold text-[#5EA14A] transition-transform hover:scale-105 cursor-pointer translate-x-[-30px] translate-y-[-17px] md:translate-x-[170px] md:translate-y-24">
          Calm
        </div>
      </motion.div>

      {/* --- BAGIAN PRODUK --- */}
      {/* once: false membuat animasi akan selalu diulang (masuk dan keluar) setiap kali di-scroll */}
      <motion.div
        className="absolute z-20 bottom-0 md:top-[150px] bottom-[4.5%] right-[20%] md:-right-24 w-[60%] md:w-[52%] drop-shadow-2xl"
        initial={{ opacity: 0, x: 50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        {/* Animasi melayang tetap berjalan terus-menerus */}
        <img
          src="src/images/section 7/produk.png"
          alt="Produk Evomi"
          className="w-full h-full object-contain md:mt-10"
        />
      </motion.div>

      {/* --- BAGIAN WAVE --- */}
      <motion.div
        className="absolute bottom-15 left-0 left-[-120px] w-full z-10 leading-[0]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="relative w-full h-[100px] md:h-[200px]">
          {/* Wave Layer 1 */}
          <motion.img
            src="/src/images/section 7/vector-diseksi7-1.svg"
            alt="Wave Layer 1"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none origin-bottom"
            animate={{ scaleX: [1, 1.03, 1], x: ["0%", "-1%", "0%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          {/* Wave Layer 2 */}
          <motion.img
            src="/src/images/section 7/vector-diseksi7-2.svg"
            alt="Wave Layer 2"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none origin-bottom"
            animate={{ scaleX: [1.03, 1, 1.03], x: ["-1%", "0%", "-1%"] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      </motion.div>

      {/* 5. Animated Wave Background (Bottom Right - Khusus Mobile & Rotate 180) */}
      {/* --- BAGIAN WAVE (MOBILE / ROTATED) --- */}
      <motion.div
        className="absolute bottom-25 right-0 right-[-180px] w-full z-10 leading-[0] block md:hidden rotate-180 scale-x-[1]"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="relative w-full h-[100px]">
          {/* Wave Layer 1 Rotated */}
          <motion.img
            src="/src/images/section 7/vector-diseksi7-1.svg"
            alt="Wave Layer 1 Rotated"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none origin-bottom"
            animate={{ scaleX: [1, 1.03, 1], x: ["0%", "-1%", "0%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          {/* Wave Layer 2 Rotated */}
          <motion.img
            src="/src/images/section 7/vector-diseksi7-2.svg"
            alt="Wave Layer 2 Rotated"
            className="absolute bottom-0 left-0 w-full h-full object-fill pointer-events-none origin-bottom"
            animate={{ scaleX: [1.03, 1, 1.03], x: ["-1%", "0%", "-1%"] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      </motion.div>

      {/* ================= CUSTOM MODAL ROUTING COMPONENT ================= */}
      <AnimatePresence>
        {navModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-[24px] p-8 max-w-[340px] w-full text-center shadow-2xl overflow-hidden"
            >
              {/* Ikon Loading Dinamis */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-5 transition-colors duration-300 bg-blue-50 text-blue-500">
                <svg
                  className="h-10 w-10 animate-spin text-[#1172BA]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>

              {/* Teks Modal */}
              <div className="space-y-3">
                <h3 className="text-[20px] font-bold text-gray-800 tracking-wide">
                  {navModal.title}
                </h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  {navModal.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

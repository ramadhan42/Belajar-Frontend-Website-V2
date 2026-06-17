"use client";

import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";

// Tipe data untuk konfigurasi status modal footer
interface NavModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success";
  title: string;
  message: string;
}

export default function Footer() {
  const { footerColor } = useNavbarColor();
  const router = useRouter();

  // State untuk Custom Modal di Footer
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // --- LOGIC CUSTOM MODAL NAVIGASI ---
  const handleNavAction = (path: string, title: string, message: string) => {
    // Munculkan modal transisi
    setNavModal({
      isOpen: true,
      type: "loading",
      title,
      message,
    });

    // Simulasi delay singkat agar animasi modal terlihat (800ms) lalu pindah rute
    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(path);
    }, 800);
  };

  return (
    <>
      <footer
        // Penyesuaian padding untuk layar mobile (px-5) hingga desktop (md:px-24)
        className="w-full py-10 md:py-16 px-5 md:px-12 lg:px-24 transition-colors duration-0 relative"
        style={{
          fontFamily: "'Nohemi', sans-serif",
          backgroundColor: footerColor || "#1172BA", // Fallback color jika context kosong
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
        >
          {/* BARIS PERTAMA: BAGIAN UTAMA */}
          <div className="flex flex-col lg:flex-row justify-between gap-y-12 lg:gap-y-0 mb-12 md:mb-16">
            {/* 1. Buletin Evomi */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-3 md:gap-4 w-full lg:w-[45%] max-w-[400px] mx-auto lg:mx-0 text-center lg:text-left items-center lg:items-start"
            >
              <h3 className="text-[26px] md:text-[36px] text-white font-bold leading-tight">
                Buletin Evomi
              </h3>
              <p className="text-[13px] md:text-[16px] text-white opacity-90 leading-relaxed">
                Daftar untuk menerima koleksi terbaru, penawaran eksklusif, dan
                cerita tentang setiap karakter aroma.
              </p>

              {/* BAGIAN INPUT & TOMBOL */}
              <div className="flex flex-row gap-2 w-full mt-3">
                <input
                  type="email"
                  placeholder="email@kamu.com"
                  className="flex-grow bg-white rounded-full outline-none px-4 md:px-5 h-[44px] md:h-[48px] text-[13px] md:text-[14px] text-gray-600 placeholder-gray-400 shadow-sm min-w-0"
                />
                <button
                  className="bg-white flex-shrink-0 w-[85px] md:w-[100px] h-[44px] md:h-[48px] rounded-full text-[13px] md:text-[14px] font-bold hover:bg-gray-100 transition-colors shadow-sm"
                  style={{
                    color: footerColor || "#1172BA", // font color tombol mengikuti warna footer untuk kontras yang baik
                  }}
                >
                  Daftar
                </button>
              </div>
            </motion.div>

            {/* Grup Kanan: Menu, Bantuan, Social */}
            {/* Menggunakan Grid agar lebih rapi di layar 360px (Galaxy S20) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 w-full lg:w-[45%] mt-2 lg:mt-0 text-left">
              {/* 2. Menu */}
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <span className="text-[12px] md:text-[14px] text-white/70 font-medium tracking-wide">
                  Menu
                </span>
                <ul className="flex flex-col gap-2 md:gap-3 text-white">
                  <li 
                    onClick={() => handleNavAction("/", "Beranda Utama", "Mengarahkan ke halaman utama Evomi...")}
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    Beranda
                  </li>
                  <li 
                    onClick={() => handleNavAction("/belanja", "Katalog Produk", "Mengarahkan ke halaman belanja Evomi...")}
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    Belanja
                  </li>
                  <li 
                    onClick={() => handleNavAction("/kuis", "Kuis Persona", "Mengarahkan ke halaman Kuis Karakteristik...")}
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    Kuis
                  </li>
                </ul>
              </motion.div>

              {/* 3. Bantuan */}
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <span className="text-[12px] md:text-[14px] text-white/70 font-medium tracking-wide">
                  Bantuan
                </span>
                <ul className="flex flex-col gap-2 md:gap-3 text-white">
                  <li className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit">
                    FAQ
                  </li>
                  <li className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit">
                    Pengiriman
                  </li>
                  <li className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit">
                    Kontak
                  </li>
                </ul>
              </motion.div>

              {/* 4. Social */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3 col-span-2 sm:col-span-1"
              >
                <span className="text-[12px] md:text-[14px] text-white/70 font-medium tracking-wide">
                  Social
                </span>
                <div className="flex gap-4 text-white">
                  <FaInstagram className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                  <FaTwitter className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                  <FaFacebookF className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                </div>
                <span className="text-[14px] md:text-[16px] text-white mt-1">
                  evomi.id
                </span>
              </motion.div>
            </div>
          </div>

          {/* DIVIDER & COPYRIGHT */}
          <motion.div variants={itemVariants}>
            <div className="w-full h-[1px] bg-white rounded-full mb-6 md:mb-8 opacity-30"></div>
            <div className="flex flex-col md:flex-row justify-between items-center text-white text-[12px] md:text-[14px] opacity-90 gap-y-2 text-center md:text-left">
              <p>© 2026 evomi.id — Every Version of Me</p>
              <p>Discover the scent of every personality</p>
            </div>
          </motion.div>
        </motion.div>
      </footer>

      {/* ================= CUSTOM MODAL COMPONENT (Z-INDEX SUPER TINGGI) ================= */}
      {navModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1172ba] border border-white/20 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl transition-all scale-100">
            
            {/* Ikon Dinamis Berdasarkan Tipe Modal */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm">
              {navModal.type === 'loading' && (
                <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>

            {/* Teks Modal */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                {navModal.title}
              </h3>
              <p className="text-sm text-blue-100/80 font-light leading-relaxed">
                {navModal.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
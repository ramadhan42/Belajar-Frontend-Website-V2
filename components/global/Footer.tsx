"use client";

import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
// Tambahkan AnimatePresence di import framer-motion
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { SITE_STRINGS } from "../constans/strings";
import { useCms } from "@/context/CmsContext";

interface NavModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success" | "error";
  title: string;
  message: string;
}

export default function Footer() {
  const baseUrl = SITE_STRINGS.base_url.url_backend;
  const { footerColor } = useNavbarColor();
  const { tFooter } = useCms();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setNavModal({
      isOpen: true,
      type: "loading",
      title,
      message,
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(path);
      router.refresh();
    }, 800);
  };

  // --- LOGIC BERLANGGANAN BULETIN ---
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setNavModal({
        isOpen: true,
        type: "error",
        title: "Perhatian",
        message: "Harap masukkan alamat email Anda terlebih dahulu.",
      });
      setTimeout(
        () => setNavModal((prev) => ({ ...prev, isOpen: false })),
        3000,
      );
      return;
    }

    setNavModal({
      isOpen: true,
      type: "loading",
      title: "Memproses...",
      message: "Sedang mendaftarkan email Anda ke Buletin Evomi.",
    });
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${baseUrl}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar buletin.");
      }

      setNavModal({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message: "Terima kasih telah berlangganan Buletin Evomi.",
      });
      setEmail("");
    } catch (error: any) {
      setNavModal({
        isOpen: true,
        type: "error",
        title: "Pendaftaran Gagal",
        message:
          error.message || "Terjadi kesalahan pada server. Coba lagi nanti.",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setNavModal((prev) => {
          if (prev.type === "success" || prev.type === "error") {
            return { ...prev, isOpen: false };
          }
          return prev;
        });
      }, 3000);
    }
  };

  return (
    <>
      <footer
        className="theme-color-shimmer-chrome w-full py-10 md:py-4 px-5 md:px-8 md:pt-12 md:pb-8 lg:px-24 relative font-nohemi"
        style={{
          backgroundColor: footerColor || "#1172BA",
          transition:
            "background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
        >
          {/* BARIS PERTAMA: BAGIAN UTAMA */}
          <div className="flex flex-col lg:flex-row justify-between gap-y-12 lg:gap-y-0 mb-12 md:mb-8">
            {/* 1. Buletin Evomi */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-3 md:gap-4 w-full lg:w-[45%] max-w-[400px] mx-auto lg:mx-0 text-center lg:text-left items-center lg:items-start"
            >
              <h3 className="text-[32px] md:text-[40px] text-white font-bold leading-tight">
                {tFooter("bulletin", "title", "Buletin Evomi")}
              </h3>
              <p className="text-[16px] md:text-[18px] text-white opacity-90 leading-relaxed">
                {tFooter(
                  "bulletin",
                  "desc",
                  "Daftar untuk menerima koleksi terbaru, penawaran eksklusif, dan cerita tentang setiap karakter aroma.",
                )}
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex flex-row gap-2 w-full mt-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="email@kamu.com"
                  className="flex-grow bg-white rounded-full outline-none px-4 md:px-5 h-[50px] md:h-[48px] text-[14px] md:text-[16px] text-gray-600 placeholder-gray-400 shadow-sm min-w-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-shrink-0 w-[100px] md:w-[120px] h-[50px] md:h-[48px] rounded-full text-[14px] md:text-[16px] font-bold transition-all shadow-sm bg-white text-[var(--btn-color)] border border-[var(--btn-color)] hover:bg-[var(--btn-color)] hover:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  style={
                    {
                      "--btn-color": footerColor || "#1172BA",
                    } as React.CSSProperties
                  }
                >
                  {isSubmitting ? "..." : tFooter("bulletin", "cta", "Daftar")}
                </button>
              </form>
            </motion.div>

            {/* Grup Kanan: Menu, Bantuan, Social */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 w-full lg:w-[45%] mt-2 lg:mt-0 text-left">
              {/* Menu & Lainya dibiarkan sama */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3"
              >
                <span className="text-[14px] md:text-[16px] text-white/70 font-medium tracking-wide">
                  {tFooter("menu", "heading", "Menu")}
                </span>
                <ul className="flex flex-col gap-2 md:gap-3 text-white">
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/",
                        "Beranda Utama",
                        "Mengarahkan ke halaman utama Evomi...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("menu", "beranda", "Beranda")}
                  </li>
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/belanja",
                        "Katalog Produk",
                        "Mengarahkan ke halaman belanja Evomi...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("menu", "belanja", "Belanja")}
                  </li>
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/kuis",
                        "Kuis Persona",
                        "Mengarahkan ke halaman Kuis Karakteristik...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("menu", "kuis", "Kuis")}
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3"
              >
                <span className="text-[14px] md:text-[16px] text-white/70 font-medium tracking-wide">
                  {tFooter("help", "heading", "Bantuan")}
                </span>
                <ul className="flex flex-col gap-2 md:gap-3 text-white">
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/faq",
                        "Pusat Bantuan",
                        "Membuka halaman FAQ...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("help", "faq", "FAQ")}
                  </li>
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/pengiriman",
                        "Info Logistik",
                        "Mengecek status pengiriman...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("help", "pengiriman", "Pengiriman")}
                  </li>
                  <li
                    onClick={() =>
                      handleNavAction(
                        "/kontak",
                        "Kontak Kami",
                        "Membuka formulir kontak...",
                      )
                    }
                    className="text-[14px] md:text-[16px] cursor-pointer hover:scale-110 hover:font-bold transition-all w-fit"
                  >
                    {tFooter("help", "kontak", "Kontak")}
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3 col-span-2 sm:col-span-1"
              >
                <span className="text-[14px] md:text-[16px] text-white/70 font-medium tracking-wide">
                  {tFooter("social", "heading", "Social")}
                </span>
                <div className="flex gap-4 text-white">
                  <a
                    href={tFooter(
                      "social",
                      "instagram_url",
                      "https://instagram.com/evomi.id",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Evomi"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaInstagram className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" />
                  </a>
                  <a
                    href={tFooter(
                      "social",
                      "twitter_url",
                      "https://twitter.com/evomi",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter Evomi"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaTwitter className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" />
                  </a>
                  <a
                    href={tFooter(
                      "social",
                      "facebook_url",
                      "https://facebook.com/evomi",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Evomi"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaFacebookF className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" />
                  </a>
                </div>
                <span className="text-[16px] md:text-[18px] text-white mt-1">
                  evomi.id
                </span>
              </motion.div>
            </div>
          </div>

          <motion.div variants={itemVariants}>
            <div className="w-full h-[1px] bg-white rounded-full mb-6 md:mb-8 opacity-30"></div>
            <div className="flex flex-col md:flex-row justify-between items-center text-white text-[14px] md:text-[14px] opacity-90 gap-y-2 text-center md:text-left">
              <p>
                {tFooter(
                  "legal",
                  "copyright",
                  "© 2026 evomi.id — Every Version of Me",
                )}
              </p>
              <p>Discover the scent of every personality</p>
            </div>
          </motion.div>
        </motion.div>
      </footer>

      {/* ================= CUSTOM MODAL COMPONENT (DI-UPGRADE) ================= */}
      <AnimatePresence>
        {navModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              // Bisa tutup dengan klik luar modal (kecuali sedang loading)
              if (navModal.type !== "loading") {
                setNavModal((prev) => ({ ...prev, isOpen: false }));
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Hindari tutup saat klik dalam modal
              className="relative bg-white rounded-[24px] p-8 max-w-[340px] w-full text-center shadow-2xl overflow-hidden"
            >
              {/* Ikon Dinamis */}
              <div
                className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-5 transition-colors duration-300
                ${navModal.type === 'success' ? 'bg-green-50 text-green-500' : ''}
                ${navModal.type === 'error' ? 'bg-red-50 text-red-500' : ''}
                ${navModal.type === 'loading' ? 'bg-blue-50 text-blue-500' : ''}
              "
              >
                {navModal.type === "loading" && (
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
                )}
                {navModal.type === "success" && (
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
                {navModal.type === "error" && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </motion.svg>
                )}
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

              {/* Tombol Tutup Manual */}
              {(navModal.type === "success" || navModal.type === "error") && (
                <button
                  onClick={() =>
                    setNavModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-[14px] font-bold transition-colors"
                >
                  Tutup
                </button>
              )}

              {/* Animated Progress Bar di Bawah (Visual Timer) */}
              {(navModal.type === "success" || navModal.type === "error") && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-[4px] ${navModal.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


"use client";

import React, { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface NavModalState {
  isOpen: boolean;
  type: "loading";
  title: string;
  message: string;
}

const PRODUCT_BADGES = [
  {
    id: 4,
    label: "Sweet",
    title: "Sweet Shy",
    labelColor: "text-[#DD74A5]",
    position: "left-[47.5%] top-[-3%]",
  },
  {
    id: 3,
    label: "Rebel",
    title: "Rebel Brave",
    labelColor: "text-[#E33D35]",
    position: "left-[26%] top-[15%]",
  },
  {
    id: 2,
    label: "Calm",
    title: "Peaceful Calm",
    labelColor: "text-[#5EA14A]",
    position: "left-[82%] top-[15%]",
  },
  {
    id: 1,
    label: "Prestige",
    title: "Purpose Prestige",
    labelColor: "text-[#5CB2ED]",
    position: "left-[61%] top-[33%]",
  },
];

function ProductBadge({
  product,
  size = "desktop",
  onClick,
}: {
  product: (typeof PRODUCT_BADGES)[number];
  size?: "mobile" | "desktop";
  onClick: () => void;
}) {
  const isMobile = size === "mobile";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Lihat detail ${product.title}`}
      className={`s7-badge-hit absolute ${product.position} -translate-x-1/2 ${
        isMobile
          ? "-translate-y-[calc(100%+6px)] px-2.5 py-0.5 text-[9px]"
          : "-translate-y-[calc(100%+10px)] px-3.5 lg:px-4 py-1 text-[13px] lg:text-[16px]"
      } bg-white rounded-full shadow-md font-bold ${product.labelColor} whitespace-nowrap z-30 border-0 cursor-pointer`}
    >
      {product.label}
    </button>
  );
}

export default function SeventhSection() {
  const router = useRouter();

  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const handleQuizRouting = (e: React.MouseEvent) => {
    e.preventDefault();
    setNavModal({
      isOpen: true,
      type: "loading",
      title: "Kuis Persona",
      message: "Mengarahkan ke halaman Kuis Karakteristik...",
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/kuis");
    }, 800);
  };

  const handleProductClick = (id: number, title: string) => {
    setNavModal({
      isOpen: true,
      type: "loading",
      title,
      message: `Mengarahkan ke detail produk ${title}...`,
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(`/belanja/${id}`);
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

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
    <section className="relative bg-white flex flex-col md:block items-center justify-between px-5 sm:px-8 md:px-0 md:pl-16 lg:pl-24 md:pr-0 pt-12 pb-10 md:pt-20 md:pb-0 md:min-h-[677px] lg:min-h-[742px] overflow-hidden select-none">
      {/* ================= LINGKARAN DIVIDER ATAS ================= */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[15px] md:h-[23px] pointer-events-none z-40">
        <style>{`
          @keyframes slideRightSeamless {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-slide-right-40s {
            animation: slideRightSeamless 80s linear infinite;
          }
          .s7-badge-hit {
            transition: transform 0.3s ease-out;
          }
          .s7-badge-hit:hover {
            scale: 1.05;
          }
        `}</style>
        <div className="flex w-max gap-[10px] md:gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`top-${index}`}
              className="w-[30px] h-[30px] md:w-[46px] md:h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[15px] md:-mt-[23px]"
            />
          ))}
        </div>
      </div>

      {/* ================= SISI KIRI: TEKS & CTA ================= */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="relative z-50 w-full md:w-auto md:absolute md:left-16 lg:left-24 md:top-1/2 md:-translate-y-1/2 md:max-w-[420px] lg:max-w-xl"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-center items-center md:items-start gap-6 md:gap-8 text-center md:text-left"
        >
          <h2 className="font-nohemi font-semibold text-[30px] sm:text-[36px] md:text-[48px] lg:text-[55px] leading-[1.12]">
            <span className="text-[#1172BA]">Temukan</span>
            <br />
            <span className="text-[#DD74A5]">aromamu</span>
            <br />
            <span className="text-[#1172BA]">dengan</span>
            <br />
            <span className="text-[#1172BA]">bermain </span>
            <span className="text-[#5EA14A]">kuis</span>
          </h2>

          <button
            onClick={handleQuizRouting}
            className="relative z-50 cursor-pointer font-nohemi text-[15px] md:text-[22px] lg:text-[24px] text-white bg-[#1172BA] px-10 md:px-12 py-2.5 md:py-2.5 rounded-full shadow-md hover:scale-95 transition-all inline-flex items-center gap-2"
          >
            Mulai Kuis
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </motion.div>

      {/* ================= MOBILE: panel + produk + badge ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-20 w-full max-w-[380px] mx-auto mt-8 md:hidden"
      >
        <div className="relative w-full h-[294px] bg-[#1172BA] rounded-[24px] shadow-lg overflow-visible">
          <div className="absolute bottom-0 right-0 w-[88%] overflow-visible">
            <div className="relative w-full drop-shadow-2xl overflow-visible">
              <img
                src="/src/images/section 7/produk.png"
                alt="Produk Evomi"
                className="w-full h-auto object-contain"
              />
              {PRODUCT_BADGES.map((product) => (
                <ProductBadge
                  key={`mobile-${product.id}`}
                  product={product}
                  size="mobile"
                  onClick={() =>
                    handleProductClick(product.id, product.title)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= DESKTOP: panel biru + produk ================= */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden md:block absolute right-0 bottom-[10%] z-10 w-[55%] max-w-[780px] h-[504px] lg:h-[578px] overflow-visible pointer-events-none"
      >
        <div className="absolute inset-0 bg-[#1172BA] rounded-l-[40px] shadow-lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:block absolute z-20 right-0 bottom-0 w-[50%] lg:w-[52%] max-w-[720px] overflow-visible"
      >
        <div className="relative w-full drop-shadow-2xl overflow-visible">
          <img
            src="/src/images/section 7/produk.png"
            alt="Produk Evomi"
            className="w-full h-auto object-contain"
          />
          {PRODUCT_BADGES.map((product) => (
            <ProductBadge
              key={`desktop-${product.id}`}
              product={product}
              size="desktop"
              onClick={() => handleProductClick(product.id, product.title)}
            />
          ))}
        </div>
      </motion.div>

      {/* ================= WAVE BAWAH ================= */}
      <motion.div
        className="absolute bottom-0 md:bottom-8 left-0 w-full z-[5] leading-[0] pointer-events-none overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="relative w-[140%] md:w-[120%] -ml-[15%] md:-ml-[8%] h-[70px] sm:h-[100px] md:h-[180px] lg:h-[200px]">
          <motion.img
            src="/src/images/section 7/vector-diseksi7-1.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full h-full object-fill origin-bottom"
            animate={{ scaleX: [1, 1.03, 1], x: ["0%", "-1%", "0%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          <motion.img
            src="/src/images/section 7/vector-diseksi7-2.svg"
            alt=""
            className="absolute bottom-0 left-0 w-full h-full object-fill origin-bottom"
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

      <div className="hidden md:block h-[568px] lg:h-[633px]" aria-hidden />

      {/* ================= MODAL ================= */}
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
              className="relative bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-8 max-w-[280px] md:max-w-[340px] w-full text-center shadow-2xl overflow-hidden"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full mb-3 md:mb-5 bg-blue-50 text-blue-500">
                <svg
                  className="h-7 w-7 md:h-10 md:w-10 animate-spin text-[#1172BA]"
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
              <div className="space-y-1.5 md:space-y-3">
                <h3 className="text-[16px] md:text-[20px] font-bold text-gray-800 tracking-wide">
                  {navModal.title}
                </h3>
                <p className="text-[11px] md:text-[14px] text-gray-500 leading-relaxed">
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

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function SecondSectionBelanja() {
  const products = [
    {
      id: 1,
      path: "/src/images/section 5/purpose-prestige.png",
      imgBg: "bg-[#1172BA]",
      cardBg: "bg-[#9CD6FF]",
      textColor: "text-[#1172BA]",
      badge: "Optimis",
      title: "Purpose Prestige",
      desc: "Aroma yang merefleksikan ketenangan dan kejelasan tujuan.",
      descColor: "text-[#1172BAB2]",
      price: "Rp189.000",
      btnBg: "bg-[#1172BA]",
      hoverClass: "hover:-rotate-[5deg]",
    },
    {
      id: 2,
      path: "/src/images/section 5/peaceful-calm.png",
      imgBg: "bg-[#5EA14A]",
      cardBg: "bg-[#C6F5B8]",
      textColor: "text-[#5EA14A]",
      badge: "Damai",
      title: "Peaceful Calm",
      desc: "Keberanian dan semangat untuk mengekspresikan diri.",
      descColor: "text-[#5EA14A]",
      price: "Rp199.000",
      btnBg: "bg-[#5EA14A]",
      hoverClass: "hover:rotate-[5deg]",
    },
    {
      id: 3,
      path: "/src/images/section 5/rabel-brave.png",
      imgBg: "bg-[#E33D35]",
      cardBg: "bg-[#FFBBB5]",
      textColor: "text-[#E33D35]",
      badge: "Berani",
      title: "Rabel Brave",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#E33D35]",
      price: "Rp179.000",
      btnBg: "bg-[#E33D35]",
      hoverClass: "hover:-rotate-[5deg]",
    },
    {
      id: 4,
      path: "/src/images/section 5/sweet-shy.png",
      imgBg: "bg-[#DD74A5]",
      cardBg: "bg-[#F5D7E7]",
      textColor: "text-[#DD74A5]",
      badge: "Manis",
      title: "Sweet Shy",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#DD74A5]",
      price: "Rp189.000",
      btnBg: "bg-[#DD74A5]",
      hoverClass: "hover:rotate-[5deg]",
    },
  ];

  // Varian Animasi untuk container grid produk (Efek Stagger)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
      },
    },
  };

  // Varian Animasi untuk masing-masing kartu produk (Slide Up + Fade In)
  const cardVariants: Variants = {
    active: { scale: 1.05 },
    inactive: { scale: 1 },
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <section className="bg-[#F6F6F6] flex flex-col items-center text-center w-full pt-16 md:pt-20 pb-20 md:pb-25 px-2 md:px-4 relative overflow-hidden">

      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none z-10">
        <style>{`
          @keyframes slideRightSeamless {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-slide-right-40s {
            animation: slideRightSeamless 80s linear infinite;
          }
        `}</style>
        <div className="flex w-max gap-[10px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`top-${index}`}
              className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[23px]"
            />
          ))}
        </div>
      </div>

      {/* ================= GRID CARD PRODUK (STAGGERED) ================= */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.10 }}
        className="relative z-10 w-full max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-7 md:gap-8 px-5 py-5 md:px-4 mt-8"
      >
        {products.map((product) => (
          <motion.div
            animate="active"
            key={product.id}
            variants={cardVariants}
            className={`font-['Nohemi'] relative rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-100 ease-out overflow-hidden flex flex-col border border-gray-100`}
          >
            {/* Bagian Atas: Gambar & Badge */}
            <div
              className={`relative w-full md:h-[340px] aspect-square overflow-hidden ${product.imgBg}`}
            >
              <span
                className={`absolute top-2 left-2 md:top-5 md:left-5 bg-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[14px] font-bold z-20 ${product.textColor}`}
              >
                {product.badge}
              </span>

              {/* Perubahan Utama: Absolute positioning, ukuran lebih besar (120-100%), 
                  posisi mentok kiri (left-[-10%]), dan turun 5% (bottom-[-20%]) agar terpotong di bawah */}
              <Image
                src={product.path}
                alt={product.title}
                width={340}
                height={340}
                className="absolute bottom-[-20%] md:bottom-[-21%] left-[-10%] md:left-[-27%] w-[120%] md:w-[140%] max-w-none object-contain drop-shadow-xl rotate-[35deg] transition-transform duration-300"
              />
            </div>

            {/* Bagian Bawah: Teks & Info Produk */}
            <div
              className={`p-3 md:p-6 flex flex-col flex-grow text-left ${product.cardBg}`}
            >
              <h3
                className={`text-[13px] md:text-[20px] font-bold mb-1 md:mb-2 ${product.textColor}`}
              >
                {product.title}
              </h3>

              <p
                className={`text-[9px] md:text-[12px] font-medium mb-3 md:mb-6 leading-tight md:leading-relaxed flex-grow ${product.descColor}`}
              >
                {product.desc}
              </p>

              {/* Harga & Tombol Panah (Sejajar) */}
              <div className="flex justify-between items-center mt-auto">
                <span
                  className={`text-[10px] md:text-[14px] font-bold ${product.textColor}`}
                >
                  {product.price}
                </span>

                {/* Gunakan Link untuk membungkus tombol navigasi ke Belanja Details dengan product ID */}
                <Link href={`/halaman/belanja/${product.id}`}>
                  <button
                    className={`w-10 h-10 rounded-full flex justify-center items-center text-white transition-transform hover:scale-105 active:scale-95 ${product.btnBg}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}

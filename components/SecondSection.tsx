"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function SecondSection() {
  const characters = [
    {
      name: "Purpose\nPrestige",
      path: "/src/images/section 2/purpose-prestige.png",
      colorClass: "text-[#0D71BA]",
    },
    {
      name: "Sweet\nShy",
      path: "/src/images/section 2/sweet-shy.png",
      colorClass: "text-[#DD74A5]",
    },
    {
      name: "Peaceful\nCalm",
      path: "/src/images/section 2/peaceful-calm.png",
      colorClass: "text-[#5EA14A]",
    },
    {
      name: "Rabel\nBrave",
      path: "/src/images/section 2/rabel-brave.png",
      colorClass: "text-[#E33D35]",
    },
  ];

  // Varian Animasi untuk container (Stagger effect)
  const containerVariants : Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Jeda antar karakter 0.2 detik
      },
    },
  };

  // Varian Animasi untuk elemen satuan (Slide up + Fade)
  const itemVariants : Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full overflow-hidden relative pb-[30px]">
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none">
        <style>{`
          @keyframes slideRightSeamless {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-slide-right-40s {
            animation: slideRightSeamless 80s linear infinite;
          }
        `}</style>
        <div className="flex w-max gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div key={`top-${index}`} className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[23px]" />
          ))}
        </div>
      </div>

      {/* 1. Teks Judul - Animasi muncul dari bawah */}
      <motion.h2 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="mt-14 md:mt-25 mb-8 md:mb-10 text-[32px] md:text-[48px] font-nohemi font-semibold leading-tight"
      >
        <span className="text-[#0071BC]">Kenalan sama</span>
        <br />
        <span className="text-[#F7B497]">karakter </span>
        <span className="text-[#0071BC]">kita yuk!</span>
      </motion.h2>

      {/* 2. Grid 4 Gambar Karakter - Animasi Berurutan (Stagger) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="mt-6 md:mt-10 mb-8 md:mb-10 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 justify-items-center"
      >
        {characters.map((char, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] relative flex justify-center items-center">
              <Image
                src={char.path}
                alt={`Karakter ${char.name}`}
                width={220}
                height={220}
                className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
              />
            </div>
            <h3 className={`font-heavy text-l md:text-3xl tracking-tight whitespace-pre-line md:mt-3 ${char.colorClass}`}>
              {char.name}
            </h3>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Button - Animasi Pop Up (Scale) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link
          href="/belanja"
          className="bg-[#0071BC] text-white text-[12px] md:text-[18.3px] font-bold px-6 md:px-9 py-3 md:py-4 rounded-full shadow-lg inline-flex items-center gap-2 mb-10 md:mb-25 md:mt-15 relative z-10 transform transition-all duration-200 ease-out hover:scale-95 hover:translate-y-1 hover:shadow-sm"
        >
          Lihat Semua Karakter
          <svg className="w-4 h-4 md:w-[19px] md:h-[19px]" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.80933 9.14282H14.476" stroke="#ffffff" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.14282 3.80957L14.4762 9.1429L9.14282 14.4762" stroke="#ffffff" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </motion.div>

      {/* ================= STICKY LINGKARAN DIVIDER BAWAH ================= */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[23px] pointer-events-none">
        <div className="flex w-max gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div key={`bottom-${index}`} className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </section>
  );
}
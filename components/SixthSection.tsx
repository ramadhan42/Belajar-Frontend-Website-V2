"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SixthSection() {
  // Variabel animasi standar untuk efek muncul dari bawah
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section
      className="bg-[#1172BA] flex flex-col items-center justify-center pt-4 md:pt-6 pb-20 md:pb-28 overflow-hidden select-none relative"
      style={{ fontFamily: "'Nohemi', sans-serif" }}
    >
      {/* --- CSS ANIMASI MARQUEE --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>

      {/* 1. Atas: Header "Packaging Reveal" + Icon Star */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
        variants={fadeUpVariants}
        className="relative z-30 flex items-center justify-center gap-3 text-center px-4 py-2 top-2 md:top-15 md:mb-10"
      >
        <h2 className="font-nohemi font-semibold text-[32px] sm:text-[40px] md:text-[72px] font-bold">
          <span className="text-white">Packaging</span>{' '}
          <span className="text-[#A5E194]">Reveal</span>
        </h2>
        <img
          src="src/images/section 6/star-medium.png"
          alt="Star Icon"
          className="w-[17px] h-[17px] md:w-[30px] md:h-[30px] object-contain brightness-0 invert"
        />
      </motion.div>

      {/* 2. Tengah: Area Konten Gambar & Tulisan Melayang */}
      <div className="relative w-full flex flex-col items-center justify-center my-0 px-2 py-2">

        {/* Background Frame Kiri (Animasi Slide In dari Kiri) */}
        <motion.img
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="src/images/section 6/frame-kiri.png"
          alt="Frame Kiri"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1/5 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* Background Frame Kanan (Animasi Slide In dari Kanan) */}
        <motion.img
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="src/images/section 6/frame-kanan.png"
          alt="Frame Kanan"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/5 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* --- TULISAN MELAYANG ATAS --- */}
        <div className="absolute top-5 md:top-20 left-0 md:left-2 w-full px-4 md:px-60 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium">

          {/* Purpose Prestige (Kiri Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent left-0 md:left-25 p-2 rounded-full md:p-0 whitespace-pre-line text-left"
          >
            <span className="text-[12px] md:text-[22px] font-medium">
              Purpose{'\n'}Prestige
            </span>
            <img src="/src/images/section 6/purpose.png" alt="Purpose" className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain" />
          </motion.div>

          {/* Rabel Brave (Kanan Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left mr-30 md:mr-80"
          >
            <span className="text-[12px] md:text-[22px] font-medium">Rabel{'\n'}Brave</span>
            <img src="/src/images/section 6/rabel.png" alt="Rabel" className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain" />
          </motion.div>

        </div>

        {/* Gambar Utama: Packaging (Animasi Pop-up / Scale Up) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 w-full max-w-[400px] sm:max-w-[1206px] md:max-w-[400px] lg:max-w-[1206px] flex justify-center"
        >
          <img
            src="src/images/section 6/packaging.png"
            alt="Packaging Main"
            className="object-contain drop-shadow-xl transition-transform duration-300 ease-in-out hover:rotate-2 cursor-pointer"
          />
        </motion.div>

        {/* --- TULISAN MELAYANG BAWAH --- */}
        <div className="absolute bottom-4 md:bottom-18 left-5 md:left-20 w-full px-25 md:px-100 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium">

          {/* Peaceful Calm (Kiri Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left"
          >
            <span className="text-[12px] md:text-[22px] font-medium">Peaceful{'\n'}Calm</span>
            <img src="/src/images/section 6/peaceful.png" alt="Peaceful" className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain" />
          </motion.div>
          
          
          {/* Sweet Shy (Kanan Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left ml-20"
          >
            <span className="text-[12px] md:text-[22px] font-medium">Sweet{'\n'}Shy</span>
            <img src="/src/images/section 6/sweetshy.png" alt="Sweet" className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain" />
          </motion.div>

        </div>

      </div>

      {/* Divider Marquee Looping */}
      <div className="absolute bottom-7 md:bottom-15 left-0 w-full overflow-hidden py-2.5 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <span className="text-[12px] sm:text-[16px] md:text-[23px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image src="/src/images/section 1/purpose.png" alt="Purpose" fill className="object-contain" />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[23px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image src="/src/images/section 1/peaceful.png" alt="Peaceful" fill className="object-contain" />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[23px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image src="/src/images/section 1/rab.png" alt="Rab" fill className="object-contain" />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[23px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image src="/src/images/section 1/sweetshy.png" alt="Sweet Shy" fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
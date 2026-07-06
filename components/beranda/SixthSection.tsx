"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function SixthSection() {
  // Variabel animasi standar untuk efek muncul dari bawah
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section
      className="bg-[#1172BA] flex flex-col items-center justify-center pt-4 md:pt-1 pb-15 md:pb-28 overflow-hidden select-none relative"
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
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUpVariants}
        className="relative z-30 flex items-center justify-center gap-2 md:gap-3 text-center px-4 py-2 top-2 mb-2 md:top-12 md:mb-19"
      >
        <h2 className="font-nohemi font-semibold text-[28px] sm:text-[60px] md:text-[42px] font-bold">
          <span className="text-white">Packaging</span>{" "}
          <span className="text-[#A5E194]">Reveal</span>
        </h2>
        <img
          src="src/images/section 6/star-medium.png"
          alt="Star Icon"
          className="w-[14px] h-[14px] md:w-[24px] md:h-[24px] object-contain brightness-0 invert"
        />
      </motion.div>

      {/* 2. Tengah: Area Konten Gambar & Tulisan Melayang */}
      <div className="relative w-full flex flex-col items-center justify-center my-0 px-2 py-2">
        {/* Background Frame Kiri */}
        <motion.img
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="src/images/section 6/frame-kiri.png"
          alt="Frame Kiri"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1/6 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* Background Frame Kanan */}
        <motion.img
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="src/images/section 6/frame-kanan.png"
          alt="Frame Kanan"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/6 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* --- TULISAN MELAYANG ATAS --- */}
        {/* PERUBAHAN: Menghapus batas margin mobile keras, menggunakan px-4 agar pas di kiri-kanan layar S20 */}
        <div className="absolute top-2 md:top-17 left-0 md:left-35 w-full px-4 md:px-60 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium">
          {/* Purpose Prestige (Kiri Atas) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            // {/* PERUBAHAN: Mengatur reset translate khusus mobile agar presisi di samping produk */}
            className="flex items-center gap-1.5 bg-[#1172BA]/40 md:bg-transparent p-1.5 rounded-full md:p-0 whitespace-pre-line text-left translate-x-4 translate-y-2 md:translate-x-[-70px] md:translate-y-[-60px]"
          >
            <span className="text-[10px] md:text-[16px] font-medium leading-tight">
              Purpose{"\n"}Prestige
            </span>
            <img
              src="/src/images/section 6/purpose.png"
              alt="Purpose"
              className="w-[12px] md:w-[24px] h-[12px] md:h-[24px] object-contain"
            />
          </motion.div>

          {/* Rebel Brave (Kanan Atas) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            // {/* PERUBAHAN: Menghapus mr-30 di mobile agar tidak merusak layout flex-justify */}
            className="flex items-center gap-1.5 bg-[#1172BA]/40 md:bg-transparent p-1.5 rounded-full md:p-0 whitespace-pre-line text-left mr-35 md:mr-80 translate-x-0 translate-y-0 md:translate-x-[-245px] md:translate-y-[-58px]"
          >
            <span className="text-[10px] md:text-[16px] font-medium leading-tight">
              Rebel{"\n"}Brave
            </span>
            <img
              src="/src/images/section 6/rabel.png"
              alt="Rabel"
              className="w-[12px] md:w-[24px] h-[12px] md:h-[24px] object-contain"
            />
          </motion.div>
        </div>

        {/* Gambar Utama: Packaging */}
        <motion.div
          // PERUBAHAN: Mengubah scale awal & akhir agar efek pop-up gambarnya terlihat lebih besar di mobile
          initial={{ opacity: 0, scale: 0.75, y: 30 }}
          whileInView={{ opacity: 1, scale: 0.9, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          // PERUBAHAN: Mengubah max-w-[72%] menjadi max-w-[82%] agar ukuran dasar container gambar lebih lebar
          className="relative z-20 w-full h-fit py-[36px] md:py-[25px] max-w-[85%] sm:max-w-[400px] md:max-w-[800px] lg:max-w-[1206px] bg-transparent mx-auto"
        >
          <img
            src="src/images/section 6/packaging.png"
            alt="Packaging Main"
            className="w-full h-auto block object-contain drop-shadow-xl transition-all duration-500 ease-out hover:rotate-2 hover:scale-[1.02] cursor-pointer bg-transparent"
          />
        </motion.div>

        {/* --- TULISAN MELAYANG BAWAH --- */}
        {/* PERUBAHAN: Mengganti px-25 menjadi px-4 di mobile untuk mencegah teks terpotong keluar viewport */}
        <div className="absolute bottom-2 md:bottom-18 left-0 md:left-20 w-full px-4 md:px-100 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium translate-x-0 md:translate-x-[15px]">
          {/* Peaceful Calm (Kiri Bawah) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            // {/* PERUBAHAN: Mengatur ulang translate mobile agar seimbang dengan posisi atas */}
            className="flex items-center gap-1.5 bg-[#1172BA]/40 md:bg-transparent p-1.5 rounded-full md:p-0 whitespace-pre-line text-left translate-x-25 md:translate-x-35 translate-y-0 md:translate-y-[52px]"
          >
            <span className="text-[10px] md:text-[16px] font-medium leading-tight">
              Peaceful{"\n"}Calm
            </span>
            <img
              src="/src/images/section 6/peaceful.png"
              alt="Peaceful"
              className="w-[12px] md:w-[24px] h-[12px] md:h-[24px] object-contain"
            />
          </motion.div>

          {/* Sweet Shy (Kanan Bawah) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            // {/* PERUBAHAN: Menghapus ml-20 di mobile agar teks tidak terdorong menabrak sisi kanan layar */}
            className="flex items-center gap-1.5 bg-[#1172BA]/40 md:bg-transparent p-1.5 rounded-full md:p-0 whitespace-pre-line text-left mr-15 translate-x-0 translate-y-0 md:translate-x-[-60px] md:translate-y-[48px]"
          >
            <span className="text-[10px] md:text-[16px] font-medium leading-tight">
              Sweet{"\n"}Shy
            </span>
            <img
              src="/src/images/section 6/sweetshy.png"
              alt="Sweet"
              className="w-[12px] md:w-[24px] h-[12px] md:h-[24px] object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Divider Marquee Looping */}
      <div className="absolute bottom-4 md:mt-1 md:bottom-10 left-0 w-full overflow-hidden py-2 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <span className="text-[12px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/purpose.png"
                  alt="Purpose"
                  fill
                  className="object-contain"
                />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/peaceful.png"
                  alt="Peaceful"
                  fill
                  className="object-contain"
                />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/rab.png"
                  alt="Rab"
                  fill
                  className="object-contain"
                />
              </div>

              <span className="text-[12px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
                Every Version of Me
              </span>
              <div className="relative w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/sweetshy.png"
                  alt="Sweet Shy"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

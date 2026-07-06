"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function FourthSection() {
  // Variabel untuk animasi muncul dari bawah
  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative bg-white w-full min-h-[350px] sm:min-h-[500px] md:min-h-[700px] flex justify-center items-center pt-10 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-15 overflow-hidden">
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
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

      {/* 1. Background Image (z-0) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/src/images/section 4/tutup-botol.png"
          alt="Background Tutup Botol"
          fill
          className="object-cover object-center"
          quality={90}
        />
      </div>

      {/* Kontainer batas untuk menahan posisi elemen melayang (z-10) */}
      <div className="relative z-10 w-full max-w-6xl min-h-[300px] sm:min-h-[400px] md:min-h-[600px] px-4 md:px-6">
        {/* --- GROUP ATAS KANAN --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={fadeInVariants}
          className="absolute top-4 sm:top-6 md:top-0 right-17 md:right-4 flex flex-row items-center gap-2 sm:gap-3 md:gap-6"
        >
          <p className="font-['Nohemi'] text-[14px] sm:text-[14px] mx-5 md:text-[22.2px] text-[#5D5D5D] font-semibold whitespace-pre-line text-right z-10 md:mr-27 leading-tight md:leading-normal">
            Tidak ada yang kita buang{"\n"}benar-benar pergi,
          </p>

          <div className="flex flex-col items-center z-10">
            <div className="relative w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] md:w-[55px] md:h-[55px] cursor-pointer transition-transform duration-1500 ease-in-out hover:rotate-[180deg]">
              <Image
                src="/src/images/section 4/recycle.png"
                alt="Recycle Icon"
                fill
                className="object-contain"
              />
            </div>
            <div className="group perspective inline-block cursor-pointer">
              <div className="transition-transform duration-500 transform-style-3d group-hover:rotate-y-360">
                <p className="font-['Nohemi'] text-[14px] sm:text-[14px] md:text-[22.8px] text-[#1172BA] font-semibold text-center whitespace-pre-line mt-1 md:mt-2 leading-tight md:leading-normal backface-hidden">
                  Recycle{"\n"}Plastic Cap
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- GROUP BAWAH KIRI --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={fadeInVariants}
          transition={{ delay: 0.3 }}
          className="absolute bottom-12 sm:bottom-16 md:bottom-15 left-10 md:left-12 flex flex-row items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 z-10 w-full md:w-auto pr-4"
        >
          <p className="font-['Nohemi'] text-[14px] sm:text-[14px] md:text-[22.2px] mx-2 text-[#5D5D5D] font-semibold whitespace-pre-line leading-tight md:leading-normal">
            Apa yang kita buang{"\n"}bisa melilit Bumi
          </p>

          <p className="font-['Nohemi'] text-[14px] sm:text-[16px] md:text-[22.5px] mx-5 font-semibold text-[#1172BA] whitespace-pre-line text-center ml-1 sm:ml-4 md:ml-10 lg:ml-20 leading-tight md:leading-normal">
            <span className="text-[14px] sm:text-[20px] md:text-[35px]">
              25x
            </span>
            {"\n"} putaran
          </p>

          <p className="font-['Nohemi'] text-[14px] sm:text-[14px] md:text-[22.2px] text-[#5D5D5D] font-semibold whitespace-pre-line ml-1 sm:ml-4 md:ml-10 lg:ml-20 leading-tight md:leading-normal">
            dia akan{"\n"}kembali dalam{"\n"} bentuk yang{"\n"} berbeda
          </p>
        </motion.div>
      </div>

      {/* --- DIVIDER ANIMASI BAWAH (WAVE) --- */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] overflow-hidden z-20">
        <style>{`
          @keyframes wave-divider-fast { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes wave-divider-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-wave-div-fast { animation: wave-divider-fast 7s linear infinite; }
          .animate-wave-div-slow { animation: wave-divider-slow 11s linear infinite; }
          .perspective { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .group-hover\\:rotate-y-360:hover { transform: rotateY(360deg); }
        `}</style>

        <svg
          className="animate-wave-div-slow absolute bottom-0 block w-[200%] h-[30px] sm:h-[50px] md:h-[80px] opacity-50"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 0 500 50 T 1000 50 T 1500 50 T 2000 50 V 100 H 0 Z"
            fill="#60BBFF"
          />
        </svg>

        <svg
          className="animate-wave-div-fast relative block w-[200%] h-[20px] sm:h-[40px] md:h-[65px]"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 100 500 50 T 1000 50 T 1500 50 T 2000 50 V 100 H 0 Z"
            fill="#60BBFF"
          />
        </svg>
      </div>
    </section>
  );
}

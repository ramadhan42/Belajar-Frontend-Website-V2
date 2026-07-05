"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScrollVisible, setIsScrollVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacityScroll = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yScroll = useTransform(scrollYProgress, [0, 0.6], [0, -50]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.6) {
      setIsScrollVisible(false);
    } else {
      setIsScrollVisible(true);
    }
  });

  const shouldAnimate = isReady && isScrollVisible;

  const floatAnimation = {
    animate: {
      y: [0, 20, 0],
    },
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  };

  return (
    <section
      ref={sectionRef}
      // Disesuaikan: mengubah pb-23 menjadi pb-10 agar jarak bagian bawah section tidak terlalu kosong/renggang
      className="hero-section bg-[#0071BC] md:mb-6 md:mt-2 mt-[-15] text-white pt-0 pb-10 md:pb-10 px-4 flex flex-col items-center justify-center text-center select-none overflow-hidden relative"
    >
      <style>{`
        .gambar-utama-hover {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translate(-50%, -50%) scale(1) rotate(0deg); 
        }
        
        .gambar-utama-hover:hover {
          transform: translate(-50%, -50%) scale(1.04) rotate(2.5deg);
        }

        @keyframes flashFadeOnce {
          0% { filter: brightness(1); opacity: 1; }
          40% { filter: brightness(1.5); opacity: 0.6; }
          100% { filter: brightness(1); opacity: 1; }
        }
        .sayap-hover-effect:hover {
          animation: flashFadeOnce 0.8s ease-in-out;
        }

        .badge-kiri-rotate {
          transform: rotate(15deg);
          transition: transform 0.3s ease-out;
        }
        .badge-kiri-rotate:hover {
          transform: rotate(17deg);
        }

        .badge-kanan-rotate {
          transform: rotate(-15deg);
          transition: transform 0.3s ease-out;
        }
        .badge-kanan-rotate:hover {
          transform: rotate(-17deg);
        }

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

      {/* Wrapper Utama */}
      <motion.div
        style={{ opacity: opacityScroll, y: yScroll }}
        // Disesuaikan: Menghapus gap dan margin (m-0, p-0, gap-0) agar benar-benar rapat
        className="w-full flex flex-col items-center justify-center flex-1 z-10 gap-0 m-0 p-0"
      >
        {/* 1. Judul Utama */}
        <motion.h1
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          // Disesuaikan: Menghapus margin (m-0) agar judul mepet ke gambar di bawahnya
          className="font-nohemi font-semibold text-[17px] sm:text-[60px] md:text-[42px] leading-[1] m-0 p-0"
        >
          <span className="text-white">Temukan </span>
          <span className="text-[#5CB2ED]">karakter</span>
          <br />
          <span className="text-[#FFA3CB]">aromamu </span>
          <span className="text-white">di Evomi</span>
        </motion.h1>

        {/* 2. Image Poster Area */}
        {/* Disesuaikan: Margin vertikal (mt dan mb) diminimalkan agar jarak antar elemen sangat sempit */}
        <div className="relative mt-2 mb-0 md:mt-3 md:mb-0 w-[100%] md:w-[90%] lg:w-full max-w-7xl mx-auto aspect-[1280/412]">
          
          {/* GAMBAR BACKGROUND (WAVE) SEBAGAI PENGGANTI SAYAP */}
          <motion.div
            animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
            className="absolute top-[-7] left-1/2 -translate-x-1/2 md:top-[-50] w-[100vw] h-full z-0 overflow-hidden"
          >
            <Image
              src="/src/images/section 1/wave.png" 
              alt="Wave Background"
              fill
              className="object-contain object-center"
              priority
              quality={100}
            />
          </motion.div>

          {/* Floating Texts */}

          {/* purpose */}
          <motion.div
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
            }
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute left-[30%] md:left-[28%] top-[2%] md:top-[4%] w-[9%] h-[9%] md:w-[8%] md:h-[8%] z-20 transition-transform duration-300 ease-out hover:-rotate-[5deg] cursor-pointer"
          >
            <Image
              src="/src/images/section 1/purpose-prestige.png"
              alt="Purpose Prestige"
              fill
              className="object-contain"
            />
          </motion.div>

          {/* rebel */}
          <motion.div
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
            }
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute left-[42%] top-[10.8%] md:top-[12.8%] w-[7%] h-[7%] md:w-[6%] md:h-[6%] z-20 transition-transform duration-300 ease-out hover:-rotate-[5deg] cursor-pointer"
          >
            <Image
              src="/src/images/section 1/rabel-brave.png"
              alt="Rabel Brave"
              fill
              className="object-contain"
            />
          </motion.div>

          {/* peaceful */}
          <motion.div
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
            }
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute right-[38%] top-[7%] md:top-[3.8%] w-[8%] h-[8%] md:w-[7%] md:h-[7%] z-20 transition-transform duration-300 ease-out hover:rotate-[5deg] cursor-pointer"
          >
            <Image
              src="/src/images/section 1/peaceful-calm.png"
              alt="Peaceful Calm"
              fill
              className="object-contain"
            />
          </motion.div>

          {/* sweet shy */}
          <motion.div
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
            }
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute right-[27%] md:right-[28%] top-[10.4%] md:top-[10.8%] w-[7%] h-[7%] md:w-[6%] md:h-[6%] z-20 transition-transform duration-300 ease-out hover:rotate-[5deg] cursor-pointer"
          >
            <Image
              src="/src/images/section 1/sweet-shy.png"
              alt="Sweet Shy"
              fill
              className="object-contain"
            />
          </motion.div>

          {/* Badges */}

          {/* Eau de parfum */}
          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8 }
                : { opacity: 0, scale: 0.7 }
            }
            transition={{ duration: 0.5, delay: 0.8 }}
            className="rotate-[15deg] origin-bottom-right badge-kiri-rotate cursor-pointer absolute left-[7%] md:left-[12.8%] bottom-[3%] md:bottom-[12.4%] mt-2 md:mt-5 inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[7px] sm:text-[10px] md:text-[14px] font-bold px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
          >
            <svg
              className="w-2 h-2 sm:w-3 sm:h-3 md:w-5 md:h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z"
                fill="#F899C6"
              />
            </svg>
            <p className="whitespace-nowrap">Eau de Parfum</p>
          </motion.div>

          {/* Recycle Bottle */}
          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8 }
                : { opacity: 0, scale: 0.7 }
            }
            transition={{ duration: 0.5, delay: 0.9 }}
            className="rotate-[-12deg] origin-bottom-leftbadge-kanan-rotate cursor-pointer absolute right-[7%] md:right-[7.7%] bottom-[4%] md:bottom-[12.4%] mt-2 md:mt-5 inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[7px] sm:text-[10px] md:text-[14px] font-bold px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
          >
            <div className="relative w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4">
              <Image
                src="/src/images/section 1/recycle.png"
                alt="Recycle Icon"
                fill
                className="object-contain"
              />
            </div>
            <p className="whitespace-nowrap">Recycle Bottle Cap</p>
          </motion.div>

          {/* GAMBAR UTAMA (4 Botol) */}
          <div className="relative top-20 md:top-65 left-1/2 -translate-x-2/5 -translate-y-1/2 z-10 w-[76.1%] h-[60%] flex items-center justify-between gap-1 md:gap-4 bg-transparent cursor-pointer">
            
            {/* Botol 1 - Purpose Prestige */}
            <motion.div
              animate={
                shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
              }
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative w-full h-full left-[19.7%] top-[22.5%]"
            >
              <motion.div
                animate={shouldAnimate ? { y: isMobile ? [-2, 2, -2] : [-10, 10, -10] } : {}}
                transition={{
                  duration: isMobile ? 3 : 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }}
                className="relative w-full h-full"
              >
                <div className="w-full h-full scale-100 rotate-3">
                  <Image
                    src="/src/images/section 1/botol-purpose-prestige.png"
                    alt="Botol Purpose Prestige"
                    fill
                    className="object-contain gambar-utama-hover"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Botol 2 - Rabel Brave */}
            <motion.div
              animate={
                shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
              }
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative w-full h-full left-[10.7%] top-[32%] z-30"
            >
              <motion.div
                animate={shouldAnimate ? { y: isMobile ? [-2, 2, -2] : [-10, 10, -10] } : {}}
                transition={{
                  duration: isMobile ? 3 : 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.4,
                }}
                className="relative w-full h-full"
              >
                <div className="w-full h-full scale-100 -rotate-3">
                  <Image
                    src="/src/images/section 1/botol-rabel-brave.png"
                    alt="Botol Rabel Brave"
                    fill
                    className="object-contain gambar-utama-hover"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Botol 3 - Peaceful Calm */}
            <motion.div
              animate={
                shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
              }
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative w-full h-full top-[23%] right-[1%]"
            >
              <motion.div
                animate={shouldAnimate ? { y: isMobile ? [-2, 2, -2] : [-10, 10, -10] } : {}}
                transition={{
                  duration: isMobile ? 3 : 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.7,
                }}
                className="relative w-full h-full"
              >
                <div className="w-full h-full scale-100 rotate-4">
                  <Image
                    src="/src/images/section 1/botol-peaceful-calm.png"
                    alt="Botol Peaceful Calm"
                    fill
                    className="object-contain gambar-utama-hover"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Botol 4 - Sweet Shy */}
            <motion.div
              animate={
                shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
              }
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative w-full h-full left-[-9.5%] top-[27%] z-30"
            >
              <motion.div
                animate={shouldAnimate ? { y: isMobile ? [-2, 2, -2] : [-10, 10, -10] } : {}}
                transition={{
                  duration: isMobile ? 3 : 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.0,
                }}
                className="relative w-full h-full"
              >
                <div className="w-full h-full scale-100 -rotate-4">
                  <Image
                    src="/src/images/section 1/botol-sweet-shy.png"
                    alt="Botol Sweet Shy"
                    fill
                    className="object-contain gambar-utama-hover"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Divider Marquee Looping */}
      <div className="absolute bottom-2 md:mt-5 md:bottom-0 left-0 w-full overflow-hidden py-1.5 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <span className="text-[8px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
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

              <span className="text-[8px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
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

              <span className="text-[8px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
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

              <span className="text-[8px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
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
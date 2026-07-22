"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/context/CmsContext";

const HERO_PRODUCTS = [
  {
    id: 1,
    title: "Purpose Prestige",
    image: "/src/images/section 1/botol-purpose-prestige.png",
    labelImage: "/src/images/section 1/purpose-prestige.png",
    labelClass:
      "left-[30%] md:left-[31%] top-[2%] md:top-[4%] w-[9.3%] h-[9.3%] md:w-[8.2%] md:h-[8.2%] hover:-rotate-[5deg]",
    wrapClass: "left-[19.7%] top-[22.5%]",
    rotateClass: "rotate-3",
    floatDelay: 1.1,
    zClass: "",
  },
  {
    id: 3,
    title: "Rebel Brave",
    image: "/src/images/section 1/botol-rabel-brave.png",
    labelImage: "/src/images/section 1/rabel-brave.png",
    labelClass:
      "left-[43%] top-[10.8%] md:top-[12.8%] w-[7.2%] h-[7.2%] md:w-[6.2%] md:h-[6.2%] hover:-rotate-[5deg]",
    wrapClass: "left-[10.7%] top-[32%]",
    rotateClass: "-rotate-3",
    floatDelay: 1.4,
    zClass: "z-30",
  },
  {
    id: 2,
    title: "Peaceful Calm",
    image: "/src/images/section 1/botol-peaceful-calm.png",
    labelImage: "/src/images/section 1/peaceful-calm.png",
    labelClass:
      "right-[38%] top-[7%] md:top-[3.8%] w-[8.2%] h-[8.2%] md:w-[7.2%] md:h-[7.2%] hover:rotate-[5deg]",
    wrapClass: "top-[23%] right-[1%]",
    rotateClass: "rotate-4",
    floatDelay: 1.7,
    zClass: "",
  },
  {
    id: 4,
    title: "Sweet Shy",
    image: "/src/images/section 1/botol-sweet-shy.png",
    labelImage: "/src/images/section 1/sweet-shy.png",
    labelClass:
      "right-[27%] md:right-[28%] top-[10.4%] md:top-[10.8%] w-[7.2%] h-[7.2%] md:w-[6.2%] md:h-[6.2%] hover:rotate-[5deg]",
    wrapClass: "left-[-9.5%] top-[27%]",
    rotateClass: "-rotate-4",
    floatDelay: 2.0,
    zClass: "z-30",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const { tBeranda } = useCms();
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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.6) {
      setIsScrollVisible(false);
    } else {
      setIsScrollVisible(true);
    }
  });

  const opacityScroll = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yScroll = useTransform(scrollYProgress, [0, 0.6], [0, -50]);
  const shouldAnimate = isReady && isScrollVisible;

  const handleProductClick = (id: number) => {
    router.push(`/belanja/${id}`);
  };

  return (
    <section
      ref={sectionRef}
      // Disesuaikan: mengubah pb-23 menjadi pb-10 agar jarak bagian bawah section tidak terlalu kosong/renggang
      className="hero-section bg-[#0071BC] md:mb-6 md:mt-10 text-white pt-4 pb-10 md:pt-0 md:pb-10 px-4 flex flex-col items-center justify-center text-center select-none overflow-hidden relative"
    >
      <style>{`
        .gambar-utama-hover {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translate(-50%, -50%) scale(1) rotate(0deg); 
        }
        
        .hero-product-hit:hover .gambar-utama-hover {
          transform: translate(-50%, -50%) scale(1.04) rotate(2.5deg);
        }

        .hero-product-hit {
          cursor: pointer;
        }

        .hero-label-hit {
          cursor: pointer;
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

        .hero-wave-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: visible;
        }

        .hero-wave-svg {
          position: absolute;
          overflow: visible;
        }

        .hero-wave-svg path {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.12));
        }

        .hero-wave-left {
          left: -11%;
          top: -35%;
          width: 46%;
          height: auto;
          aspect-ratio: 394 / 269;
          transform: scale(1.14) rotate(-9deg);
          transform-origin: 88% 78%;
        }

        .hero-wave-right {
          right: -11%;
          top: -50%;
          width: 40%;
          height: auto;
          aspect-ratio: 418 / 449;
          transform: scale(1.14) rotate(9deg);
          transform-origin: 12% 78%;
        }

        @media (max-width: 767px) {
          .hero-wave-left {
            left: -17%;
            top: -31%;
            width: 56%;
            transform: scale(1.12) rotate(-8deg);
            transform-origin: 88% 78%;
          }

          .hero-wave-right {
            right: -17%;
            top: -46%;
            width: 48%;
            transform: scale(1.12) rotate(8deg);
            transform-origin: 12% 78%;
          }
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
          className="font-nohemi font-semibold text-[28px] md:text-[42px] leading-[1.1] m-0 p-0"
        >
          <span className="text-white">
            {tBeranda("hero", "headline_1", "Temukan")}{" "}
          </span>
          <span className="text-[#5CB2ED]">
            {tBeranda("hero", "headline_2", "karakter")}
          </span>
          <br />
          <span className="text-[#FFA3CB]">
            {tBeranda("hero", "headline_3", "aromamu")}{" "}
          </span>
          <span className="text-white">
            {tBeranda("hero", "headline_4", "di Evomi")}
          </span>
        </motion.h1>

        {/* 2. Image Poster Area */}
        {/* Disesuaikan: Margin vertikal (mt dan mb) diminimalkan agar jarak antar elemen sangat sempit */}
        <div className="relative mt-2 mb-0 md:mt-3 md:mb-0 w-[100%] md:w-[90%] lg:w-full max-w-7xl mx-auto aspect-[1280/412]">
          {/* Wave dekorasi — dari produk ke atas kiri & kanan */}
          <div className="hero-wave-layer sayap-hover-effect" aria-hidden>
            {/* Sayap kiri */}
            <motion.div
              className="hero-wave-svg hero-wave-left"
              initial={{ opacity: 0 }}
              animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
              transition={{
                duration: 1.15,
                delay: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="w-full h-auto will-change-transform"
                style={{ transformOrigin: "88% 78%" }}
                animate={
                  shouldAnimate
                    ? {
                        rotate: isMobile
                          ? [-1.6, 1.8, -1.6]
                          : [-2.4, 2.8, -2.4],
                        y: isMobile ? [0, -5, 0] : [0, -10, 0],
                        scale: [1, 1.03, 1],
                      }
                    : { rotate: 0, y: 0, scale: 1 }
                }
                transition={{
                  duration: isMobile ? 5.2 : 6.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }}
              >
                <svg
                  className="w-full h-auto block overflow-visible"
                  viewBox="0 0 394 269"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="heroWaveLeftGrad"
                      x1="-16.1182"
                      y1="57.6073"
                      x2="385.318"
                      y2="143.822"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.339313" stopColor="#60BBFF" />
                      <stop offset="1" stopColor="#FF8A84" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M249.353 208.572C227.104 254.765 336.005 229.301 393.236 210.795L391.597 225.206C240.842 287.445 208.166 270.156 206.182 247.054C204.198 223.951 268.222 182.812 179.508 180.809C90.7932 178.807 64.5628 160.794 64.6262 140.17C64.6895 119.546 109.343 90.8905 73.5016 87.1579C44.8283 84.1719 19.1086 93.2575 9.8329 98.1736L-34.5957 0C39.6156 62.1945 77.1964 34.9117 133.299 67.9779C189.402 101.044 75.6897 118.705 125.496 141.25C175.302 163.794 277.164 150.83 249.353 208.572Z"
                    fill="url(#heroWaveLeftGrad)"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Sayap kanan */}
            <motion.div
              className="hero-wave-svg hero-wave-right"
              initial={{ opacity: 0 }}
              animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
              transition={{
                duration: 1.15,
                delay: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="w-full h-auto will-change-transform"
                style={{ transformOrigin: "12% 78%" }}
                animate={
                  shouldAnimate
                    ? {
                        rotate: isMobile
                          ? [1.6, -1.8, 1.6]
                          : [2.4, -2.8, 2.4],
                        y: isMobile ? [0, -5, 0] : [0, -10, 0],
                        scale: [1.025, 1, 1.025],
                      }
                    : { rotate: 0, y: 0, scale: 1 }
                }
                transition={{
                  duration: isMobile ? 5.6 : 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.45,
                }}
              >
                <svg
                  className="w-full h-auto block overflow-visible"
                  viewBox="0 0 418 449"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="heroWaveRightGradOuter"
                      x1="446.42"
                      y1="74.4447"
                      x2="-7.16213"
                      y2="352.017"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.333877" stopColor="#A5E194" />
                      <stop offset="1" stopColor="#F899C6" />
                    </linearGradient>
                    <linearGradient
                      id="heroWaveRightGradInner"
                      x1="470.42"
                      y1="79.4447"
                      x2="16.8379"
                      y2="357.017"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.333877" stopColor="#A5E194" />
                      <stop offset="1" stopColor="#F899C6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M167.875 341.839C203.726 388.975 72.4872 382.731 2.3867 373.718L7.45438 389.505C195.083 428.343 228.966 402.325 226.161 376.073C223.356 349.821 140.429 316.873 242.326 296.511C344.223 276.148 370.51 250.637 365.89 227.577C361.27 204.516 303.441 181.578 343.964 170.08C376.382 160.882 408.055 165.793 419.839 169.399L449.445 50.4874C377.55 135.229 328.182 112.382 270.754 160.837C213.326 209.291 348.395 205.822 295.91 241.219C243.426 276.615 123.062 282.919 167.875 341.839Z"
                    fill="url(#heroWaveRightGradOuter)"
                  />
                  <path
                    d="M191.875 346.839C227.726 393.975 96.4872 387.731 26.3867 378.718L31.4544 394.505C219.083 433.343 252.966 407.325 250.161 381.073C247.356 354.821 164.429 321.873 266.326 301.511C368.223 281.148 394.51 255.637 389.89 232.577C385.27 209.516 327.441 186.578 367.964 175.08C400.382 165.882 432.055 170.793 443.839 174.399L473.445 55.4874C401.55 140.229 352.182 117.382 294.754 165.837C237.326 214.291 372.395 210.822 319.91 246.219C267.426 281.615 147.062 287.919 191.875 346.839Z"
                    fill="url(#heroWaveRightGradInner)"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating Labels */}
          {HERO_PRODUCTS.map((product) => (
            <motion.button
              key={`label-${product.id}`}
              type="button"
              animate={
                shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
              }
              transition={{ duration: 0.6, delay: 1.0 }}
              onClick={() => handleProductClick(product.id)}
              aria-label={`Lihat detail ${product.title}`}
              className={`hero-label-hit absolute z-40 transition-transform duration-300 ease-out bg-transparent border-0 p-0 ${product.labelClass}`}
            >
              <Image
                src={product.labelImage}
                alt={product.title}
                fill
                className="object-contain pointer-events-none"
              />
            </motion.button>
          ))}

          {/* Badges */}
          {/* Eau de parfum — samping kiri 4 botol */}
          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8, rotate: 15 }
                : { opacity: 0, scale: 0.7, rotate: 15 }
            }
            transition={{ duration: 0.5, delay: 0.8 }}
            className="origin-bottom-right cursor-pointer absolute left-[4%] md:left-[9%] top-[8%] md:top-[5%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[7px] sm:text-[10px] md:text-[14px] font-bold px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
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
            <p className="whitespace-nowrap">
              {tBeranda("hero", "badge_left", "Eau de Parfum")}
            </p>
          </motion.div>

          {/* Recycle Bottle */}
          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8, rotate: -12 }
                : { opacity: 0, scale: 0.7, rotate: -12 }
            }
            transition={{ duration: 0.5, delay: 0.9 }}
            className="origin-bottom-left cursor-pointer absolute right-[4%] md:right-[4.7%] bottom-[72%] md:bottom-[80.4%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[7px] sm:text-[10px] md:text-[14px] font-bold px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
          >
            <div className="relative w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4">
              <Image
                src="/src/images/section 1/recycle.png"
                alt="Recycle Icon"
                fill
                className="object-contain"
              />
            </div>
            <p className="whitespace-nowrap">
              {tBeranda("hero", "badge_right", "Recycle Bottle Cap")}
            </p>
          </motion.div>

          {/* GAMBAR UTAMA (4 Botol) */}
          <div className="relative top-20 md:top-65 left-1/2 -translate-x-2/5 -translate-y-[46%] z-10 w-[80%] h-[63%] flex items-center justify-between gap-1 md:gap-4 bg-transparent overflow-visible">
            {HERO_PRODUCTS.map((product) => (
              <motion.div
                key={product.id}
                animate={
                  shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
                }
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className={`relative w-full h-full ${product.wrapClass} ${product.zClass}`}
              >
                <motion.div
                  animate={
                    shouldAnimate
                      ? { y: isMobile ? [-2, 2, -2] : [-10, 10, -10] }
                      : {}
                  }
                  transition={{
                    duration: isMobile ? 3 : 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: product.floatDelay,
                  }}
                  className="relative w-full h-full"
                >
                  <button
                    type="button"
                    className={`hero-product-hit relative w-full h-full scale-100 ${product.rotateClass} bg-transparent border-0 p-0`}
                    aria-label={`Lihat detail ${product.title}`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Image
                      src={product.image}
                      alt={`Botol ${product.title}`}
                      fill
                      className="object-contain gambar-utama-hover pointer-events-none"
                      priority
                    />
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Divider Marquee Looping */}
      <div className="absolute bottom-2 md:mt-5 md:bottom-0 left-0 w-full overflow-hidden py-1.5 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <span className="text-[8px] sm:text-[16px] md:text-[14px] font-medium whitespace-nowrap text-white">
                {tBeranda("hero", "marquee_text", "Every Version of Me")}
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
                {tBeranda("hero", "marquee_text", "Every Version of Me")}
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
                {tBeranda("hero", "marquee_text", "Every Version of Me")}
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
                {tBeranda("hero", "marquee_text", "Every Version of Me")}
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

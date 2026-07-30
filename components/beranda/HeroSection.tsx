"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef, useState, useEffect, useMemo, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/context/CmsContext";
import { useLocale } from "@/context/LocaleContext";
import { resolveCmsImage } from "@/lib/cms";
import {
  HERO_STYLE_DEFAULTS,
  HeroStyleKey,
} from "@/lib/heroCmsStyles";
import {
  resolveCmsFontFamily,
  resolveCmsFontStyle,
  resolveCmsFontWeight,
} from "@/lib/cmsFonts";

/** Keep hero PNGs close to source fidelity when scaled down. */
const HERO_IMG_QUALITY = 100;

function isSvgSrc(src: string) {
  return /\.svg(\?|$)/i.test(src);
}

/** Raster uploads can replace wings; SVG-as-<img> clips paths outside viewBox. */
function isRasterSrc(src: string) {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(src);
}

const HERO_PRODUCT_LAYOUT = [
  {
    id: 1,
    cmsKey: "product1" as const,
    titleFallback: "Purpose Prestige",
    imageFallback: "/src/images/section 1/botol-purpose-prestige.png",
    labelFallback: "/src/images/section 1/purpose-prestige.png",
    labelClass:
      "left-[30%] md:left-[31%] top-[2%] md:top-[4%] w-[9.3%] h-[9.3%] md:w-[8.2%] md:h-[8.2%] hover:-rotate-[5deg]",
    floatDelay: 1.1,
    zClass: "z-20",
    bgClass: "bg-transparent",
  },
  {
    id: 3,
    cmsKey: "product2" as const,
    titleFallback: "Rebel Brave",
    imageFallback: "/src/images/section 1/botol-rabel-brave.png",
    labelFallback: "/src/images/section 1/rabel-brave.png",
    labelClass:
      "left-[43%] top-[10.8%] md:top-[12.8%] w-[7.2%] h-[7.2%] md:w-[6.2%] md:h-[6.2%] hover:-rotate-[5deg]",
    floatDelay: 1.4,
    zClass: "z-30",
    bgClass: "bg-transparent",
  },
  {
    id: 2,
    cmsKey: "product3" as const,
    titleFallback: "Peaceful Calm",
    imageFallback: "/src/images/section 1/botol-peaceful-calm.png",
    labelFallback: "/src/images/section 1/peaceful-calm.png",
    labelClass:
      "right-[38%] top-[10%] md:top-[6.8%] w-[8.2%] h-[8.2%] md:w-[7.2%] md:h-[7.2%] hover:rotate-[5deg]",
    floatDelay: 1.7,
    zClass: "",
    bgClass: "bg-transparent",
  },
  {
    id: 4,
    cmsKey: "product4" as const,
    titleFallback: "Sweet Shy",
    imageFallback: "/src/images/section 1/botol-sweet-shy.png",
    labelFallback: "/src/images/section 1/sweet-shy.png",
    labelClass:
      "right-[27%] md:right-[28%] top-[10.4%] md:top-[10.8%] w-[7.2%] h-[7.2%] md:w-[6.2%] md:h-[6.2%] hover:rotate-[5deg]",
    floatDelay: 2.0,
    zClass: "z-30",
    bgClass: "bg-transparent",
  },
];

const DIVIDER_ICON_FALLBACKS = [
  "/src/images/section 1/purpose.png",
  "/src/images/section 1/peaceful.png",
  "/src/images/section 1/rab.png",
  "/src/images/section 1/sweetshy.png",
];

function scaleCss(value: string) {
  const n = Number.parseFloat(value);
  if (Number.isFinite(n)) return String(n / 100);
  return "1";
}

function degCss(value: string) {
  const n = Number.parseFloat(value);
  if (Number.isFinite(n)) return `${n}deg`;
  return "0deg";
}

export default function HeroSection() {
  const router = useRouter();
  const { tBeranda } = useCms();
  const { isLocaleLoading } = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScrollVisible, setIsScrollVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const styleVal = (key: HeroStyleKey) => {
    const raw = tBeranda("hero", key, HERO_STYLE_DEFAULTS[key]);
    const trimmed = raw.trim();
    return trimmed || HERO_STYLE_DEFAULTS[key];
  };

  const products = useMemo(
    () =>
      HERO_PRODUCT_LAYOUT.map((layout) => ({
        ...layout,
        title: tBeranda(
          "hero",
          `${layout.cmsKey}_badge_label`,
          layout.titleFallback,
        ),
        image:
          resolveCmsImage(
            tBeranda("hero", `${layout.cmsKey}_image`, ""),
          ) || layout.imageFallback,
        labelImage:
          resolveCmsImage(
            tBeranda("hero", `${layout.cmsKey}_badge_icon`, ""),
          ) || layout.labelFallback,
      })),
    [tBeranda],
  );

  const headlineColors = {
    1: tBeranda("hero", "headline_1_color", "#FFFFFF"),
    2: tBeranda("hero", "headline_2_color", "#5CB2ED"),
    3: tBeranda("hero", "headline_3_color", "#FFA3CB"),
    4: tBeranda("hero", "headline_4_color", "#FFFFFF"),
  };

  const badgeLeftIcon =
    resolveCmsImage(tBeranda("hero", "badge_left_icon", "")) ||
    "/src/images/section 1/badge-left-star.svg";
  const badgeRightIcon =
    resolveCmsImage(tBeranda("hero", "badge_right_icon", "")) ||
    "/src/images/section 1/recycle.png";

  const dividerIcons = DIVIDER_ICON_FALLBACKS.map(
    (fallback, i) =>
      resolveCmsImage(tBeranda("hero", `divider_icon_${i + 1}`, "")) ||
      fallback,
  );

  const marqueeText = tBeranda(
    "hero",
    "marquee_text",
    "Every Version of Me",
  );

  const heroCssVars = {
    "--hero-hl1-ff": resolveCmsFontFamily(styleVal("headline_1_font_family")),
    "--hero-hl1-fw": resolveCmsFontWeight(styleVal("headline_1_font_weight"), "600"),
    "--hero-hl1-fst": resolveCmsFontStyle(styleVal("headline_1_font_style")),
    "--hero-hl1-fs-m": styleVal("headline_1_fs_mobile"),
    "--hero-hl1-fs-d": styleVal("headline_1_fs_desktop"),
    "--hero-hl2-ff": resolveCmsFontFamily(styleVal("headline_2_font_family")),
    "--hero-hl2-fw": resolveCmsFontWeight(styleVal("headline_2_font_weight"), "600"),
    "--hero-hl2-fst": resolveCmsFontStyle(styleVal("headline_2_font_style")),
    "--hero-hl2-fs-m": styleVal("headline_2_fs_mobile"),
    "--hero-hl2-fs-d": styleVal("headline_2_fs_desktop"),
    "--hero-hl3-ff": resolveCmsFontFamily(styleVal("headline_3_font_family")),
    "--hero-hl3-fw": resolveCmsFontWeight(styleVal("headline_3_font_weight"), "600"),
    "--hero-hl3-fst": resolveCmsFontStyle(styleVal("headline_3_font_style")),
    "--hero-hl3-fs-m": styleVal("headline_3_fs_mobile"),
    "--hero-hl3-fs-d": styleVal("headline_3_fs_desktop"),
    "--hero-hl4-ff": resolveCmsFontFamily(styleVal("headline_4_font_family")),
    "--hero-hl4-fw": resolveCmsFontWeight(styleVal("headline_4_font_weight"), "600"),
    "--hero-hl4-fst": resolveCmsFontStyle(styleVal("headline_4_font_style")),
    "--hero-hl4-fs-m": styleVal("headline_4_fs_mobile"),
    "--hero-hl4-fs-d": styleVal("headline_4_fs_desktop"),
    "--hero-hl-top-m": styleVal("headline_pos_top_mobile"),
    "--hero-hl-top-d": styleVal("headline_pos_top_desktop"),
    "--hero-hl-left-m": styleVal("headline_pos_left_mobile"),
    "--hero-hl-left-d": styleVal("headline_pos_left_desktop"),

    "--hero-badge-l-ff": resolveCmsFontFamily(styleVal("badge_left_font_family")),
    "--hero-badge-l-fw": resolveCmsFontWeight(styleVal("badge_left_font_weight"), "700"),
    "--hero-badge-l-fst": resolveCmsFontStyle(styleVal("badge_left_font_style")),
    "--hero-badge-l-fs-m": styleVal("badge_left_fs_mobile"),
    "--hero-badge-l-fs-d": styleVal("badge_left_fs_desktop"),
    "--hero-badge-l-icon-m": styleVal("badge_left_icon_size_mobile"),
    "--hero-badge-l-icon-d": styleVal("badge_left_icon_size_desktop"),
    "--hero-badge-l-left-m": styleVal("badge_left_left_mobile"),
    "--hero-badge-l-left-d": styleVal("badge_left_left_desktop"),
    "--hero-badge-l-top-m": styleVal("badge_left_top_mobile"),
    "--hero-badge-l-top-d": styleVal("badge_left_top_desktop"),

    "--hero-badge-r-ff": resolveCmsFontFamily(styleVal("badge_right_font_family")),
    "--hero-badge-r-fw": resolveCmsFontWeight(styleVal("badge_right_font_weight"), "700"),
    "--hero-badge-r-fst": resolveCmsFontStyle(styleVal("badge_right_font_style")),
    "--hero-badge-r-fs-m": styleVal("badge_right_fs_mobile"),
    "--hero-badge-r-fs-d": styleVal("badge_right_fs_desktop"),
    "--hero-badge-r-icon-m": styleVal("badge_right_icon_size_mobile"),
    "--hero-badge-r-icon-d": styleVal("badge_right_icon_size_desktop"),
    "--hero-badge-r-right-m": styleVal("badge_right_right_mobile"),
    "--hero-badge-r-right-d": styleVal("badge_right_right_desktop"),
    "--hero-badge-r-bottom-m": styleVal("badge_right_bottom_mobile"),
    "--hero-badge-r-bottom-d": styleVal("badge_right_bottom_desktop"),

    "--hero-wave-l-left-m": styleVal("wave_left_left_mobile"),
    "--hero-wave-l-left-d": styleVal("wave_left_left_desktop"),
    "--hero-wave-l-top-m": styleVal("wave_left_top_mobile"),
    "--hero-wave-l-top-d": styleVal("wave_left_top_desktop"),
    "--hero-wave-r-right-m": styleVal("wave_right_right_mobile"),
    "--hero-wave-r-right-d": styleVal("wave_right_right_desktop"),
    "--hero-wave-r-top-m": styleVal("wave_right_top_mobile"),
    "--hero-wave-r-top-d": styleVal("wave_right_top_desktop"),

    "--hero-p1-size-m": scaleCss(styleVal("product1_size_mobile")),
    "--hero-p1-size-d": scaleCss(styleVal("product1_size_desktop")),
    "--hero-p1-left-m": styleVal("product1_left_mobile") || "auto",
    "--hero-p1-left-d": styleVal("product1_left_desktop") || "auto",
    "--hero-p1-top-m": styleVal("product1_top_mobile"),
    "--hero-p1-top-d": styleVal("product1_top_desktop"),
    "--hero-p1-right-m": styleVal("product1_right_mobile") || "auto",
    "--hero-p1-right-d": styleVal("product1_right_desktop") || "auto",
    "--hero-p1-rot-m": degCss(styleVal("product1_rotate_mobile")),
    "--hero-p1-rot-d": degCss(styleVal("product1_rotate_desktop")),

    "--hero-p2-size-m": scaleCss(styleVal("product2_size_mobile")),
    "--hero-p2-size-d": scaleCss(styleVal("product2_size_desktop")),
    "--hero-p2-left-m": styleVal("product2_left_mobile") || "auto",
    "--hero-p2-left-d": styleVal("product2_left_desktop") || "auto",
    "--hero-p2-top-m": styleVal("product2_top_mobile"),
    "--hero-p2-top-d": styleVal("product2_top_desktop"),
    "--hero-p2-right-m": styleVal("product2_right_mobile") || "auto",
    "--hero-p2-right-d": styleVal("product2_right_desktop") || "auto",
    "--hero-p2-rot-m": degCss(styleVal("product2_rotate_mobile")),
    "--hero-p2-rot-d": degCss(styleVal("product2_rotate_desktop")),

    "--hero-p3-size-m": scaleCss(styleVal("product3_size_mobile")),
    "--hero-p3-size-d": scaleCss(styleVal("product3_size_desktop")),
    "--hero-p3-left-m": styleVal("product3_left_mobile") || "auto",
    "--hero-p3-left-d": styleVal("product3_left_desktop") || "auto",
    "--hero-p3-top-m": styleVal("product3_top_mobile"),
    "--hero-p3-top-d": styleVal("product3_top_desktop"),
    "--hero-p3-right-m": styleVal("product3_right_mobile") || "auto",
    "--hero-p3-right-d": styleVal("product3_right_desktop") || "auto",
    "--hero-p3-rot-m": degCss(styleVal("product3_rotate_mobile")),
    "--hero-p3-rot-d": degCss(styleVal("product3_rotate_desktop")),

    "--hero-p4-size-m": scaleCss(styleVal("product4_size_mobile")),
    "--hero-p4-size-d": scaleCss(styleVal("product4_size_desktop")),
    "--hero-p4-left-m": styleVal("product4_left_mobile") || "auto",
    "--hero-p4-left-d": styleVal("product4_left_desktop") || "auto",
    "--hero-p4-top-m": styleVal("product4_top_mobile"),
    "--hero-p4-top-d": styleVal("product4_top_desktop"),
    "--hero-p4-right-m": styleVal("product4_right_mobile") || "auto",
    "--hero-p4-right-d": styleVal("product4_right_desktop") || "auto",
    "--hero-p4-rot-m": degCss(styleVal("product4_rotate_mobile")),
    "--hero-p4-rot-d": degCss(styleVal("product4_rotate_desktop")),

    "--hero-marquee-ff": resolveCmsFontFamily(styleVal("marquee_font_family")),
    "--hero-marquee-fw": resolveCmsFontWeight(styleVal("marquee_font_weight"), "500"),
    "--hero-marquee-fst": resolveCmsFontStyle(styleVal("marquee_font_style")),
    "--hero-marquee-fs-m": styleVal("marquee_fs_mobile"),
    "--hero-marquee-fs-d": styleVal("marquee_fs_desktop"),
    "--hero-div-icon1-m": styleVal("divider_icon_1_size_mobile"),
    "--hero-div-icon1-d": styleVal("divider_icon_1_size_desktop"),
    "--hero-div-icon2-m": styleVal("divider_icon_2_size_mobile"),
    "--hero-div-icon2-d": styleVal("divider_icon_2_size_desktop"),
    "--hero-div-icon3-m": styleVal("divider_icon_3_size_mobile"),
    "--hero-div-icon3-d": styleVal("divider_icon_3_size_desktop"),
    "--hero-div-icon4-m": styleVal("divider_icon_4_size_mobile"),
    "--hero-div-icon4-d": styleVal("divider_icon_4_size_desktop"),
    "--hero-div-bottom-m": styleVal("divider_bottom_mobile"),
    "--hero-div-bottom-d": styleVal("divider_bottom_desktop"),
  } as CSSProperties;

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

  // Inline so CMS position always wins over stylesheet / Framer Motion.
  // Only use CMS wave assets when they are raster (PNG/WebP). SVG files must
  // stay inline — <img>/<Image> clips path geometry outside the viewBox and
  // makes the hero wings look cut off / messy on production.
  const waveLeftCms = resolveCmsImage(tBeranda("hero", "wave_left_icon", "")) || "";
  const waveRightCms =
    resolveCmsImage(tBeranda("hero", "wave_right_icon", "")) || "";
  const waveLeftIcon =
    waveLeftCms && isRasterSrc(waveLeftCms) ? waveLeftCms : "";
  const waveRightIcon =
    waveRightCms && isRasterSrc(waveRightCms) ? waveRightCms : "";

  const waveLeftStyle: CSSProperties = {
    left: styleVal(
      isMobile ? "wave_left_left_mobile" : "wave_left_left_desktop",
    ),
    top: styleVal(isMobile ? "wave_left_top_mobile" : "wave_left_top_desktop"),
  };
  const waveRightStyle: CSSProperties = {
    right: styleVal(
      isMobile ? "wave_right_right_mobile" : "wave_right_right_desktop",
    ),
    top: styleVal(
      isMobile ? "wave_right_top_mobile" : "wave_right_top_desktop",
    ),
  };

  const handleProductClick = (id: number) => {
    router.push(`/belanja/${id}`);
  };

  return (
    <section
      ref={sectionRef}
      style={heroCssVars}
      className={`hero-section bg-[#0071BC] md:mb-6 md:mt-10 text-white pt-4 pb-10 md:pt-0 md:pb-10 px-4 flex flex-col items-center justify-center text-center select-none overflow-hidden relative${
        isLocaleLoading ? " is-locale-loading" : ""
      }`}
    >
      <style>{`
        .gambar-utama-hover {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: scale(1) rotate(0deg);
          transform-origin: center center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .hero-product-hit:hover .gambar-utama-hover {
          transform: scale(1.04) rotate(2.5deg);
        }

        .hero-visual-stage img,
        .hero-divider-marquee img,
        .hero-badge-left-icon img,
        .hero-badge-right-icon img {
          image-rendering: auto;
          -webkit-user-drag: none;
        }

        .hero-wave-svg,
        .hero-wave-svg svg,
        .hero-wave-svg img {
          shape-rendering: geometricPrecision;
        }

        .hero-product-hit { cursor: pointer; }
        .hero-label-hit { cursor: pointer; }

        .hero-bottle-1,
        .hero-bottle-2,
        .hero-bottle-3,
        .hero-bottle-4 {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes flashFadeOnce {
          0% { filter: brightness(1); opacity: 1; }
          40% { filter: brightness(1.5); opacity: 0.6; }
          100% { filter: brightness(1); opacity: 1; }
        }
        .sayap-hover-effect:hover {
          animation: flashFadeOnce 0.8s ease-in-out;
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
          left: var(--hero-wave-l-left-m, -17%);
          top: var(--hero-wave-l-top-m, -31%);
          width: 56%;
          height: auto;
          aspect-ratio: 394 / 269;
          transform: scale(1.12) rotate(-8deg);
          transform-origin: 88% 78%;
          overflow: visible;
        }
        .hero-wave-right {
          right: var(--hero-wave-r-right-m, -17%);
          top: var(--hero-wave-r-top-m, -49%);
          width: 48%;
          height: auto;
          aspect-ratio: 418 / 449;
          transform: scale(1.12) rotate(8deg);
          transform-origin: 12% 78%;
          overflow: visible;
        }

        .hero-headline {
          line-height: 1.1;
          margin: 0;
          padding: 0;
          position: relative;
          top: var(--hero-hl-top-m);
          left: var(--hero-hl-left-m);
          /* reserve 2 lines so ID/EN swap doesn't shove the visual stage */
          min-height: calc(var(--hero-hl1-fs-m) * 1.1 * 2);
          box-sizing: content-box;
        }
        .hero-hl-1 {
          font-family: var(--hero-hl1-ff);
          font-weight: var(--hero-hl1-fw);
          font-style: var(--hero-hl1-fst);
          font-size: var(--hero-hl1-fs-m);
        }
        .hero-hl-2 {
          font-family: var(--hero-hl2-ff);
          font-weight: var(--hero-hl2-fw);
          font-style: var(--hero-hl2-fst);
          font-size: var(--hero-hl2-fs-m);
        }
        .hero-hl-3 {
          font-family: var(--hero-hl3-ff);
          font-weight: var(--hero-hl3-fw);
          font-style: var(--hero-hl3-fst);
          font-size: var(--hero-hl3-fs-m);
        }
        .hero-hl-4 {
          font-family: var(--hero-hl4-ff);
          font-weight: var(--hero-hl4-fw);
          font-style: var(--hero-hl4-fst);
          font-size: var(--hero-hl4-fs-m);
        }

        .hero-visual-stage {
          isolation: isolate;
        }

        .hero-badge-left {
          left: var(--hero-badge-l-left-m);
          top: var(--hero-badge-l-top-m);
          font-family: var(--hero-badge-l-ff);
          font-weight: var(--hero-badge-l-fw);
          font-style: var(--hero-badge-l-fst);
          font-size: var(--hero-badge-l-fs-m);
          min-width: max-content;
        }
        .hero-badge-left-icon {
          width: var(--hero-badge-l-icon-m);
          height: var(--hero-badge-l-icon-m);
          flex-shrink: 0;
        }
        .hero-badge-right {
          right: var(--hero-badge-r-right-m);
          bottom: var(--hero-badge-r-bottom-m);
          font-family: var(--hero-badge-r-ff);
          font-weight: var(--hero-badge-r-fw);
          font-style: var(--hero-badge-r-fst);
          font-size: var(--hero-badge-r-fs-m);
          min-width: max-content;
        }
        .hero-badge-right-icon {
          width: var(--hero-badge-r-icon-m);
          height: var(--hero-badge-r-icon-m);
        }

        .hero-bottle-1 {
          left: var(--hero-p1-left-m);
          right: var(--hero-p1-right-m);
          top: var(--hero-p1-top-m);
        }
        .hero-bottle-1 .hero-product-hit {
          transform: rotate(var(--hero-p1-rot-m)) scale(var(--hero-p1-size-m));
        }
        .hero-bottle-2 {
          left: var(--hero-p2-left-m);
          right: var(--hero-p2-right-m);
          top: var(--hero-p2-top-m);
        }
        .hero-bottle-2 .hero-product-hit {
          transform: rotate(var(--hero-p2-rot-m)) scale(var(--hero-p2-size-m));
        }
        .hero-bottle-3 {
          left: var(--hero-p3-left-m);
          right: var(--hero-p3-right-m);
          top: var(--hero-p3-top-m);
        }
        .hero-bottle-3 .hero-product-hit {
          transform: rotate(var(--hero-p3-rot-m)) scale(var(--hero-p3-size-m));
        }
        .hero-bottle-4 {
          left: var(--hero-p4-left-m);
          right: var(--hero-p4-right-m);
          top: var(--hero-p4-top-m);
        }
        .hero-bottle-4 .hero-product-hit {
          transform: rotate(var(--hero-p4-rot-m)) scale(var(--hero-p4-size-m));
        }

        .hero-divider-marquee {
          bottom: var(--hero-div-bottom-m);
        }
        .hero-marquee-text {
          font-family: var(--hero-marquee-ff);
          font-weight: var(--hero-marquee-fw);
          font-style: var(--hero-marquee-fst);
          font-size: var(--hero-marquee-fs-m);
        }
        .hero-div-icon-1 {
          width: var(--hero-div-icon1-m);
          height: var(--hero-div-icon1-m);
        }
        .hero-div-icon-2 {
          width: var(--hero-div-icon2-m);
          height: var(--hero-div-icon2-m);
        }
        .hero-div-icon-3 {
          width: var(--hero-div-icon3-m);
          height: var(--hero-div-icon3-m);
        }
        .hero-div-icon-4 {
          width: var(--hero-div-icon4-m);
          height: var(--hero-div-icon4-m);
        }

        @media (min-width: 768px) {
          .hero-headline {
            top: var(--hero-hl-top-d);
            left: var(--hero-hl-left-d);
            min-height: calc(var(--hero-hl1-fs-d) * 1.1 * 2);
          }
          .hero-hl-1 { font-size: var(--hero-hl1-fs-d); }
          .hero-hl-2 { font-size: var(--hero-hl2-fs-d); }
          .hero-hl-3 { font-size: var(--hero-hl3-fs-d); }
          .hero-hl-4 { font-size: var(--hero-hl4-fs-d); }

          .hero-badge-left {
            left: var(--hero-badge-l-left-d);
            top: var(--hero-badge-l-top-d);
            font-size: var(--hero-badge-l-fs-d);
          }
          .hero-badge-left-icon {
            width: var(--hero-badge-l-icon-d);
            height: var(--hero-badge-l-icon-d);
          }
          .hero-badge-right {
            right: var(--hero-badge-r-right-d);
            bottom: var(--hero-badge-r-bottom-d);
            font-size: var(--hero-badge-r-fs-d);
          }
          .hero-badge-right-icon {
            width: var(--hero-badge-r-icon-d);
            height: var(--hero-badge-r-icon-d);
          }

          .hero-bottle-1 {
            left: var(--hero-p1-left-d);
            right: var(--hero-p1-right-d);
            top: var(--hero-p1-top-d);
          }
          .hero-bottle-1 .hero-product-hit {
            transform: rotate(var(--hero-p1-rot-d)) scale(var(--hero-p1-size-d));
          }
          .hero-bottle-2 {
            left: var(--hero-p2-left-d);
            right: var(--hero-p2-right-d);
            top: var(--hero-p2-top-d);
          }
          .hero-bottle-2 .hero-product-hit {
            transform: rotate(var(--hero-p2-rot-d)) scale(var(--hero-p2-size-d));
          }
          .hero-bottle-3 {
            left: var(--hero-p3-left-d);
            right: var(--hero-p3-right-d);
            top: var(--hero-p3-top-d);
          }
          .hero-bottle-3 .hero-product-hit {
            transform: rotate(var(--hero-p3-rot-d)) scale(var(--hero-p3-size-d));
          }
          .hero-bottle-4 {
            left: var(--hero-p4-left-d);
            right: var(--hero-p4-right-d);
            top: var(--hero-p4-top-d);
          }
          .hero-bottle-4 .hero-product-hit {
            transform: rotate(var(--hero-p4-rot-d)) scale(var(--hero-p4-size-d));
          }

          .hero-divider-marquee {
            bottom: var(--hero-div-bottom-d);
          }
          .hero-marquee-text {
            font-size: var(--hero-marquee-fs-d);
          }
          .hero-div-icon-1 {
            width: var(--hero-div-icon1-d);
            height: var(--hero-div-icon1-d);
          }
          .hero-div-icon-2 {
            width: var(--hero-div-icon2-d);
            height: var(--hero-div-icon2-d);
          }
          .hero-div-icon-3 {
            width: var(--hero-div-icon3-d);
            height: var(--hero-div-icon3-d);
          }
          .hero-div-icon-4 {
            width: var(--hero-div-icon4-d);
            height: var(--hero-div-icon4-d);
          }
        }

        @media (min-width: 768px) {
          .hero-wave-left {
            left: var(--hero-wave-l-left-d, -11%);
            top: var(--hero-wave-l-top-d, -35%);
            width: 46%;
            transform: scale(1.14) rotate(-9deg);
            transform-origin: 88% 78%;
          }
          .hero-wave-right {
            right: var(--hero-wave-r-right-d, -11%);
            top: var(--hero-wave-r-top-d, -50%);
            width: 40%;
            transform: scale(1.14) rotate(9deg);
            transform-origin: 12% 78%;
          }
        }
      `}</style>

      <motion.div
        style={{ opacity: opacityScroll, y: yScroll }}
        className="w-full flex flex-col items-center justify-center flex-1 z-10 gap-0 m-0 p-0"
      >
        <motion.h1
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="hero-headline"
        >
          <span className="hero-hl-1 locale-shimmer-text" style={{ color: headlineColors[1] }}>
            {tBeranda("hero", "headline_1", "Temukan")}{" "}
          </span>
          <span className="hero-hl-2 locale-shimmer-text" style={{ color: headlineColors[2] }}>
            {tBeranda("hero", "headline_2", "karakter")}
          </span>
          <br />
          <span className="hero-hl-3 locale-shimmer-text" style={{ color: headlineColors[3] }}>
            {tBeranda("hero", "headline_3", "aromamu")}{" "}
          </span>
          <span className="hero-hl-4 locale-shimmer-text" style={{ color: headlineColors[4] }}>
            {tBeranda("hero", "headline_4", "di Evomi")}
          </span>
        </motion.h1>

        <div
          data-locale-stable
          className="hero-visual-stage relative mt-2 mb-0 md:mt-3 md:mb-0 w-[100%] md:w-[90%] lg:w-full max-w-7xl mx-auto aspect-[1280/412]"
        >
          <div className="hero-wave-layer sayap-hover-effect" aria-hidden>
            <div className="hero-wave-svg hero-wave-left" style={waveLeftStyle}>
              <motion.div
                className="w-full h-auto"
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
                  {waveLeftIcon ? (
                    <Image
                      src={waveLeftIcon}
                      alt=""
                      width={394}
                      height={269}
                      className="w-full h-auto block overflow-visible"
                      unoptimized={isSvgSrc(waveLeftIcon)}
                      draggable={false}
                    />
                  ) : (
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
                  )}
                </motion.div>
              </motion.div>
            </div>

            <div className="hero-wave-svg hero-wave-right" style={waveRightStyle}>
              <motion.div
                className="w-full h-auto"
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
                {waveRightIcon ? (
                  <Image
                    src={waveRightIcon}
                    alt=""
                    width={418}
                    height={449}
                    className="w-full h-auto block overflow-visible"
                    unoptimized={isSvgSrc(waveRightIcon)}
                    draggable={false}
                  />
                ) : (
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
                )}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {products.map((product) => (
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
                <Image
                  src={product.labelImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 20vw, 12vw"
                  quality={HERO_IMG_QUALITY}
                  unoptimized
                  className="object-contain pointer-events-none"
                />
              </motion.div>
            </motion.button>
          ))}

          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8, rotate: 15 }
                : { opacity: 0, scale: 0.7, rotate: 15 }
            }
            transition={{ duration: 0.5, delay: 0.8 }}
            className="hero-badge-left origin-bottom-right cursor-pointer absolute inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
          >
            <div className="hero-badge-left-icon relative shrink-0">
              <Image
                src={badgeLeftIcon}
                alt=""
                fill
                sizes="40px"
                quality={HERO_IMG_QUALITY}
                unoptimized={isSvgSrc(badgeLeftIcon)}
                className="object-contain"
              />
            </div>
            <p className="locale-shimmer-text whitespace-nowrap">
              {tBeranda("hero", "badge_left", "Eau de Parfum")}
            </p>
          </motion.div>

          <motion.div
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 0.8, rotate: -12 }
                : { opacity: 0, scale: 0.7, rotate: -12 }
            }
            transition={{ duration: 0.5, delay: 0.9 }}
            className="hero-badge-right origin-bottom-left cursor-pointer absolute inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] px-2 py-1 md:px-7 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30"
          >
            <div className="hero-badge-right-icon relative shrink-0">
              <Image
                src={badgeRightIcon}
                alt="Recycle Icon"
                fill
                sizes="40px"
                quality={HERO_IMG_QUALITY}
                unoptimized={isSvgSrc(badgeRightIcon)}
                className="object-contain"
              />
            </div>
            <p className="locale-shimmer-text whitespace-nowrap">
              {tBeranda("hero", "badge_right", "Recycle Bottle Cap")}
            </p>
          </motion.div>

          <div className="relative top-20 md:top-65 left-1/2 -translate-x-2/5 -translate-y-[46%] z-10 w-[80%] h-[63%] flex items-center justify-between gap-1 md:gap-4 bg-transparent overflow-visible">
            {products.map((product) => {
              const bottleClass = `hero-bottle-${product.cmsKey.replace("product", "")}`;
              return (
                <motion.div
                  key={product.id}
                  animate={
                    shouldAnimate
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 60 }
                  }
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className={`relative w-full h-full ${bottleClass} ${product.zClass}`}
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
                    className="relative flex h-full w-full items-center justify-center"
                  >
                    <button
                      type="button"
                      className={`hero-product-hit relative inline-flex h-full max-w-full items-center justify-center border-0 p-0 ${product.bgClass}`}
                      aria-label={`Lihat detail ${product.title}`}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <Image
                        src={product.image}
                        alt={`Botol ${product.title}`}
                        width={1200}
                        height={2400}
                        sizes="(max-width: 768px) 30vw, 18vw"
                        quality={HERO_IMG_QUALITY}
                        // Serve original PNG so downscale stays close to source
                        unoptimized
                        className="pointer-events-none h-full w-auto max-w-full object-contain gambar-utama-hover"
                        priority
                      />
                    </button>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="hero-divider-marquee absolute md:mt-5 left-0 w-full overflow-hidden py-1.5 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8">
              {dividerIcons.map((iconSrc, iconIdx) => (
                <div
                  key={`${i}-${iconIdx}`}
                  className="flex items-center gap-4 sm:gap-6 md:gap-8"
                >
                  <span className="hero-marquee-text locale-shimmer-text whitespace-nowrap text-white">
                    {marqueeText}
                  </span>
                  <div
                    className={`hero-div-icon-${iconIdx + 1} relative shrink-0`}
                  >
                    <Image
                      src={iconSrc}
                      alt=""
                      fill
                      sizes="48px"
                      quality={HERO_IMG_QUALITY}
                      unoptimized={isSvgSrc(iconSrc)}
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

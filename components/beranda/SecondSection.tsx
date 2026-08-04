"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useCms } from "@/context/CmsContext";
import { useLocale } from "@/context/LocaleContext";
import { resolveCmsImage } from "@/lib/cms";
import { cmsFontStyle } from "@/lib/cmsFonts";
import { L } from "@/lib/localeText";

const DEFAULT_CARD_ICON_SIZE_MOBILE = "100px";
const DEFAULT_CARD_ICON_SIZE_DESKTOP = "140px";
const DEFAULT_CARD_LABEL_GAP_MOBILE = "0px";
const DEFAULT_CARD_LABEL_GAP_DESKTOP = "12px";
const DEFAULT_CARD_GAP_HORIZONTAL_MOBILE = "16px";
const DEFAULT_CARD_GAP_HORIZONTAL_DESKTOP = "32px";

function cssSize(raw: string, fallback: string) {
  const trimmed = raw.trim();
  return trimmed || fallback;
}

function normalizePxSize(raw: string, fallback: string) {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}

function cssSizeToPxNumber(raw: string, fallback: number) {
  const match = raw.trim().match(/^(-?\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const n = Number.parseFloat(match[1]);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

// Interface untuk state modal
interface NavModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function SecondSection() {
  const router = useRouter();
  const { tBeranda } = useCms();
  const { locale } = useLocale();
  const read = (key: string, fb = "") => tBeranda("second", key, fb);

  // State untuk mengontrol modal
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const headline1 = read("headline_1", L(locale, "Kenalan sama", "Meet our"));
  const headline2 = read("headline_2", L(locale, "karakter ", "characters "));
  const headline3 = read("headline_3", L(locale, "kita yuk!", "today!"));

  const iconSizeMobile = cssSize(
    read("card_icon_size_mobile", DEFAULT_CARD_ICON_SIZE_MOBILE),
    DEFAULT_CARD_ICON_SIZE_MOBILE,
  );
  const iconSizeDesktop = cssSize(
    read("card_icon_size_desktop", DEFAULT_CARD_ICON_SIZE_DESKTOP),
    DEFAULT_CARD_ICON_SIZE_DESKTOP,
  );
  const labelGapMobile = normalizePxSize(
    read("card_label_gap_mobile", DEFAULT_CARD_LABEL_GAP_MOBILE),
    DEFAULT_CARD_LABEL_GAP_MOBILE,
  );
  const labelGapDesktop = normalizePxSize(
    read("card_label_gap_desktop", DEFAULT_CARD_LABEL_GAP_DESKTOP),
    DEFAULT_CARD_LABEL_GAP_DESKTOP,
  );
  const cardGapHorizontalMobile = normalizePxSize(
    read("card_gap_horizontal_mobile", DEFAULT_CARD_GAP_HORIZONTAL_MOBILE),
    DEFAULT_CARD_GAP_HORIZONTAL_MOBILE,
  );
  const cardGapHorizontalDesktop = normalizePxSize(
    read("card_gap_horizontal_desktop", DEFAULT_CARD_GAP_HORIZONTAL_DESKTOP),
    DEFAULT_CARD_GAP_HORIZONTAL_DESKTOP,
  );
  const iconPx = cssSizeToPxNumber(iconSizeDesktop, 140);

  const sectionStyle = {
    "--s2-icon-m": iconSizeMobile,
    "--s2-icon-d": iconSizeDesktop,
    "--s2-label-gap-m": labelGapMobile,
    "--s2-label-gap-d": labelGapDesktop,
    "--s2-card-gap-m": cardGapHorizontalMobile,
    "--s2-card-gap-d": cardGapHorizontalDesktop,
  } as CSSProperties;

  const characters = [
    {
      id: 1,
      name: read("card1_name", "Purpose\nPrestige"),
      title: read("card1_title", "Purpose Prestige"),
      path:
        resolveCmsImage(read("card1_image", "")) ||
        "/src/images/section 2/purpose-prestige.png",
      colorClass: "text-[#0D71BA]",
    },
    {
      id: 2,
      name: read("card2_name", "Peaceful\nCalm"),
      title: read("card2_title", "Peaceful Calm"),
      path:
        resolveCmsImage(read("card2_image", "")) ||
        "/src/images/section 2/peaceful-calm.png",
      colorClass: "text-[#5EA14A]",
    },
    {
      id: 3,
      name: read("card3_name", "Rabel\nBrave"),
      title: read("card3_title", "Rebel Brave"),
      path:
        resolveCmsImage(read("card3_image", "")) ||
        "/src/images/section 2/rabel-brave.png",
      colorClass: "text-[#E33D35]",
    },
    {
      id: 4,
      name: read("card4_name", "Sweet\nShy"),
      title: read("card4_title", "Sweet Shy"),
      path:
        resolveCmsImage(read("card4_image", "")) ||
        "/src/images/section 2/sweet-shy.png",
      colorClass: "text-[#DD74A5]",
    },
  ];

  // Varian Animasi untuk container (Stagger effect)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Jeda antar karakter 0.2 detik
      },
    },
  };

  // Varian Animasi untuk elemen satuan (Slide up + Fade)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const handleBelanjaAction = (e: React.MouseEvent) => {
    e.preventDefault();
    setNavModal({
      isOpen: true,
      type: "loading",
      title: L(locale, "Katalog Produk", "Product Catalog"),
      message: L(
        locale,
        "Mengarahkan ke halaman belanja Evomi...",
        "Taking you to the Evomi shop...",
      ),
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/belanja");
    }, 800);
  };

  // --- TAMBAHAN: Handler saat Karakter individu diklik ---
  const handleCharacterClick = (id: number, name: string) => {
    // Format nama untuk menghapus karakter enter (\n) menjadi spasi di modal
    const formattedName = name.replace("\n", " ");

    setNavModal({
      isOpen: true,
      type: "loading",
      title: formattedName,
      message: L(
        locale,
        `Mengarahkan ke detail karakter ${formattedName}...`,
        `Taking you to ${formattedName} details...`,
      ),
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(`/belanja/${id}`);
    }, 800);
  };

  return (
    <section
      className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full overflow-x-hidden overflow-y-visible relative pb-[30px]"
      style={sectionStyle}
    >
      <style>{`
        .s2-char-icon {
          width: var(--s2-icon-m);
          height: var(--s2-icon-m);
        }
        .s2-char-grid {
          display: grid !important;
          grid-template-columns: repeat(2, max-content);
          justify-content: center;
          justify-items: center;
          align-items: start;
          column-gap: var(--s2-card-gap-m, 16px) !important;
          row-gap: var(--s2-card-gap-m, 16px) !important;
          gap: var(--s2-card-gap-m, 16px) !important;
        }
        .s2-char-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          row-gap: var(--s2-label-gap-m, 0px);
        }
        .s2-char-card .s2-char-visual {
          transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.35s ease;
          transform-origin: center bottom;
          will-change: transform;
          pointer-events: none;
        }
        .s2-char-card:hover .s2-char-visual {
          transform: translateY(-6px) scale(1.06);
          filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.18));
        }
        .s2-char-card .s2-char-label {
          transition: opacity 0.3s ease;
        }
        .s2-char-card:hover .s2-char-label {
          opacity: 0.95;
        }
        .s2-char-label {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        .s2-cta-btn {
          position: relative;
          overflow: hidden;
        }
        .s2-cta-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.22) 45%,
            transparent 70%
          );
          transform: translateX(-120%);
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .s2-cta-btn:hover::before {
          transform: translateX(120%);
        }
        .s2-cta-btn .s2-cta-icon {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .s2-cta-btn:hover .s2-cta-icon {
          transform: translateX(4px);
        }
        @media (min-width: 768px) {
          .s2-char-icon {
            width: var(--s2-icon-d);
            height: var(--s2-icon-d);
          }
          .s2-char-grid {
            grid-template-columns: repeat(4, max-content);
            column-gap: var(--s2-card-gap-d, 32px) !important;
            row-gap: var(--s2-card-gap-d, 32px) !important;
            gap: var(--s2-card-gap-d, 32px) !important;
          }
          .s2-char-card {
            row-gap: var(--s2-label-gap-d, 12px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .s2-char-card .s2-char-visual,
          .s2-char-card .s2-char-label,
          .s2-cta-btn::before,
          .s2-cta-btn .s2-cta-icon {
            transition: none !important;
          }
          .s2-char-card:hover .s2-char-visual,
          .s2-char-card:hover .s2-char-label,
          .s2-cta-btn:hover .s2-cta-icon {
            transform: none !important;
          }
        }
      `}</style>
      {/* ================= STICKY LINGKARAN DIVIDER ATAS ================= */}
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
        <div className="flex w-max gap-[10px] md:gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`top-${index}`}
              className="w-[30px] h-[30px] md:w-[46px] md:h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[15px] md:-mt-[23px]"
            />
          ))}
        </div>
      </div>

      {/* 1. Teks Judul */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="mt-14 md:mt-25 mb-8 md:mb-10 text-[24px] md:text-[42px] leading-tight px-2"
      >
        <span
          className="text-[#0071BC]"
          style={cmsFontStyle(read, "headline_1", { weight: "600" })}
        >
          {headline1}
        </span>
        <br />
        <span
          className="text-[#FF8A84]"
          style={cmsFontStyle(read, "headline_2", { weight: "600" })}
        >
          {headline2}
        </span>{" "}
        <span
          className="text-[#0071BC]"
          style={cmsFontStyle(read, "headline_3", { weight: "600" })}
        >
          {headline3}
        </span>
      </motion.h2>

      {/* 2. Grid 4 Gambar Karakter */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="s2-char-grid mt-6 md:mt-10 mb-8 md:mb-10 w-full max-w-4xl"
        style={
          {
            "--s2-card-gap-m": cardGapHorizontalMobile,
            "--s2-card-gap-d": cardGapHorizontalDesktop,
          } as CSSProperties
        }
      >
        {characters.map((char) => (
          <motion.div
            key={char.id}
            variants={itemVariants}
            onClick={() => handleCharacterClick(char.id, char.name)}
            className="s2-char-card group cursor-pointer hover:z-30"
            style={
              {
                "--s2-label-gap-m": labelGapMobile,
                "--s2-label-gap-d": labelGapDesktop,
              } as CSSProperties
            }
          >
            <div className="s2-char-icon relative flex justify-center items-center">
              <Image
                src={char.path}
                alt={`Karakter ${char.title}`}
                width={iconPx}
                height={iconPx}
                className="s2-char-visual w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <h3
              className={`s2-char-label text-l md:text-2xl tracking-tight whitespace-pre-line ${char.colorClass}`}
              style={cmsFontStyle(read, `card${char.id}_name`, {
                family: "heavy",
              })}
            >
              {char.name}
            </h3>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Button Lihat Semua Karakter */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-10 md:mb-15 md:mt-10"
      >
        <button
          onClick={handleBelanjaAction}
          className="s2-cta-btn group bg-[#0071BC] text-white text-[11px] md:text-[15px] px-5 md:px-7 py-2.5 md:py-3 rounded-full shadow-lg inline-flex items-center gap-1.5 md:gap-2 relative z-10 cursor-pointer border-none outline-none transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#0062a3] hover:shadow-xl active:brightness-95"
          style={cmsFontStyle(read, "cta_label", { weight: "700" })}
        >
          {read(
            "cta_label",
            L(locale, "Lihat Semua Karakter", "See All Characters"),
          )}
          <svg
            className="s2-cta-icon w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M3.80933 9.14282H14.476"
              stroke="#ffffff"
              strokeWidth="1.52381"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.14282 3.80957L14.4762 9.1429L9.14282 14.4762"
              stroke="#ffffff"
              strokeWidth="1.52381"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </motion.div>

      {/* ================= STICKY LINGKARAN DIVIDER BAWAH ================= */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[15px] md:h-[23px] pointer-events-none">
        <div className="flex w-max gap-[10px] md:gap-[15px] animate-slide-right-40s">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={`bottom-${index}`}
              className="w-[30px] h-[30px] md:w-[46px] md:h-[46px] bg-[#1172BA] rounded-full flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* ================= CUSTOM MODAL ================= */}
      <AnimatePresence>
        {navModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-8 max-w-[280px] md:max-w-[340px] w-full text-center shadow-2xl overflow-hidden"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full mb-3 md:mb-5 transition-colors duration-300 bg-blue-50 text-blue-500">
                {navModal.type === "loading" && (
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
                )}
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

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useCms } from "@/context/CmsContext";
import { useLocale } from "@/context/LocaleContext";
import { resolveCmsImage } from "@/lib/cms";
import { cmsFontStyle } from "@/lib/cmsFonts";
import { L } from "@/lib/localeText";

interface NavModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function FifthSection() {
  const router = useRouter();
  const { tBeranda } = useCms();
  const { locale } = useLocale();
  const read = (key: string, fb = "") => tBeranda("fifth", key, fb);

  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const products = [
    {
      id: 1,
      path:
        resolveCmsImage(read("card1_image", "")) ||
        "/src/images/section 5/purpose-prestige.png",
      imgBg: "bg-[#1172BA]",
      cardBg: "bg-[#9CD6FF]",
      textColor: "text-[#1172BA]",
      badge: read("card1_badge", L(locale, "Optimis", "Optimistic")),
      title: read("card1_title", "Purpose Prestige"),
      desc: read(
        "card1_desc",
        L(
          locale,
          "Aroma yang merefleksikan ketenangan dan kejelasan tujuan.",
          "A scent that reflects calm and clarity of purpose.",
        ),
      ),
      descColor: "text-[#1172BAB2]",
      price: read("card1_price", "Rp189.000"),
      btnBg: "bg-[#1172BA]",
    },
    {
      id: 2,
      path:
        resolveCmsImage(read("card2_image", "")) ||
        "/src/images/section 5/peaceful-calm.png",
      imgBg: "bg-[#5EA14A]",
      cardBg: "bg-[#C6F5B8]",
      textColor: "text-[#5EA14A]",
      badge: read("card2_badge", L(locale, "Damai", "Peaceful")),
      title: read("card2_title", "Peaceful Calm"),
      desc: read(
        "card2_desc",
        L(
          locale,
          "Aroma menenangkan yang menyatu dengan diri.",
          "A calming scent that blends with who you are.",
        ),
      ),
      descColor: "text-[#5EA14A]",
      price: read("card2_price", "Rp199.000"),
      btnBg: "bg-[#5EA14A]",
    },
    {
      id: 3,
      path:
        resolveCmsImage(read("card3_image", "")) ||
        "/src/images/section 5/rabel-brave.png",
      imgBg: "bg-[#E33D35]",
      cardBg: "bg-[#FFBBB5]",
      textColor: "text-[#E33D35]",
      badge: read("card3_badge", L(locale, "Berani", "Brave")),
      title: read("card3_title", "Rebel Brave"),
      desc: read(
        "card3_desc",
        L(
          locale,
          "Keberanian dan semangat untuk mengekspresikan diri.",
          "Courage and spirit to express yourself.",
        ),
      ),
      descColor: "text-[#E33D35]",
      price: read("card3_price", "Rp179.000"),
      btnBg: "bg-[#E33D35]",
    },
    {
      id: 4,
      path:
        resolveCmsImage(read("card4_image", "")) ||
        "/src/images/section 5/sweet-shy.png",
      imgBg: "bg-[#DD74A5]",
      cardBg: "bg-[#F5D7E7]",
      textColor: "text-[#DD74A5]",
      badge: read("card4_badge", L(locale, "Manis", "Sweet")),
      title: read("card4_title", "Sweet Shy"),
      desc: read(
        "card4_desc",
        L(
          locale,
          "Aroma menenangkan yang menyatu dengan diri.",
          "A gentle scent that feels close to you.",
        ),
      ),
      descColor: "text-[#DD74A5]",
      price: read("card4_price", "Rp189.000"),
      btnBg: "bg-[#DD74A5]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
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

  const handleProductClick = (id: number, title: string) => {
    setNavModal({
      isOpen: true,
      type: "loading",
      title: title,
      message: L(
        locale,
        `Mengarahkan ke detail produk ${title}...`,
        `Taking you to ${title} details...`,
      ),
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(`/belanja/${id}`);
    }, 800);
  };

  return (
    <section className="bg-[#FAFAFA] md:bg-white flex flex-col items-center text-center w-full pt-10 sm:pt-12 md:pt-14 pb-14 md:pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden">
      {/* Dekorasi sudut — seperti screenshot */}
      <div className="absolute top-[12%] left-0 z-0 pointer-events-none w-[40px] sm:w-[70px] md:w-[100px] -translate-x-[20%] md:-translate-x-[15%]">
        <Image
          src="/src/images/section 5/purpose.png"
          alt=""
          width={100}
          height={100}
          className="object-contain opacity-90"
        />
      </div>
      <div className="absolute top-[12%] right-0 z-0 pointer-events-none w-[40px] sm:w-[70px] md:w-[100px] translate-x-[20%] md:translate-x-[15%]">
        <Image
          src="/src/images/section 5/sweet.png"
          alt=""
          width={100}
          height={100}
          className="object-contain opacity-90"
        />
      </div>
      <div className="absolute bottom-[22%] left-0 z-0 pointer-events-none w-[40px] sm:w-[70px] md:w-[100px] -translate-x-[20%] md:-translate-x-[15%]">
        <Image
          src="/src/images/section 5/rebel.png"
          alt=""
          width={100}
          height={100}
          className="object-contain opacity-90"
        />
      </div>
      <div className="absolute bottom-[22%] right-0 z-0 pointer-events-none w-[40px] sm:w-[70px] md:w-[100px] translate-x-[20%] md:translate-x-[15%]">
        <Image
          src="/src/images/section 5/peaceful.png"
          alt=""
          width={100}
          height={100}
          className="object-contain opacity-90"
        />
      </div>

      {/* Judul */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 mb-6 md:mb-10"
      >
        <h2 className="text-[26px] sm:text-[32px] md:text-[38px] mb-2 md:mb-3 leading-tight">
          <span
            className="text-[#1172BA]"
            style={cmsFontStyle(read, "title_1", { weight: "700" })}
          >
            {read("title_1", L(locale, "Khas", "Made by"))}
          </span>{" "}
          <span
            className="text-[#FF8A84]"
            style={cmsFontStyle(read, "title_2", { weight: "700" })}
          >
            {read("title_2", "Evomi")}
          </span>
        </h2>
        <p
          className="text-[12px] sm:text-[14px] md:text-[16px] text-[#5D5D5D] max-w-xl mx-auto px-2 leading-relaxed"
          style={cmsFontStyle(read, "subtitle")}
        >
          {read(
            "subtitle",
            L(
              locale,
              "Empat karakter aroma yang mewakili sisi berbeda dari dirimu.",
              "Four scent characters that represent different sides of you.",
            ),
          )}
        </p>
      </motion.div>

      {/* Grid produk — 2 kolom mobile, 4 kolom desktop (seperti screenshot) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 w-full max-w-[1100px] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8 mb-8 md:mb-12 px-0 sm:px-2"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            variants={cardVariants}
            onClick={() => handleProductClick(product.id, product.title)}
            className="group relative w-full max-w-[260px] mx-auto rounded-[18px] md:rounded-[24px] shadow-sm hover:shadow-xl transition-[box-shadow] duration-300 ease-out overflow-hidden flex flex-col border border-black/5 hover:z-20 cursor-pointer"
          >
            {/* Area gambar */}
            <div
              className={`relative w-full aspect-[5/4] md:aspect-[4/3.4] flex flex-col items-center justify-end overflow-visible ${product.imgBg}`}
            >
              <div className="absolute top-2.5 left-2.5 md:top-3.5 md:left-3.5 z-20">
                <span
                  className={`bg-white px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-[12px] shadow-sm ${product.textColor} transition-transform duration-300 ease-out group-hover:-translate-y-0.5`}
                  style={cmsFontStyle(read, `card${product.id}_badge`, {
                    weight: "700",
                  })}
                >
                  {product.badge}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: "easeOut",
                }}
                className="relative w-full flex justify-center items-end translate-y-[14%] md:translate-y-[16%] z-10 pb-0 pointer-events-none"
              >
                <Image
                  src={product.path}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="object-contain drop-shadow-xl w-[78%] sm:w-[80%] md:w-[82%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.05]"
                />
              </motion.div>
            </div>

            {/* Area info */}
            <div
              className={`relative p-3 sm:p-3.5 md:p-4 flex flex-col flex-grow text-left ${product.cardBg} z-20 pt-5 md:pt-6`}
            >
              <h3
                className={`text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] mb-1 md:mb-1.5 ${product.textColor} leading-tight`}
                style={cmsFontStyle(read, `card${product.id}_title`, {
                  weight: "700",
                })}
              >
                {product.title}
              </h3>
              <p
                className={`text-[10px] md:text-[11px] mb-3 md:mb-4 line-clamp-2 leading-snug ${product.descColor}`}
                style={cmsFontStyle(read, `card${product.id}_desc`, {
                  weight: "500",
                })}
              >
                {product.desc}
              </p>

              <div className="flex justify-between items-center mt-auto gap-2">
                <span
                  className={`text-[11px] md:text-[12px] ${product.textColor}`}
                  style={cmsFontStyle(read, `card${product.id}_price`, {
                    weight: "700",
                  })}
                >
                  {product.price}
                </span>
                <button
                  type="button"
                  aria-label={`Lihat ${product.title}`}
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex justify-center items-center text-white shrink-0 transition-[background-color,box-shadow] duration-300 group-hover:shadow-md ${product.btnBg}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3 h-3 pointer-events-none transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative z-10"
      >
        <button
          onClick={handleBelanjaAction}
          className="beranda-cta group relative overflow-hidden flex items-center justify-center gap-2 md:gap-3 bg-[#1172BA] text-white text-[13px] md:text-[14px] px-7 py-2.5 md:px-10 md:py-3 rounded-full transition-[background-color,box-shadow] duration-200 hover:bg-[#0e5d99] hover:shadow-lg active:brightness-95 shadow-md"
          style={cmsFontStyle(read, "cta_label", { weight: "700" })}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.22)_45%,transparent_70%)] -translate-x-[120%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[120%]"
            aria-hidden
          />
          <div className="relative w-[16px] h-[16px] md:w-[19px] md:h-[19px] transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110">
            <Image
              src="/src/images/section 5/star-medium.png"
              alt=""
              fill
              className="object-contain brightness-0 invert pointer-events-none"
            />
          </div>
          <span className="relative">{read("cta_label", L(locale, "Lihat Koleksi", "View Collection"))}</span>
        </button>
      </motion.div>

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
              <div className="mx-auto flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full mb-3 md:mb-5 bg-blue-50 text-blue-500">
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

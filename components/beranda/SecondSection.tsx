"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useCms } from "@/context/CmsContext";
import { resolveCmsImage } from "@/lib/cms";

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

  // State untuk mengontrol modal
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const characters = [
    {
      id: 1,
      name: tBeranda("second", "card1_name", "Purpose\nPrestige"),
      title: tBeranda("second", "card1_title", "Purpose Prestige"),
      path:
        resolveCmsImage(tBeranda("second", "card1_image", "")) ||
        "/src/images/section 2/purpose-prestige.png",
      colorClass: "text-[#0D71BA]",
    },
    {
      id: 2,
      name: tBeranda("second", "card2_name", "Peaceful\nCalm"),
      title: tBeranda("second", "card2_title", "Peaceful Calm"),
      path:
        resolveCmsImage(tBeranda("second", "card2_image", "")) ||
        "/src/images/section 2/peaceful-calm.png",
      colorClass: "text-[#5EA14A]",
    },
    {
      id: 3,
      name: tBeranda("second", "card3_name", "Rabel\nBrave"),
      title: tBeranda("second", "card3_title", "Rebel Brave"),
      path:
        resolveCmsImage(tBeranda("second", "card3_image", "")) ||
        "/src/images/section 2/rabel-brave.png",
      colorClass: "text-[#E33D35]",
    },
    {
      id: 4,
      name: tBeranda("second", "card4_name", "Sweet\nShy"),
      title: tBeranda("second", "card4_title", "Sweet Shy"),
      path:
        resolveCmsImage(tBeranda("second", "card4_image", "")) ||
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

  // Handler saat tombol "Lihat Semua Karakter" diklik
  const handleBelanjaAction = (e: React.MouseEvent) => {
    e.preventDefault();
    setNavModal({
      isOpen: true,
      type: "loading",
      title: "Katalog Produk",
      message: "Mengarahkan ke halaman belanja Evomi...",
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
      message: `Mengarahkan ke detail karakter ${formattedName}...`,
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(`/belanja/${id}`);
    }, 800);
  };

  return (
    <section className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full overflow-x-hidden overflow-y-visible relative pb-[30px]">
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
        className="font-nohemi font-semibold mt-14 md:mt-25 mb-8 md:mb-10 text-[24px] md:text-[42px] leading-tight px-2"
      >
        <span className="text-[#0071BC]">Kenalan sama </span>
        <span className="text-[#FF8A84]">karakter </span>
        <span className="text-[#0071BC]">kita yuk!</span>
      </motion.h2>

      {/* 2. Grid 4 Gambar Karakter */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="mt-6 md:mt-10 mb-8 md:mb-10 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 justify-items-center"
      >
        {characters.map((char) => (
          <motion.div
            key={char.id}
            variants={itemVariants}
            onClick={() => handleCharacterClick(char.id, char.name)}
            className="flex flex-col items-center group cursor-pointer hover:scale-105 hover:z-30 transition-transform duration-300 ease-in-out"
          >
            <div className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[140px] md:h-[140px] relative flex justify-center items-center">
              <Image
                src={char.path}
                alt={`Karakter ${char.title}`}
                width={140}
                height={140}
                className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
              />
            </div>
            <h3
              className={`font-heavy text-l md:text-2xl tracking-tight whitespace-pre-line md:mt-3 ${char.colorClass}`}
            >
              {char.name}
            </h3>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Button Lihat Semua Karakter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 0.8 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={handleBelanjaAction}
          className="bg-[#0071BC] text-white text-[12px] md:text-[18.3px] font-bold px-6 md:px-9 py-3 md:py-4 rounded-full shadow-lg inline-flex items-center gap-2 mb-10 md:mb-15 md:mt-10 relative z-10 transform transition-all duration-200 ease-out hover:scale-95 hover:translate-y-1 hover:shadow-sm cursor-pointer border-none outline-none"
        >
          {tBeranda("second", "cta_label", "Lihat Semua Karakter")}
          <svg
            className="w-4 h-4 md:w-[19px] md:h-[19px]"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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

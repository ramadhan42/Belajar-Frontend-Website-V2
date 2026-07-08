"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";

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

  // Navbar modal components
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  // Products data local
  const products = [
    {
      id: 1,
      path: "/src/images/section 5/purpose-prestige.png",
      imgBg: "bg-[#1172BA]",
      cardBg: "bg-[#9CD6FF]",
      textColor: "text-[#1172BA]",
      badge: "Optimis",
      title: "Purpose Prestige",
      desc: "Aroma yang merefleksikan ketenangan dan kejelasan tujuan.",
      descColor: "text-[#1172BAB2]",
      price: "Rp189.000",
      btnBg: "bg-[#1172BA]",
      hoverClass: "hover:-rotate-[3deg]",
    },
    {
      id: 2,
      path: "/src/images/section 5/peaceful-calm.png",
      imgBg: "bg-[#5EA14A]",
      cardBg: "bg-[#C6F5B8]",
      textColor: "text-[#5EA14A]",
      badge: "Damai",
      title: "Peaceful Calm",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#5EA14A]",
      price: "Rp199.000",
      btnBg: "bg-[#5EA14A]",
      hoverClass: "hover:rotate-[3deg]",
    },
    {
      id: 3,
      path: "/src/images/section 5/rabel-brave.png",
      imgBg: "bg-[#E33D35]",
      cardBg: "bg-[#FFBBB5]",
      textColor: "text-[#E33D35]",
      badge: "Berani",
      title: "Rabel Brave",
      desc: "Keberanian dan semangat untuk mengekspresikan diri.",
      descColor: "text-[#E33D35]",
      price: "Rp179.000",
      btnBg: "bg-[#E33D35]",
      hoverClass: "hover:-rotate-[3deg]",
    },
    {
      id: 4,
      path: "/src/images/section 5/sweet-shy.png",
      imgBg: "bg-[#DD74A5]",
      cardBg: "bg-[#F5D7E7]",
      textColor: "text-[#DD74A5]",
      badge: "Manis",
      title: "Sweet Shy",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#DD74A5]",
      price: "Rp189.000",
      btnBg: "bg-[#DD74A5]",
      hoverClass: "hover:rotate-[3deg]",
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
    active: { scale: 1.05 },
    inactive: { scale: 1 },
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
      title: "Katalog Produk",
      message: "Mengarahkan ke halaman belanja Evomi...",
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/belanja");
    }, 800);
  };

  // TAMBAHAN: Fungsi untuk menangani klik pada card produk
  const handleProductClick = (id: number, title: string) => {
    setNavModal({
      isOpen: true,
      type: "loading",
      title: title,
      message: `Mengarahkan ke detail produk ${title}...`,
    });

    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      // Mengarahkan ke rute detail produk dinamis (misal: /produk/1)
      // Silakan ubah path "/produk/" di bawah ini jika struktur folder Anda berbeda (misal: "/belanja/")
      router.push(`/belanja/${id}`);
    }, 800);
  };

  return (
    <section className="bg-white flex flex-col items-center text-center w-full pt-12 md:pt-10 pb-25 md:pb-20 px-3 md:px-4 relative overflow-hidden">
      {/* --- BACKGROUND DECORATIVE IMAGES --- */}
      <div className="absolute top-[15%] left-0 -translate-x-1/2 z-0 pointer-events-none w-[45px] md:w-[100px]">
        <Image
          src="/src/images/section 5/purpose.png"
          alt="Purpose Decoration"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
      <div className="absolute top-[15%] right-0 translate-x-1/2 z-0 pointer-events-none w-[45px] md:w-[100px]">
        <Image
          src="/src/images/section 5/sweet.png"
          alt="Sweet Decoration"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-[20%] left-0 -translate-x-1/2 z-0 pointer-events-none w-[45px] md:w-[100px]">
        <Image
          src="/src/images/section 5/rebel.png"
          alt="Rebel Decoration"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-[20%] right-0 translate-x-1/2 z-0 pointer-events-none w-[45px] md:w-[100px]">
        <Image
          src="/src/images/section 5/peaceful.png"
          alt="Peaceful Decoration"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      {/* 1. Judul & Subjudul */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        <h2 className="font-['Nohemi'] text-[28px] md:text-[38px] font-bold mb-2 md:mb-3 leading-tight">
          <span className="text-[#1172BA]">Khas </span>
          <span className="text-[#FF8A84]">Evomi</span>
        </h2>
        <p className="font-['Nohemi'] text-[13px] md:text-[16px] text-[#5D5D5D] max-w-2xl mb-8 md:mb-10 px-4 font-normal">
          Empat karakter aroma yang mewakili sisi berbeda dari dirimu.
        </p>
      </motion.div>

      {/* 2. Grid Card Produk */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="relative z-10 w-full max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-32 mb-12 md:mb-10 px-2 py-2 md:px-4"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            variants={cardVariants}
            // PERUBAHAN: Menambahkan handler onClick untuk memicu modal dan navigasi detail produk
            onClick={() => handleProductClick(product.id, product.title)}
            className={`font-['Nohemi'] relative w-full md:w-[230px] md:h-fit rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col border border-gray-100 hover:z-20 cursor-pointer ${product.hoverClass}`}
          >
            {/* Image Section */}
            <div
              className={`relative w-full aspect-[4/3] flex flex-col items-center justify-start pt-3 md:pt-3 ${product.imgBg}`}
            >
              <div className="absolute top-2 left-2 md:top-3 md:left-3">
                <span
                  className={`bg-white px-2 py-0.5 md:py-2 rounded-full text-[8px] md:text-[12px] font-bold ${product.textColor}`}
                >
                  {product.badge}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                className="w-full flex justify-center items-center flex-1 mt-[15px] md:mt-[25px] translate-y-[18px] md:translate-y-[25px]"
              >
                <Image
                  src={product.path}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="object-contain drop-shadow-xl w-[76%] md:w-[76%]"
                />
              </motion.div>
            </div>

            {/* Description Section */}
            <div
              className={`p-2.5 md:p-4 flex flex-col flex-grow text-left ${product.cardBg} z-20`}
            >
              <h3
                className={`text-[12px] md:text-[16px] font-bold mb-0.5 md:mb-2 ${product.textColor} tracking-tighter leading-tight`}
              >
                {product.title}
              </h3>
              <p
                className={`text-[9px] md:text-[10px] font-medium mb-2 md:mb-3 h-[24px] md:h-auto line-clamp-2 leading-tight md:leading-relaxed ${product.descColor}`}
              >
                {product.desc}
              </p>

              <div className="flex justify-between items-center mt-auto">
                <span
                  className={`text-[10px] md:text-[12px] font-bold ${product.textColor}`}
                >
                  {product.price}
                </span>
                <button
                  className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex justify-center items-center text-white transition-transform hover:scale-105 active:scale-95 ${product.btnBg}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-2.5 h-2.5 md:w-3 md:h-3"
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

      {/* 3. Tombol Lihat Koleksi */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10"
      >
        <button
          onClick={handleBelanjaAction}
          className="font-['Nohemi'] group flex items-center justify-center gap-2 md:gap-3 bg-[#1172BA] text-white text-[13px] md:text-[14px] font-bold px-6 py-2.5 md:px-10 md:py-3 rounded-full transition-transform duration-200 hover:scale-95 active:scale-90 shadow-md"
        >
          <div className="relative w-[16px] h-[16px] md:w-[19px] md:h-[19px]">
            <Image
              src="/src/images/section 5/star-medium.png"
              alt="Star Icon"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          Lihat Koleksi &rarr;
        </button>
      </motion.div>

      {/* 4. Animated Wave Background */}
      <div className="absolute bottom-0 left-0 w-full z-0 leading-[0]">
        <svg
          className="block w-full h-[30px] md:h-[70px]"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g>
            <use
              href="#gentle-wave"
              x="48"
              y="0"
              fill="#60BBFF"
              fillOpacity="0.3"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="10s"
                repeatCount="indefinite"
              />
            </use>
            <use
              href="#gentle-wave"
              x="48"
              y="3"
              fill="#60BBFF"
              fillOpacity="0.6"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="14s"
                repeatCount="indefinite"
              />
            </use>
            <use
              href="#gentle-wave"
              x="48"
              y="5"
              fill="#60BBFF"
              fillOpacity="1"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="20s"
                repeatCount="indefinite"
              />
            </use>
          </g>
        </svg>
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

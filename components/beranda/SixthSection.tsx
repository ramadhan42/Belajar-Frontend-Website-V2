"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useCms } from "@/context/CmsContext";
import { resolveCmsImage } from "@/lib/cms";
import { cmsFontStyle } from "@/lib/cmsFonts";

export default function SixthSection() {
  const { tBeranda } = useCms();
  const read = (key: string, fb = "") => tBeranda("sixth", key, fb);
  const packagingSrc =
    resolveCmsImage(read("image", "")) ||
    "/src/images/section 6/packaging.png";

  const label1 = read("label1", "Purpose\nPrestige");
  const label2 = read("label2", "Rebel\nBrave");
  const label3 = read("label3", "Peaceful\nCalm");
  const label4 = read("label4", "Sweet\nShy");
  const marqueeText = read("marquee_text", "Every Version of Me");

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const labelBase =
    "flex items-center gap-1 whitespace-pre-line text-left text-white pointer-events-none";

  return (
    <section
      className="bg-[#1172BA] flex flex-col items-center justify-center pt-8 pb-24 md:pt-4 md:pb-28 overflow-hidden select-none relative w-full"
    >
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

      {/* 1. Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUpVariants}
        className="relative z-30 flex items-center justify-center gap-2 md:gap-3 text-center px-3 sm:px-4 py-2 mb-3 md:top-12 md:mb-19"
      >
        <h2 className="text-[24px] sm:text-[28px] md:text-[42px] leading-tight">
          <span
            className="text-white"
            style={cmsFontStyle(read, "title_1", { weight: "700" })}
          >
            {read("title_1", "Packaging")}
          </span>{" "}
          <span
            className="text-[#A5E194]"
            style={cmsFontStyle(read, "title_2", { weight: "700" })}
          >
            {read("title_2", "Reveal")}
          </span>
        </h2>
        <img
          src="/src/images/section 6/star-medium.png"
          alt="Star Icon"
          className="w-[14px] h-[14px] md:w-[24px] md:h-[24px] object-contain brightness-0 invert shrink-0"
        />
      </motion.div>

      {/* 2. Area konten — mobile turun +3% (produk, sayap, label) */}
      <div className="relative w-full max-w-[100vw] flex flex-col items-center justify-center px-2 sm:px-3 md:px-2 py-1 md:py-2 translate-y-[3%] md:translate-y-0">
        {/* Frame samping — kecil di mobile, penuh di desktop */}
        <motion.img
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="/src/images/section 6/frame-kiri.png"
          alt=""
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[12%] max-w-[48px] sm:max-w-[72px] md:w-auto md:max-w-[200px] lg:max-w-none object-contain z-0 pointer-events-none opacity-70 md:opacity-100"
        />
        <motion.img
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="/src/images/section 6/frame-kanan.png"
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[12%] max-w-[48px] sm:max-w-[72px] md:w-auto md:max-w-[200px] lg:max-w-none object-contain z-0 pointer-events-none opacity-70 md:opacity-100"
        />

        {/* --- Label atas DESKTOP only --- */}
        <div className="hidden md:flex absolute top-17 left-8 lg:left-35 w-full px-12 lg:px-60 z-30 justify-between items-center text-white text-lg pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className={`${labelBase} gap-1.5 translate-x-[calc(-40px-2%)] lg:translate-x-[calc(-70px-2%)] translate-y-[calc(-40px-3%)] lg:translate-y-[calc(-72px-3%)]`}
          >
            <span
              className="text-[16px] leading-tight whitespace-pre-line"
              style={cmsFontStyle(read, "label1", { weight: "500" })}
            >
              {label1}
            </span>
            <img
              src="/src/images/section 6/purpose.png"
              alt="Purpose"
              className="w-[24px] h-[24px] object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className={`${labelBase} gap-1.5 mr-8 lg:mr-80 translate-x-[calc(-80px+13%)] lg:translate-x-[calc(-245px+13%)] translate-y-[calc(-30px-2%)] lg:translate-y-[calc(-58px-2%)]`}
          >
            <span
              className="text-[16px] leading-tight whitespace-pre-line"
              style={cmsFontStyle(read, "label2", { weight: "500" })}
            >
              {label2}
            </span>
            <img
              src="/src/images/section 6/rabel.png"
              alt="Rabel"
              className="w-[24px] h-[24px] object-contain"
            />
          </motion.div>
        </div>

        {/* Gambar packaging + label mobile (relatif ke gambar, aman di S20 ~360px) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 w-full max-w-[min(92vw,340px)] sm:max-w-[400px] md:max-w-[800px] lg:max-w-[1206px] mx-auto mt-[1%] mb-[3%] py-4 md:py-[25px]"
        >
          <div className="relative w-full">
            <img
              src={packagingSrc}
              alt="Packaging Main"
              className="w-full h-auto block object-contain drop-shadow-xl transition-[filter,drop-shadow] duration-500 ease-out md:hover:brightness-[1.03] md:hover:drop-shadow-2xl cursor-pointer bg-transparent"
            />

            {/* Label MOBILE — Galaxy S20 */}
            <div className="md:hidden absolute inset-0 z-30 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`${labelBase} absolute left-[0%] top-[-28%] bg-[#0A5A96]/55 backdrop-blur-[2px] px-1.5 py-1 rounded-full`}
              >
                <span
                  className="text-[9px] leading-tight whitespace-pre-line"
                  style={cmsFontStyle(read, "label1", { weight: "500" })}
                >
                  {label1}
                </span>
                <img
                  src="/src/images/section 6/purpose.png"
                  alt=""
                  className="w-[11px] h-[11px] object-contain"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`${labelBase} absolute right-[31%] top-[-27%] bg-[#0A5A96]/55 backdrop-blur-[2px] px-1.5 py-1 rounded-full`}
              >
                <span
                  className="text-[9px] leading-tight whitespace-pre-line"
                  style={cmsFontStyle(read, "label2", { weight: "500" })}
                >
                  {label2}
                </span>
                <img
                  src="/src/images/section 6/rabel.png"
                  alt=""
                  className="w-[11px] h-[11px] object-contain"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`${labelBase} absolute left-[17%] bottom-[-27%] bg-[#0A5A96]/55 backdrop-blur-[2px] px-1.5 py-1 rounded-full`}
              >
                <span
                  className="text-[9px] leading-tight whitespace-pre-line"
                  style={cmsFontStyle(read, "label3", { weight: "500" })}
                >
                  {label3}
                </span>
                <img
                  src="/src/images/section 6/peaceful.png"
                  alt=""
                  className="w-[11px] h-[11px] object-contain"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`${labelBase} absolute right-[8%] bottom-[-27%] bg-[#0A5A96]/55 backdrop-blur-[2px] px-1.5 py-1 rounded-full`}
              >
                <span
                  className="text-[9px] leading-tight whitespace-pre-line"
                  style={cmsFontStyle(read, "label4", { weight: "500" })}
                >
                  {label4}
                </span>
                <img
                  src="/src/images/section 6/sweetshy.png"
                  alt=""
                  className="w-[11px] h-[11px] object-contain"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* --- Label bawah DESKTOP only --- */}
        <div className="hidden md:flex absolute bottom-18 left-8 lg:left-20 w-full px-12 lg:px-100 z-30 justify-between items-center text-white text-lg translate-x-[15px] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className={`${labelBase} gap-1.5 translate-x-[calc(2rem-12vw)] lg:translate-x-[calc(8.75rem-12vw)] translate-y-[calc(30px-4vh)] lg:translate-y-[calc(52px-4vh)]`}
          >
            <span
              className="text-[16px] leading-tight whitespace-pre-line"
              style={cmsFontStyle(read, "label3", { weight: "500" })}
            >
              {label3}
            </span>
            <img
              src="/src/images/section 6/peaceful.png"
              alt="Peaceful"
              className="w-[24px] h-[24px] object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className={`${labelBase} gap-1.5 mr-4 translate-x-[calc(-20px-2%)] lg:translate-x-[calc(-60px-2%)] translate-y-[calc(28px+9%-4vh)] lg:translate-y-[calc(48px+9%-4vh)]`}
          >
            <span
              className="text-[16px] leading-tight whitespace-pre-line"
              style={cmsFontStyle(read, "label4", { weight: "500" })}
            >
              {label4}
            </span>
            <img
              src="/src/images/section 6/sweetshy.png"
              alt="Sweet"
              className="w-[24px] h-[24px] object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-[7%] md:bottom-10 left-0 w-full overflow-hidden py-2.5 md:py-4 border-y border-white/10 z-40 bg-[#0071BC]">
        <div className="animate-marquee flex items-center gap-4 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-8">
              <span
                className="text-[11px] md:text-[14px] whitespace-nowrap text-white"
                style={cmsFontStyle(read, "marquee_text", { weight: "500" })}
              >
                {marqueeText}
              </span>
              <div className="relative w-[14px] h-[14px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/purpose.png"
                  alt="Purpose"
                  fill
                  className="object-contain"
                />
              </div>

              <span
                className="text-[11px] md:text-[14px] whitespace-nowrap text-white"
                style={cmsFontStyle(read, "marquee_text", { weight: "500" })}
              >
                {marqueeText}
              </span>
              <div className="relative w-[14px] h-[14px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/peaceful.png"
                  alt="Peaceful"
                  fill
                  className="object-contain"
                />
              </div>

              <span
                className="text-[11px] md:text-[14px] whitespace-nowrap text-white"
                style={cmsFontStyle(read, "marquee_text", { weight: "500" })}
              >
                {marqueeText}
              </span>
              <div className="relative w-[14px] h-[14px] md:w-[25px] md:h-[25px]">
                <Image
                  src="/src/images/section 1/rab.png"
                  alt="Rab"
                  fill
                  className="object-contain"
                />
              </div>

              <span
                className="text-[11px] md:text-[14px] whitespace-nowrap text-white"
                style={cmsFontStyle(read, "marquee_text", { weight: "500" })}
              >
                {marqueeText}
              </span>
              <div className="relative w-[14px] h-[14px] md:w-[25px] md:h-[25px]">
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

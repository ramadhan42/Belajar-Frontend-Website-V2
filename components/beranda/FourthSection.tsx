"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCms } from "@/context/CmsContext";
import { resolveCmsImage } from "@/lib/cms";

const THANKS_CARD_FALLBACK = "/src/images/section 4/thanks-card.png";

export default function FourthSection() {
  const { tBeranda } = useCms();
  const thanksSrc =
    resolveCmsImage(tBeranda("fourth", "image", "")) || THANKS_CARD_FALLBACK;

  return (
    <section className="relative bg-white w-full overflow-hidden p-[5%]">
      {/* Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full md:hidden"
      >
        <img
          src={thanksSrc}
          alt="Evomi Thanks Card"
          className="block w-full h-auto"
        />
      </motion.div>

      {/* Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:block relative w-full"
      >
        <Image
          src={thanksSrc}
          alt="Evomi Thanks Card"
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          quality={90}
          sizes="100vw"
          priority={false}
          unoptimized={thanksSrc.startsWith("http")}
        />
      </motion.div>
    </section>
  );
}

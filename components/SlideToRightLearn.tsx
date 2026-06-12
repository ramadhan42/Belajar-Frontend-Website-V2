"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function SlideToRightSectionLearn() {
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Memantau progress scroll khusus pada container section ini
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Mengubah scroll vertikal (0 sampai 1) menjadi pergerakan horizontal (0% sampai -75%)
  // -75% berarti konten akan bergeser ke kiri, sehingga item baru muncul dari kanan
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    // Wadah tinggi (400vh) untuk memberikan ruang scroll yang panjang
    <section ref={targetRef} className="relative h-[400vh] bg-gray-50">
      {/* Sticky container: menahan layar agar tidak turun, sampai konten horizontal habis */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Title Font Animasi di Tengah */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false }}
          className="pointer-events-none absolute left-1/2 top-1/4 z-10 w-full -translate-x-1/2 -translate-y-1/2 text-center"
        >
          {/* Terapkan local font Anda di sini (misal: font-nohemi atau font-heavy) */}
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl">
            The New <span className="text-gray-400">Experience</span>
          </h1>
        </motion.div>

        {/* Konten Horizontal yang Bergeser */}
        <motion.div style={{ x }} className="flex gap-8 px-10 pt-32">
          <SlideCard
            number="01"
            title="Minimal Interface"
            desc="Desain yang bersih dengan fokus pada typografi dan whitespace."
          />
          <SlideCard
            number="02"
            title="Smooth Transitions"
            desc="Mengubah scroll bawah menjadi pergerakan horizontal yang natural."
          />
          <SlideCard
            number="03"
            title="Modern Aesthetics"
            desc="Kombinasi bayangan lembut dan sudut membulat untuk kesan premium."
          />
          <SlideCard
            number="04"
            title="Optimized Assets"
            desc="Mendukung penggunaan local fonts dan gambar beresolusi tinggi."
          />
        </motion.div>
      </div>
    </section>
  );
}

// Sub-komponen untuk kartu konten (Bisa dipecah ke file terpisah jika perlu)
function SlideCard({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex h-[55vh] w-[85vw] flex-col justify-between overflow-hidden rounded-3xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:w-[45vw] lg:w-[35vw]">
      <span className="text-5xl font-bold text-gray-200">{number}</span>
      <div>
        <h2 className="mb-4 text-3xl font-bold text-gray-800">{title}</h2>
        <p className="text-lg leading-relaxed text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

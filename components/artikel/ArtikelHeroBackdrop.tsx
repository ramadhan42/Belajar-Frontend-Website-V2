"use client";

import { motion } from "framer-motion";

/**
 * Soft Evomi-blue hero atmosphere: #1172BA at top (matches navbar / body)
 * lightens toward #5BA3DC / #7EB8E8 at the bottom.
 */
export default function ArtikelHeroBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1172BA 0%, #2E86C8 42%, #5BA3DC 78%, #7EB8E8 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 12% 18%, rgba(156,214,255,0.45), transparent 55%), radial-gradient(ellipse 55% 50% at 92% 12%, rgba(255,255,255,0.22), transparent 50%), radial-gradient(ellipse 50% 40% at 70% 88%, rgba(17,114,186,0.35), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full border border-white/20 bg-white/10 blur-[1px]"
        animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[38%] -left-12 h-40 w-40 rounded-full border border-white/15 bg-[#9CD6FF]/20"
        animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-[18%] h-24 w-24 rounded-[28px] rotate-12 border border-white/20 bg-white/10"
        animate={{ y: [0, -10, 0], rotate: [12, 18, 12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-[12%] h-3 w-3 rounded-full bg-white/70"
        animate={{ opacity: [0.35, 0.9, 0.35], scale: [1, 1.35, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-24 left-[42%] h-2 w-2 rounded-full bg-[#9CD6FF]/80"
        animate={{ opacity: [0.25, 0.85, 0.25], y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
    </>
  );
}

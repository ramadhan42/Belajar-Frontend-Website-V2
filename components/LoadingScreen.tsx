"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Mengatur durasi tampilan loading (misal: 2000ms = 2 detik)
    const timer = setTimeout(() => {
      setFadeOut(true); // Memulai animasi transparan (fade out)

      // Menghapus elemen dari DOM setelah animasi fade out selesai (500ms)
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 2000);

    // Membersihkan timer jika komponen di-unmount
    return () => clearTimeout(timer);
  }, []);

  // Jika loading sudah selesai, jangan render apa-apa
  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#1172BA] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animasi Spinner Berputar */}
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>

      {/* Teks Berkedip Halus (Pulse) */}
      <h1 className="text-white text-lg md:text-2xl font-medium tracking-wider animate-pulse">
        Memuat Halaman ...
      </h1>
    </div>
  );
}

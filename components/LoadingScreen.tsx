"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 bottom-[25%] md:bottom-[0%] z-[9999] bg-[#1172BA] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Container utama untuk Spinner dan Teks agar selalu di tengah */}
      <div className="flex flex-col items-center justify-center gap-6 px-6 text-center">
        
        {/* Animasi Spinner */}
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        
        {/* Teks Loading */}
        <p className="font-nohemi text-white text-[16px] md:text-[20px] font-medium tracking-widest uppercase">
          Loading...
        </p>
        
      </div>
    </div>
  );
}
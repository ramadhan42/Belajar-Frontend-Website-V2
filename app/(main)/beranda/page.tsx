"use client";

import { useEffect, useRef } from "react";
import HeroSection from "@/components/beranda/HeroSection";
import SecondSection from "@/components/beranda/SecondSection";
import FourthSection from "@/components/beranda/FourthSection";
import ThirdSection from "@/components/beranda/ThirdSection";
import FifthSection from "@/components/beranda/FifthSection";
import SixthSection from "@/components/beranda/SixthSection";
import SeventhSection from "@/components/beranda/SeventhSection";

export default function Beranda() {
  const thirdSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- 1. MENCEGAH DUPLIKASI HASH DI URL ---
    const sanitizeHash = () => {
      // Jika terdeteksi hash menumpuk menjadi '#third-section#third-section'
      if (window.location.hash.includes("#third-section#third-section")) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search + "#third-section"
        );
      }
    };

    // Jalankan pengecekan saat komponen pertama kali dimuat
    sanitizeHash();
    // Dengarkan jika ada perubahan hash di URL dari klik Navbar
    window.addEventListener("hashchange", sanitizeHash);

    // --- 2. MENGHAPUS HASH SAAT KELUAR DARI VIEWPORT ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (window.location.hash === "#third-section") {
              window.history.replaceState(
                null, 
                "", 
                window.location.pathname + window.location.search
              );
            }
          }
        });
      },
      {
        threshold: 0,
      }
    );

    if (thirdSectionRef.current) {
      observer.observe(thirdSectionRef.current);
    }

    // Cleanup listener & observer saat unmount
    return () => {
      window.removeEventListener("hashchange", sanitizeHash);
      if (thirdSectionRef.current) {
        observer.unobserve(thirdSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#1172ba] w-full min-h-screen flex flex-col">
      {/* Section Pertama */}
      <HeroSection />

      {/* Section ke 2 */}
      <SecondSection />

      {/* Target scroll & observer ref */}
      <div id="third-section" ref={thirdSectionRef}>
        <ThirdSection />
      </div>

      {/* Section ke 4 */}
      <FourthSection />

      {/* Section ke 5 */}
      <FifthSection />

      {/* Section ke 6 */}
      <SixthSection />

      {/* Section ke 7 */}
      <SeventhSection />
    </div>
  );
}
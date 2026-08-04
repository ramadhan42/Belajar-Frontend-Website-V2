"use client";

import { useEffect, useRef } from "react";
import HeroSection from "@/components/beranda/HeroSection";
import SecondSection from "@/components/beranda/SecondSection";
import FourthSection from "@/components/beranda/FourthSection";
import ThirdSection from "@/components/beranda/ThirdSection";
import FifthSection from "@/components/beranda/FifthSection";
import SixthSection from "@/components/beranda/SixthSection";
import SeventhSection from "@/components/beranda/SeventhSection";
import ArtikelSection from "@/components/beranda/ArtikelSection";

export default function Beranda() {
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sanitizeHash = () => {
      // Migrate old hash → #about
      if (window.location.hash === "#third-section") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search + "#about",
        );
        return;
      }

      // Prevent duplicated hash like '#about#about'
      if (window.location.hash.includes("#about#about")) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search + "#about",
        );
      }
    };

    sanitizeHash();
    window.addEventListener("hashchange", sanitizeHash);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (window.location.hash === "#about") {
              window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
            }
          }
        });
      },
      {
        threshold: 0,
      },
    );

    if (aboutSectionRef.current) {
      observer.observe(aboutSectionRef.current);
    }

    return () => {
      window.removeEventListener("hashchange", sanitizeHash);
      if (aboutSectionRef.current) {
        observer.unobserve(aboutSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#1172ba] w-full min-h-screen flex flex-col">
      <HeroSection />
      <SecondSection />

      <div id="about" ref={aboutSectionRef}>
        <ThirdSection />
      </div>

      {/* Brush divider between section 3 (blue) and section 4 (white) */}
      <div
        className="relative z-20 w-full leading-[0] pointer-events-none -my-[8px] sm:-my-[11px] md:-my-[15px] lg:-my-[19px]"
        aria-hidden
      >
        <img
          src="/src/images/section 3/vector-divider.svg"
          alt=""
          className="mx-auto block w-full h-[16px] sm:h-[22px] md:h-[30px] lg:h-[38px] object-cover object-center select-none"
          draggable={false}
        />
      </div>

      <FourthSection />
      <ArtikelSection />
      <FifthSection />

      {/* Brush divider between section 5 (white) and section 6 (blue) */}
      <div
        className="relative z-30 w-full leading-[0] pointer-events-none -mt-[14px] sm:-mt-[18px] md:-mt-[24px] lg:-mt-[28px] -mb-[2px]"
        aria-hidden
      >
        <img
          src="/src/images/section 6/divider.svg"
          alt=""
          className="mx-auto block w-full h-[22px] sm:h-[28px] md:h-[38px] lg:h-[48px] object-cover object-center select-none"
          draggable={false}
        />
      </div>

      <SixthSection />
      <SeventhSection />
    </div>
  );
}

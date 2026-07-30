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

      <FourthSection />
      <FifthSection />
      <SixthSection />
      <SeventhSection />
    </div>
  );
}

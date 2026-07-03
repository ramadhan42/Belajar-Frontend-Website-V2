"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalPanelsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Animasi teks pertama muncul saat scroll bawah
    gsap.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse",
      },
    });

    // 2. Setup Scroll Horizontal
    const panels = gsap.utils.toArray(".horizontal-panel");
    
    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: horizontalSectionRef.current,
        pin: true, // Menahan halaman agar tidak scroll ke bawah saat geser kanan
        scrub: 1, // Mengikat animasi dengan kecepatan scroll
        snap: 1 / (panels.length - 1), // Snap ke setiap panel
        end: () => "+=" + horizontalSectionRef.current?.offsetWidth,
      },
    });

    // Animasi teks di dalam panel horizontal
    panels.forEach((panel: any, i) => {
      gsap.from(panel.querySelectorAll(".panel-text"), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: panel,
          containerAnimation: gsap.getById("horizontal-scroll"), 
          start: "left center",
          toggleActions: "play none none reverse",
        },
      });
    });

    // 3. Animasi bagian akhir (scroll ke bawah setelah horizontal)
    gsap.from(".footer-card", {
      scale: 0.8,
      opacity: 0,
      rotation: 5,
      duration: 1,
      scrollTrigger: {
        trigger: ".footer-section",
        start: "top 80%",
        end: "bottom center",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-gray-50 text-gray-900 overflow-x-hidden">
      
      {/* Section 1: Scroll ke bawah pertama */}
      <section className="hero-section h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="hero-text text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Scroll ke Bawah
        </h1>
        <p className="hero-text text-xl text-gray-500 max-w-lg text-center">
          Teks ini muncul dengan animasi. Terus scroll untuk melihat transisi halaman berubah arah.
        </p>
      </section>

      {/* Section 2: Scroll Horizontal */}
      <section 
        ref={horizontalSectionRef} 
        className="h-screen w-full flex flex-nowrap overflow-hidden bg-black text-white"
      >
        <div ref={horizontalPanelsRef} className="flex h-full w-[300vw]">
          {/* Panel 1 */}
          <div className="horizontal-panel w-screen h-full flex flex-col items-center justify-center px-10">
            <h2 className="panel-text text-4xl md:text-6xl font-semibold mb-4">
              Halaman Bergerak ke Kanan
            </h2>
            <p className="panel-text text-lg text-gray-400">
              Kamu sedang melakukan scroll ke bawah, tapi konten bergerak menyamping.
            </p>
          </div>
          
          {/* Panel 2 */}
          <div className="horizontal-panel w-screen h-full flex flex-col items-center justify-center px-10 bg-zinc-900">
            <h2 className="panel-text text-4xl md:text-6xl font-semibold mb-4">
              Animasi Terikat Scroll
            </h2>
            <p className="panel-text text-lg text-gray-400">
              Semua pergerakan di sini dikendalikan penuh oleh roda mouse-mu (Scrubbing).
            </p>
          </div>

          {/* Panel 3 */}
          <div className="horizontal-panel w-screen h-full flex flex-col items-center justify-center px-10">
            <h2 className="panel-text text-4xl md:text-6xl font-semibold mb-4">
              Terus Scroll...
            </h2>
            <p className="panel-text text-lg text-gray-400">
              Setelah panel ini, kita akan kembali ke scroll vertikal normal.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Scroll bawah terakhir */}
      <section className="footer-section min-h-screen flex items-center justify-center bg-gray-100 p-10">
        <div className="footer-card bg-white p-12 rounded-3xl shadow-xl border border-gray-200 max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-6">Akhir Perjalanan</h2>
          <p className="text-gray-600 mb-8">
            Elemen ini membesar, memutar sedikit, dan muncul (fade in) mengikuti kecepatan scroll menggunakan properti <code className="bg-gray-100 px-2 py-1 rounded">scrub: true</code>.
          </p>
          <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Kembali ke Atas
          </button>
        </div>
      </section>

    </div>
  );
}
"use client"; // Diperlukan untuk menggunakan useState di Next.js App Router

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavbarColor } from "@/context/NavbarColorContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { navbarColor } = useNavbarColor();

  // Class seragam untuk semua menu agar memiliki efek hover pill (rounded-full, bg-white, text dinamis)
 // Class seragam untuk semua menu agar memiliki efek hover pill (rounded-full, bg-white, text dinamis)
  // Ditambahkan w-full md:w-[110px] dan flex justify-center agar lebarnya sama rata
  const navLinkClass = "flex justify-center items-center w-full md:w-[100px] text-[16px] py-2.5 font-bold rounded-full text-center text-white hover:bg-white hover:text-[var(--nav-color)] hover-bold-effect transition-colors duration-300";

  return (
    /* Wrapper luar untuk memberikan ruang agar rounded-full terlihat (efek floating) */
    <div className="p-4 md:p-6 w-full relative z-50 md:mt-5">
      <nav
        className="text-white rounded-[25px] px-6 py-3 md:px-8 md:py-4 relative w-[95%] max-w-[1280px] mx-auto transition-colors duration-300"
        style={{ 
          backgroundColor: navbarColor, 
          fontFamily: "Arial, Helvetica, sans-serif",
          "--nav-color": navbarColor // Deklarasi variabel CSS dinamis untuk Tailwind hover
        } as React.CSSProperties}
      >
        {/* --- CSS ANIMASI HOVER BOLD & PRESSED BUTTON --- */}
        <style>{`
          .hover-bold-effect {
            transition: text-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, transform 0.2s ease-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
          }
          .hover-bold-effect:hover {
            text-shadow: 0.8px 0 0 currentColor; 
            transform: scale(0.95) translateY(2px);
          }
        `}</style>

        {/* Kontainer Utama Navigasi */}
        <div className="flex items-center justify-between">
          {/* Menu Kiri: Logo */}
          <div className="md:ml-2 flex-shrink-0 mb-1 md:mb-2.5">
            <Link href="/">
              <Image
                src="/src/images/navbar/evomi-logo.png"
                alt="Logo Evomi"
                width={110}
                height={30}
                className="object-contain brightness-0 invert w-auto h-6 md:h-10"
                priority
              />
            </Link>
          </div>

          {/* --- DESKTOP VIEW: MENU TENGAH --- */}
          {/* Jarak diubah menjadi space-x-2 karena item sudah memiliki padding horizontal (px-5) */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Beranda
            </Link>

            <Link href="/#third-section" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Tentang
            </Link>

            <Link href="/halaman/belanja" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Belanja
            </Link>

            <Link href="/halaman/kuis" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Kuis
            </Link>
          </div>

          {/* --- DESKTOP VIEW: MENU KANAN --- */}
          <div className="hidden md:flex items-center space-x-2 md:mr-2">
            <Link href="/halaman/masuk" className={navLinkClass}>
              Login
            </Link>
            
            <Link href="/halaman/daftar" className={navLinkClass}>
              Daftar
            </Link>
          </div>

          {/* --- MOBILE VIEW: HAMBURGER BUTTON --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-2"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                // Icon Cross (X) saat menu terbuka
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icon Hamburger Menu (≡) saat menu tertutup
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* --- MOBILE VIEW: DROPDOWN MENU --- */}
        {isOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-full mt-3 px-6 py-5 flex flex-col space-y-2 shadow-xl rounded-2xl border z-40 transition-colors duration-300"
            style={{ backgroundColor: navbarColor, borderColor: `${navbarColor}99` }}
          >
            <Link href="/" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Beranda
            </Link>
            <Link href="/#third-section" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Tentang
            </Link>
            <Link href="/halaman/belanja" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Belanja
            </Link>
            <Link href="/halaman/kuis" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Kuis
            </Link>

            {/* Garis Pembatas Tipis */}
            <div
              className="my-3 transition-colors duration-300"
              style={{ borderTopColor: `${navbarColor}99`, borderTopWidth: "1px" }}
            />

            <Link href="/halaman/masuk" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Login
            </Link>
            <Link href="/halaman/daftar" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Daftar
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
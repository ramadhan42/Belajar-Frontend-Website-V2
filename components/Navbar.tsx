"use client"; // Diperlukan untuk menggunakan useState di Next.js App Router

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    /* Wrapper luar untuk memberikan ruang agar rounded-full terlihat (efek floating) */
    <div className="p-4 md:p-6 w-full relative z-50 md:mt-5">
      <nav
        className="bg-[#2B92DE] text-white rounded-[25px] px-6 py-3 md:px-8 md:py-4 relative w-[95%] max-w-[1280px] mx-auto"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* --- CSS ANIMASI HOVER BOLD & PRESSED BUTTON --- */}
        <style>{`
          .hover-bold-effect {
            transition: text-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, transform 0.2s ease-out;
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
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-[14px] bg-white text-[#2B92DE] px-5 py-2.5 rounded-full font-semibold text-center hover:bg-opacity-90 transition-all hover-bold-effect"
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="text-[14px] hover:text-gray-200 font-semibold transition-colors hover-bold-effect"
            >
              Tentang
            </Link>
            <Link
              href="/belanja"
              className="text-[14px] hover:text-gray-200 font-semibold transition-colors hover-bold-effect"
            >
              Belanja
            </Link>
            <Link
              href="/kuis"
              className="text-[14px] hover:text-gray-200 font-semibold transition-colors hover-bold-effect"
            >
              Kuis
            </Link>
          </div>

          {/* --- DESKTOP VIEW: MENU KANAN --- */}
          <div className="hidden md:flex items-center space-x-6 md:mr-2">
            <Link
              href="/login"
              className="text-[14px] font-semibold  hover:text-gray-200 font-medium transition-colors hover-bold-effect"
            >
              Login
            </Link>
            <Link
              href="/daftar"
              className="text-[14px] font-semibold  bg-white text-[#2B92DE] px-6 py-2.5 rounded-full font-medium text-center hover:bg-opacity-90 transition-all hover-bold-effect"
            >
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Icon Hamburger Menu (≡) saat menu tertutup
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* --- MOBILE VIEW: DROPDOWN MENU --- */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-3 bg-[#2B92DE] px-6 py-5 flex flex-col space-y-4 shadow-xl rounded-2xl border border-[#4DA5E6] z-40">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-[14px] bg-white text-[#2B92DE] py-2.5 rounded-full font-semibold text-center hover-bold-effect"
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-center py-2 font-medium hover-bold-effect text-white"
            >
              Tentang
            </Link>
            <Link
              href="/belanja"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-center py-2 font-medium hover-bold-effect text-white"
            >
              Belanja
            </Link>
            <Link
              href="/kuis"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-center py-2 font-medium hover-bold-effect text-white"
            >
              Kuis
            </Link>

            {/* Garis Pembatas Tipis */}
            <div className="border-t border-[#4DA5E6] my-1"></div>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-center py-2 font-medium hover-bold-effect text-white"
            >
              Login
            </Link>
            <Link
              href="/daftar"
              onClick={() => setIsOpen(false)}
              className="text-[14px] bg-white text-[#2B92DE] py-2.5 rounded-full font-semibold text-center hover-bold-effect"
            >
              Daftar
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}

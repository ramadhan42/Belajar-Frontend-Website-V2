"use client"; // Diperlukan untuk menggunakan useState di Next.js App Router

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0071bc] text-white px-6 py-4 relative z-50" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* --- CSS ANIMASI HOVER BOLD & PRESSED BUTTON --- */}
      <style>{`
        .hover-bold-effect {
          /* Menambahkan 'transform' ke dalam daftar transisi agar animasinya mulus */
          transition: text-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, transform 0.2s ease-out;
        }
        .hover-bold-effect:hover {
          text-shadow: 0.8px 0 0 currentColor; 
          /* Efek tombol ditekan: mengecil 5% (scale) dan bergeser ke bawah 2px (translateY) */
          transform: scale(0.95) translateY(2px);
        }
      `}</style>

      {/* Kontainer Utama Navigasi */}
      <div className="flex items-center justify-between mt-1 mb-1">
        
        {/* Menu Kiri: Logo */}
        <div className="md: md:ml-5">
          <Link href="/">
            <Image
              src="/src/images/navbar/evomi-logo.png"
              alt="Logo Evomi"
              width={120}
              height={40}
              className="object-contain brightness-0 invert"
              priority
            />
          </Link>
        </div>

        {/* --- DESKTOP VIEW: MENU TENGAH --- */}
        <div className="hidden md:flex items-center space-x-6 mt-1 mb-1">
          <Link
            href="/"
            className="text-[16px] bg-white text-[#0071bc] px-4 py-2 rounded-full font-regular text-center hover:bg-opacity-90 transition-all hover-bold-effect"
          >
            Beranda
          </Link>
          <Link
            href="/tentang"
            className="text-[16px] hover:text-gray-200 font-medium transition-colors hover-bold-effect"
          >
            Tentang
          </Link>
          <Link
            href="/belanja"
            className="text-[16px] hover:text-gray-200 font-medium transition-colors hover-bold-effect"
          >
            Belanja
          </Link>
          <Link
            href="/kuis"
            className="text-[16px] hover:text-gray-200 font-medium transition-colors hover-bold-effect"
          >
            Kuis
          </Link>
        </div>

        {/* --- DESKTOP VIEW: MENU KANAN --- */}
        <div className="hidden md:flex items-center space-x-6 mr-5 mt-1 mb-1">
          <Link
            href="/login"
            className="text-[16px] hover:text-gray-200 font-medium transition-colors hover-bold-effect"
          >
            Login
          </Link>
          <Link
            href="/daftar"
            className="text-[16px] bg-white text-[#0071bc] px-5 py-2 rounded-full font-regular text-center hover:bg-opacity-90 transition-all hover-bold-effect"
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
        <div className="md:hidden absolute left-0 right-0 top-full bg-[#0061a3] px-6 py-4 flex flex-col space-y-4 shadow-xl border-t border-[#0071bc]">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-[16px] bg-white text-[#0071bc] py-2.5 rounded-full font-semibold text-center hover-bold-effect"
          >
            Beranda
          </Link>
          <Link
            href="/tentang"
            onClick={() => setIsOpen(false)}
            className="text-[16px] text-center py-2 font-medium hover-bold-effect"
          >
            Tentang
          </Link>
          <Link
            href="/belanja"
            onClick={() => setIsOpen(false)}
            className="text-[16px] text-center py-2 font-medium hover-bold-effect"
          >
            Belanja
          </Link>
          <Link
            href="/kuis"
            onClick={() => setIsOpen(false)}
            className="text-[16px] text-center py-2 font-medium hover-bold-effect"
          >
            Kuis
          </Link>
          
          {/* Garis Pembatas Tipis */}
          <div className="border-t border-[#1a7fc5] my-1"></div>
          
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="text-[16px] text-center py-2 font-medium hover-bold-effect"
          >
            Login
          </Link>
          <Link
            href="/daftar"
            onClick={() => setIsOpen(false)}
            className="text-[16px] bg-white text-[#0071bc] py-2.5 rounded-full font-semibold text-center hover-bold-effect"
          >
            Daftar
          </Link>
        </div>
      )}

    </nav>
  );
}
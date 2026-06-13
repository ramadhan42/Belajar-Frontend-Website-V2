"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyColorHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Ambil elemen body
    const body = document.body;

    // Tentukan logika warna berdasarkan rute (pathname)
    if (
      pathname === "/about" ||
      pathname === "/contact" ||
      pathname === "/" ||
      pathname === "/belanja"
    ) {
      body.style.backgroundColor = "#1172BA";
    } else if (pathname === "/layanan") {
      body.style.backgroundColor = "#f0f0f0";
    } else if (pathname === "/kuis") {
      body.style.backgroundColor = "#F6F6F6"; 
    } 
    // Menggunakan startsWith untuk menangkap rute dinamis /belanja/[id]
    else if (pathname.startsWith("/belanja/")) {
      body.style.backgroundColor = "#F6F6F6";
    } 
    else if (pathname.startsWith("/profile/")) {
      body.style.backgroundColor = "#F6F6F6";
    } 
    // Default warna untuk halaman lainnya
    else {
      body.style.backgroundColor = "transparent";
    }

    // (Opsional) Cleanup function
    return () => {
      body.style.backgroundColor = "";
    };
  }, [pathname]); // Akan berjalan ulang setiap kali URL berubah

  return null; // Tidak me-render apapun ke layar
}
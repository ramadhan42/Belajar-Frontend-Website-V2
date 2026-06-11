"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyColorHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Ambil elemen body
    const body = document.body;

    // Tentukan logika warna berdasarkan rute (pathname)
    // Contoh: Jika di halaman /about atau /contact, warnanya #1172BA
    if (
      pathname === "/about" ||
      pathname === "/contact" ||
      pathname === "/" ||
      pathname === "/halaman/belanja"
    ) {
      body.style.backgroundColor = "#1172BA";
    }
    // Kamu bisa tambahkan else if lain untuk halaman tertentu
    else if (pathname === "/layanan") {
      body.style.backgroundColor = "#f0f0f0"; // Warna lain
    } else if (pathname === "/halaman/kuis") {
      body.style.backgroundColor = "#F6F6F6"; // Warna lain
    }
    // Default warna untuk halaman lainnya (termasuk "/")
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

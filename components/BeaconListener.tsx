"use client";

import { useEffect } from "react";

export default function BeaconListener() {
  useEffect(() => {
    const handleUnload = () => {
      // Mengambil token dari localStorage
      const token = localStorage.getItem("auth_token");

      if (token) {
        // sendBeacon harus mengirim data lewat FormData karena tidak mendukung kustom Header
        const formData = new FormData();
        formData.append("token", token);

        // Mengirim sinyal ke endpoint Laravel Anda
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_URL}/api/logout-beacon`,
          formData,
        );

        // Opsional: Hapus token dari browser juga secara instan
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    };

    // Event 'pagehide' lebih akurat dan didukung penuh oleh browser modern & mobile dibanding 'unload'
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  return null; // Komponen ini tidak merusak UI karena mengembalikan null
}

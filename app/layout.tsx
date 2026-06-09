import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 1. Import komponen Navbar yang baru dibuat
import Navbar from "@/components/global/Navbar";
import LoadingScreen from "@/components/beranda/LoadingScreen";

// 1. Inisialisasi Kumpulan Font Nohemi
const nohemi = localFont({
  src: [
    {
      path: "./fonts/Nohemi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nohemi", // Membuat CSS Variable untuk Tailwind
});
export const metadata: Metadata = {
  title: "Evomi Website",
  description: "Selamat datang di Evomi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nohemi.variable}`}>
      <body className={`antialiased`}>
        {/* Pasang Loading Screen di paling atas */}
        <LoadingScreen />

        

        {/* Konten halaman web kamu akan muncul di bawah navbar */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

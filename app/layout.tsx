import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

// 1. Import komponen Navbar yang baru dibuat
import Navbar from "@/components/Navbar"; 

// Deklarasikan font pertama
const eightHeavy = localFont({
  src: './fonts/8-Heavy.ttf',
  variable: '--font-eight-heavy',
  display: 'swap', 
});

// 1. Inisialisasi Kumpulan Font Nohemi
const nohemi = localFont({
  src: [
    {
      path: './fonts/Nohemi-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Nohemi-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Nohemi-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-nohemi', // Membuat CSS Variable untuk Tailwind
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
    <html lang="en" className={`${eightHeavy.variable} ${nohemi.variable}`}>
      <body className={`${nohemi.variable} antialiased`}>
        
        {/* 2. Pasang komponen Navbar di sini */}
        <Navbar />

        {/* Konten halaman web kamu akan muncul di bawah navbar */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
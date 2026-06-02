import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Import komponen Navbar yang baru dibuat
import Navbar from "@/components/Navbar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="id">
      <body className={`${geistSans.variable} antialiased`}>
        
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
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import Navbar from "@/components/global/Navbar";
import LoadingScreen from "@/components/beranda/LoadingScreen";

// 1. Import komponen handler baru
import NavbarRouteHandler from "@/components/global/NavbarRouteHandler";

import { NavbarColorProvider } from "@/context/NavbarColorContext";

// 1. Import komponen BodyColorHandler
import BodyColorHandler from "@/components/global/BodyColorHandler";
import Footer from "@/components/global/Footer";

const nohemi = localFont({
  src: [
    { path: "./fonts/Nohemi-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Nohemi-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/Nohemi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-nohemi",
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
        <BodyColorHandler />

        <NavbarColorProvider>
          {/* 2. Pasang NavbarRouteHandler DI DALAM Provider */}
          <NavbarRouteHandler />

          <LoadingScreen />
          <Navbar />
          <main className="min-h-screen">{children}</main>

          <Footer />
        </NavbarColorProvider>
      </body>
    </html>
  );
}
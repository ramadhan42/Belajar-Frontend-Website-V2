
import type { Metadata } from "next";
import "./../globals.css";

import Navbar from "@/components/global/Navbar";
import LoadingScreen from "@/components/beranda/LoadingScreen";

// 1. Import komponen handler baru
import NavbarRouteHandler from "@/components/global/NavbarRouteHandler";

import { NavbarColorProvider } from "@/context/NavbarColorContext";

// 1. Import komponen BodyColorHandler
import BodyColorHandler from "@/components/global/BodyColorHandler";
import Footer from "@/components/global/Footer";


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
   <main>
     <BodyColorHandler />

        <NavbarColorProvider>
          {/* 2. Pasang NavbarRouteHandler DI DALAM Provider */}
          <NavbarRouteHandler />

          <LoadingScreen />

          {<Navbar />}

          <main className="min-h-screen">{children}</main>

          {<Footer />}
          
        </NavbarColorProvider>
   </main>
  );
}
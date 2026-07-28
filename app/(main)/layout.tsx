import type { Metadata } from "next";
import "./../globals.css";

import Navbar from "@/components/global/Navbar";
import LoadingScreen from "@/components/beranda/LoadingScreen";
import NavbarRouteHandler from "@/components/global/NavbarRouteHandler";
import { NavbarColorProvider } from "@/context/NavbarColorContext";
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
    <div className="evomi-site min-h-screen w-full overflow-x-hidden">
      <BodyColorHandler />

      <NavbarColorProvider>
        <NavbarRouteHandler />
        <LoadingScreen />
        <Navbar />
        <main className="w-full overflow-x-hidden">{children}</main>
        <Footer />
      </NavbarColorProvider>
    </div>
  );
}

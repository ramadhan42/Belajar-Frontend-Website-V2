import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BeaconListener from "@/components/BeaconListener"; // Import komponen baru

const nohemi = localFont({
  src: [
    { path: "../public/fonts/Nohemi-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/Nohemi-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/Nohemi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-nohemi",
});

const heavy = localFont({
  src: "../public/fonts/8-Heavy.ttf",
  variable: "--font-heavy",
  weight: "900",
  style: "normal",
});

const parkinsans = localFont({
  src: [
    { path: "../public/fonts/Parkinsans-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Parkinsans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Parkinsans-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Parkinsans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Parkinsans-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Parkinsans-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-parkinsans",
});

const syne = localFont({
  src: [
    { path: "../public/fonts/Syne-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Syne-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Syne-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Syne-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Syne-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-syne",
});

// Metadata kini aman diekspor karena ini adalah Server Component murni
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
    <html lang="en" className={`${nohemi.variable} ${heavy.variable} ${parkinsans.variable} ${syne.variable}`}>
      <body className={`antialiased`}>
        {/* Sisipkan BeaconListener di sini agar memantau penutupan browser di semua rute */}
        <BeaconListener />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

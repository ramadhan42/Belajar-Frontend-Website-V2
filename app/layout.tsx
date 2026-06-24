import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BeaconListener from "@/components/BeaconListener"; // Import komponen baru

const nohemi = localFont({
  src: [
    { path: "./fonts/Nohemi-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Nohemi-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/Nohemi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-nohemi",
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
    <html lang="en" className={`${nohemi.variable}`}>
      <body className={`antialiased`}>
          {/* Sisipkan BeaconListener di sini agar memantau penutupan browser di semua rute */}
          <BeaconListener />
          
          <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
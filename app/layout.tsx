import type { Metadata } from "next";
import "./globals.css";
import BeaconListener from "@/components/BeaconListener";
import { fontVariables } from "@/lib/fonts";

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
    <html lang="id" className={fontVariables}>
      <body className="antialiased font-nohemi">
        <BeaconListener />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

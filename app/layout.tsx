import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { LocaleProvider } from "@/context/LocaleContext";
import { CmsProvider } from "@/context/CmsContext";
import { BadgeCountsProvider } from "@/context/BadgeCountsContext";
import LocaleSwitchFx from "@/components/global/LocaleSwitchFx";
import SiteDocumentMeta from "@/components/global/SiteDocumentMeta";

export const metadata: Metadata = {
  title: "Evomi Website",
  description: "Selamat datang di Evomi",
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260723-star-t", sizes: "any" },
      { url: "/favicon.png?v=20260723-star-t", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=20260723-star-t", sizes: "180x180" }],
  },
};

const hideScrollbarCss = `
  html, body, * {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  *::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
    background: transparent !important;
  }
  *::-webkit-scrollbar-thumb,
  *::-webkit-scrollbar-track,
  *::-webkit-scrollbar-corner {
    display: none !important;
    background: transparent !important;
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={fontVariables}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: hideScrollbarCss }} />
      </head>
      <body className="antialiased font-nohemi">
        <LocaleProvider>
          <CmsProvider>
            <BadgeCountsProvider>
              <LocaleSwitchFx />
              <SiteDocumentMeta />
              <main className="min-h-screen">{children}</main>
            </BadgeCountsProvider>
          </CmsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

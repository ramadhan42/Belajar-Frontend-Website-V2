import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { LocaleProvider } from "@/context/LocaleContext";
import { CmsProvider } from "@/context/CmsContext";
import LocaleSwitchFx from "@/components/global/LocaleSwitchFx";
import SiteDocumentMeta from "@/components/global/SiteDocumentMeta";

export const metadata: Metadata = {
  title: "Evomi Website",
  description: "Selamat datang di Evomi",
  icons: {
    icon: "/favicon.ico",
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
            <LocaleSwitchFx />
            <SiteDocumentMeta />
            <main className="min-h-screen">{children}</main>
          </CmsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

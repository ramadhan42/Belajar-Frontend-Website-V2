"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const BLUE = "#1172BA";
const WHITE = "#FFFFFF";

export default function BodyColorHandler() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    let color = "transparent";

    if (
      pathname === "/about" ||
      pathname === "/contact" ||
      pathname === "/" ||
      pathname === "/beranda" ||
      pathname === "/belanja"
    ) {
      color = BLUE;
    } else if (pathname === "/layanan") {
      color = "#f0f0f0";
    } else if (
      pathname === "/profile" ||
      pathname.startsWith("/profile/") ||
      pathname.startsWith("/belanja/") ||
      pathname === "/checkout" ||
      pathname.startsWith("/checkout/") ||
      pathname === "/kuis" ||
      pathname.startsWith("/kuis/")
    ) {
      color = pathname.startsWith("/checkout") ? "#F0F3F7" : WHITE;
    }

    body.style.setProperty(
      "transition",
      "background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
    );
    html.style.setProperty(
      "transition",
      "background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
    );
    body.style.setProperty("background-color", color);
    html.style.setProperty("background-color", color);
  }, [pathname]);

  return null;
}

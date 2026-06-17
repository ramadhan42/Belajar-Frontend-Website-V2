// @/components/global/NavbarRouteHandler.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavbarColor } from "@/context/NavbarColorContext";

// @/components/global/NavbarRouteHandler.tsx
export default function NavbarRouteHandler() {
  const pathname = usePathname();
  const { resetColors } = useNavbarColor();

  useEffect(() => {
    // IZINKAN halaman tertentu untuk TIDAK di-reset (biarkan komponen mengatur warnanya sendiri)
    const isSpecialPage =
      pathname.startsWith("/belanja/") ||
      pathname.startsWith("/kuis/") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/profile/") 

    if (!isSpecialPage) {
      resetColors();
    }
  }, [pathname, resetColors]);

  return null;
}

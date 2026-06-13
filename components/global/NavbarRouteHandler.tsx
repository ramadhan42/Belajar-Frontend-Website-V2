// @/components/global/NavbarRouteHandler.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavbarColor } from "@/context/NavbarColorContext";

export default function NavbarRouteHandler() {
  const pathname = usePathname();
  const { resetColors } = useNavbarColor();

  useEffect(() => {
    // Jika path BUKAN halaman detail produk, reset ke warna default
    if (
      !pathname.startsWith("/halaman/belanja/") ||
      !pathname.startsWith("/halaman/kuis/")
    ) {
      resetColors();
    }
  }, [pathname, resetColors]);

  return null;
}

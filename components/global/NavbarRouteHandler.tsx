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
    // Halaman khusus mengatur warna sendiri (detail/checkout/dll)
    const isSpecialPage =
      pathname.startsWith("/belanja/") ||
      pathname.startsWith("/kuis/") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/profile/");

    // /belanja di-handle BelanjaPageClient (timing enter sinkron)
    if (!isSpecialPage && pathname !== "/belanja") {
      resetColors();
    }
  }, [pathname, resetColors]);

  return null;
}

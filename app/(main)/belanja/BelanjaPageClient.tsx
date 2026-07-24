"use client";

import { useLayoutEffect } from "react";
import { useNavbarColor } from "@/context/NavbarColorContext";
import FirstSectionBelanja from "@/components/belanja/FirstSectionBelanja";
import SecondSectionBelanja from "@/components/belanja/SecondSectionBelanja";
import {
  BELANJA_BLUE,
  BELANJA_EASE,
  restoreThemeColorDuration,
  snapThemeColorDuration,
} from "@/lib/belanjaEnter";

export default function BelanjaPageClient() {
  const { setNavbarAndFooterColor } = useNavbarColor();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-belanja-enter");

    // Snap biru sebelum paint — navbar & section 1 sama, tanpa morph terlihat
    snapThemeColorDuration();
    setNavbarAndFooterColor(BELANJA_BLUE);

    const restoreTimer = window.setTimeout(() => {
      restoreThemeColorDuration(120);
    }, 32);

    return () => {
      window.clearTimeout(restoreTimer);
      root.style.removeProperty("--theme-bg-duration");
    };
  }, [setNavbarAndFooterColor]);

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-0">
      {/* Selalu biru brand — jangan ikut warna produk sisa dari halaman sebelumnya */}
      <div
        className="w-full"
        style={{
          backgroundColor: BELANJA_BLUE,
          transition: `background-color var(--theme-bg-duration, 0ms) ${BELANJA_EASE}`,
        }}
      >
        <FirstSectionBelanja forceBrandBlue />
      </div>
      <div className="w-full bg-white">
        <SecondSectionBelanja />
      </div>
    </div>
  );
}

"use client";

import { useLayoutEffect, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";

const REVEAL_MS = 520;

/**
 * Syncs locale loading / reveal state to <html> so global CSS can
 * shimmer and fade text on every page without wrapping each string.
 * useLayoutEffect avoids a flash of non-shimmer text on refresh/boot.
 */
export default function LocaleSwitchFx() {
  const { isLocaleLoading, revealToken } = useLocale();

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isLocaleLoading) {
      root.dataset.localeLoading = "true";
      root.removeAttribute("data-locale-reveal");
      return;
    }
    root.removeAttribute("data-locale-loading");
  }, [isLocaleLoading]);

  useEffect(() => {
    if (!revealToken) return;
    const root = document.documentElement;
    root.dataset.localeReveal = "true";
    const t = window.setTimeout(() => {
      root.removeAttribute("data-locale-reveal");
    }, REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [revealToken]);

  return null;
}

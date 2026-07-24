"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavbarColor } from "@/context/NavbarColorContext";
import {
  BELANJA_BLUE,
  BELANJA_EASE,
  restoreThemeColorDuration,
  setSmoothThemeColorDuration,
  snapThemeColorDuration,
  THEME_COLOR_FADE_MS,
  THEME_COLOR_SHIMMER_MS,
  THEME_COLOR_SMOOTH_MS,
  THEME_CONTENT_FADE_MS,
} from "@/lib/belanjaEnter";

type ThemeTransitionOptions = {
  textFx?: boolean;
  colorShimmer?: boolean;
};

export type ProductThemeTransitionState = {
  /** Masih proses shimmer / settle warna */
  isThemeLoading: boolean;
  /** Konten teks+gambar boleh fade-in (mulai saat reveal) */
  contentVisible: boolean;
};

/**
 * Transisi warna navbar/footer ke warna produk.
 * colorShimmer: shimmer → fade warna + fade konten.
 */
export function useProductThemeTransition(
  targetColor: string | null | undefined,
  ready: boolean,
  options?: ThemeTransitionOptions,
): ProductThemeTransitionState {
  const textFx = options?.textFx === true;
  const colorShimmer = options?.colorShimmer === true;
  const { setNavbarAndFooterColor } = useNavbarColor();
  const [isThemeLoading, setIsThemeLoading] = useState(!ready);
  // true dari awal agar shell konten + shimmer navbar sinkron di paint pertama
  const [contentVisible, setContentVisible] = useState(true);
  const startedAtRef = useRef(Date.now());
  const timersRef = useRef<{
    apply?: number;
    settle?: number;
    restore?: number;
  }>({});

  useLayoutEffect(() => {
    const root = document.documentElement;
    const timers = timersRef.current;

    const clearTimers = () => {
      if (timers.apply) window.clearTimeout(timers.apply);
      if (timers.settle) window.clearTimeout(timers.settle);
      if (timers.restore) window.clearTimeout(timers.restore);
      timers.apply = undefined;
      timers.settle = undefined;
      timers.restore = undefined;
    };

    clearTimers();

    if (!ready) {
      startedAtRef.current = Date.now();
      setIsThemeLoading(true);
      // Shell konten + navbar shimmer bersamaan (jangan hide konten)
      setContentVisible(true);
      root.style.setProperty("--belanja-reveal-ease", BELANJA_EASE);
      root.style.setProperty(
        "--theme-content-fade-duration",
        `${THEME_CONTENT_FADE_MS}ms`,
      );
      root.removeAttribute("data-theme-color-reveal");
      root.removeAttribute("data-theme-content-reveal");
      root.dataset.themeContentVisible = "true";

      if (colorShimmer) {
        root.dataset.themeColorLoading = "true";
        setSmoothThemeColorDuration(THEME_COLOR_SMOOTH_MS);
      }
      if (textFx) root.dataset.themeLoading = "true";
      else root.removeAttribute("data-theme-loading");

      return clearTimers;
    }

    const color = targetColor || BELANJA_BLUE;
    root.removeAttribute("data-theme-loading");
    root.style.setProperty("--belanja-reveal-ease", BELANJA_EASE);
    root.style.setProperty(
      "--theme-content-fade-duration",
      `${THEME_CONTENT_FADE_MS}ms`,
    );

    if (!colorShimmer) {
      snapThemeColorDuration();
      root.removeAttribute("data-theme-color-loading");
      root.removeAttribute("data-theme-color-reveal");
      root.dataset.themeContentVisible = "true";
      setNavbarAndFooterColor(color);
      setContentVisible(true);
      setIsThemeLoading(false);
      timers.restore = window.setTimeout(() => {
        restoreThemeColorDuration(120);
      }, 32);
      return clearTimers;
    }

    setSmoothThemeColorDuration(THEME_COLOR_SMOOTH_MS);
    root.dataset.themeColorLoading = "true";
    root.removeAttribute("data-theme-color-reveal");
    // Konten tetap terlihat saat shimmer (div/teks), jangan di-hide
    root.dataset.themeContentVisible = "true";
    setContentVisible(true);

    const elapsed = Date.now() - startedAtRef.current;
    const shimmerWait = Math.max(60, THEME_COLOR_SHIMMER_MS - elapsed);

    timers.apply = window.setTimeout(() => {
      setNavbarAndFooterColor(color);
      root.dataset.themeColorReveal = "true";
      root.dataset.themeContentReveal = "true";

      timers.settle = window.setTimeout(() => {
        root.removeAttribute("data-theme-color-loading");
        root.removeAttribute("data-theme-color-reveal");
        root.removeAttribute("data-theme-content-reveal");
        setIsThemeLoading(false);
        restoreThemeColorDuration(120);
      }, Math.max(THEME_COLOR_FADE_MS, THEME_CONTENT_FADE_MS));
    }, shimmerWait);

    return clearTimers;
  }, [ready, targetColor, setNavbarAndFooterColor, textFx, colorShimmer]);

  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.removeAttribute("data-belanja-enter");
      root.removeAttribute("data-theme-loading");
      root.removeAttribute("data-theme-reveal");
      root.removeAttribute("data-theme-color-loading");
      root.removeAttribute("data-theme-color-reveal");
      root.removeAttribute("data-theme-content-reveal");
      root.removeAttribute("data-theme-content-visible");
    };
  }, []);

  return { isThemeLoading, contentVisible };
}

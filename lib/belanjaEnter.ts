/** Warna default belanja / beranda */
export const BELANJA_BLUE = "#1172BA";
export const BELANJA_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Transisi warna smooth (details) */
export const THEME_COLOR_SMOOTH_MS = 360;
/** Shimmer minimal sebelum warna produk dipasang */
export const THEME_COLOR_SHIMMER_MS = 280;
/** Fade shimmer → warna produk */
export const THEME_COLOR_FADE_MS = 420;
/** Fade konten teks + gambar setelah shimmer */
export const THEME_CONTENT_FADE_MS = 520;

/**
 * Snap warna tanpa animasi (belanja list).
 */
export function snapThemeColorDuration() {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--theme-bg-duration", "0ms");
}

/** Duration smooth untuk morph warna */
export function setSmoothThemeColorDuration(ms = THEME_COLOR_SMOOTH_MS) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--theme-bg-duration", `${ms}ms`);
  document.documentElement.style.setProperty(
    "--theme-color-fade-duration",
    `${THEME_COLOR_FADE_MS}ms`,
  );
  document.documentElement.style.setProperty(
    "--theme-content-fade-duration",
    `${THEME_CONTENT_FADE_MS}ms`,
  );
}

export function restoreThemeColorDuration(ms = 120) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--theme-bg-duration", `${ms}ms`);
}

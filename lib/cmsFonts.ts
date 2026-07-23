/**
 * Shared CMS font options (project local fonts + common system fonts).
 * Values stored in CMS are keys; resolve to CSS via resolveCmsFontFamily().
 */

import type { CSSProperties } from "react";

export type CmsFontFamilyKey =
  | "nohemi"
  | "parkinsans"
  | "syne"
  | "heavy"
  | "arial"
  | "helvetica"
  | "georgia"
  | "times"
  | "verdana"
  | "tahoma"
  | "courier"
  | "system";

export const CMS_FONT_FAMILY_OPTIONS: {
  value: CmsFontFamilyKey;
  label: string;
  group: "project" | "system";
}[] = [
  { value: "nohemi", label: "Nohemi (project)", group: "project" },
  { value: "parkinsans", label: "Parkinsans (project)", group: "project" },
  { value: "syne", label: "Syne (project)", group: "project" },
  { value: "heavy", label: "8-Heavy (project)", group: "project" },
  { value: "arial", label: "Arial", group: "system" },
  { value: "helvetica", label: "Helvetica", group: "system" },
  { value: "georgia", label: "Georgia", group: "system" },
  { value: "times", label: "Times New Roman", group: "system" },
  { value: "verdana", label: "Verdana", group: "system" },
  { value: "tahoma", label: "Tahoma", group: "system" },
  { value: "courier", label: "Courier New", group: "system" },
  { value: "system", label: "System UI", group: "system" },
];

export const CMS_FONT_WEIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "300", label: "300 — Light" },
  { value: "400", label: "400 — Regular" },
  { value: "500", label: "500 — Medium" },
  { value: "600", label: "600 — SemiBold" },
  { value: "700", label: "700 — Bold" },
  { value: "800", label: "800 — ExtraBold" },
  { value: "900", label: "900 — Black" },
];

export const CMS_FONT_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
];

const FONT_FAMILY_CSS: Record<CmsFontFamilyKey, string> = {
  nohemi: "var(--font-nohemi), sans-serif",
  parkinsans: "var(--font-parkinsans), sans-serif",
  syne: "var(--font-syne), sans-serif",
  heavy: "var(--font-heavy), sans-serif",
  arial: "Arial, Helvetica, sans-serif",
  helvetica: "Helvetica, Arial, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  times: "'Times New Roman', Times, serif",
  verdana: "Verdana, Geneva, sans-serif",
  tahoma: "Tahoma, Geneva, sans-serif",
  courier: "'Courier New', Courier, monospace",
  system:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export function isCmsFontFamilyKey(value: string): value is CmsFontFamilyKey {
  return value in FONT_FAMILY_CSS;
}

export function resolveCmsFontFamily(
  raw: string | null | undefined,
  fallback: CmsFontFamilyKey = "nohemi",
): string {
  const key = (raw ?? "").trim().toLowerCase();
  if (isCmsFontFamilyKey(key)) return FONT_FAMILY_CSS[key];
  // Allow raw CSS font-family stacks from CMS if ever needed
  if (key.includes(",") || key.startsWith("var(")) return raw!.trim();
  return FONT_FAMILY_CSS[fallback];
}

export function resolveCmsFontWeight(
  raw: string | null | undefined,
  fallback = "400",
): string {
  const v = (raw ?? "").trim();
  if (/^(300|400|500|600|700|800|900)$/.test(v)) return v;
  return fallback;
}

export function resolveCmsFontStyle(
  raw: string | null | undefined,
  fallback: "normal" | "italic" = "normal",
): "normal" | "italic" {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "italic" || v === "normal") return v;
  return fallback;
}

export function isCmsFontFamilyField(key: string) {
  return key.endsWith("_font_family");
}

export function isCmsFontWeightField(key: string) {
  return key.endsWith("_font_weight");
}

export function isCmsFontStyleField(key: string) {
  return key.endsWith("_font_style");
}

export function isCmsFontField(key: string) {
  return (
    isCmsFontFamilyField(key) ||
    isCmsFontWeightField(key) ||
    isCmsFontStyleField(key)
  );
}

export type CmsFontDefaults = {
  family?: CmsFontFamilyKey;
  weight?: string;
  style?: "normal" | "italic";
};

/**
 * Build inline font styles from CMS keys `{prefix}_font_family|weight|style`.
 * `read(key, fallback)` should already be scoped to the section (or full tBeranda binder).
 */
export function cmsFontStyle(
  read: (key: string, fallback: string) => string,
  prefix: string,
  defaults: CmsFontDefaults = {},
): CSSProperties {
  const family = defaults.family ?? "nohemi";
  const weight = defaults.weight ?? "400";
  const style = defaults.style ?? "normal";
  return {
    fontFamily: resolveCmsFontFamily(
      read(`${prefix}_font_family`, family),
      family,
    ),
    fontWeight: resolveCmsFontWeight(
      read(`${prefix}_font_weight`, weight),
      weight,
    ),
    fontStyle: resolveCmsFontStyle(
      read(`${prefix}_font_style`, style),
      style,
    ),
  };
}

/** Append font_* triples after each content key in a CMS field order list. */
export function withFontFieldOrder(
  order: string[],
  contentKeys: string[],
): string[] {
  const set = new Set(contentKeys);
  const out: string[] = [];
  for (const key of order) {
    out.push(key);
    if (set.has(key)) {
      out.push(
        `${key}_font_family`,
        `${key}_font_weight`,
        `${key}_font_style`,
      );
    }
  }
  return out;
}

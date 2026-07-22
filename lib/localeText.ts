import type { Locale } from "@/context/LocaleContext";

/** Pick Indonesian / English copy by active locale. */
export function L(locale: Locale, id: string, en: string): string {
  return locale === "en" ? en : id;
}

type ProductLike = {
  title?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
} | null | undefined;

/** Prefer *_en product fields when locale is English. */
export function productLocaleText(
  product: ProductLike,
  field: "title" | "description",
  locale: Locale,
  fallback = "",
): string {
  if (!product) return fallback;
  if (locale === "en") {
    const en = product[`${field}_en`];
    if (en) return en;
  }
  return product[field] || fallback;
}

"use client";

import { useLocale, type Locale } from "@/context/LocaleContext";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export default function LanguageSwitcher({
  className = "",
  variant = "light",
}: Props) {
  const { locale, setLocale } = useLocale();

  const base =
    variant === "dark"
      ? "bg-gray-100 text-gray-500"
      : "bg-white/20 text-white/70";
  const active =
    variant === "dark"
      ? "bg-white text-gray-900 shadow-sm"
      : "bg-white text-[#1172BA] shadow-sm";

  const btn = (code: Locale, label: string) => (
    <button
      type="button"
      onClick={() => setLocale(code)}
      className={`px-2.5 py-1 rounded-full text-[11px] md:text-[12px] font-semibold tracking-wide transition-all ${
        locale === code ? active : "hover:text-inherit"
      }`}
      aria-pressed={locale === code}
      aria-label={`Switch language to ${label}`}
    >
      {label}
    </button>
  );

  return (
    <div
      data-no-locale-fx
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-full ${base} ${className}`}
      role="group"
      aria-label="Language"
    >
      {btn("id", "ID")}
      {btn("en", "EN")}
    </div>
  );
}

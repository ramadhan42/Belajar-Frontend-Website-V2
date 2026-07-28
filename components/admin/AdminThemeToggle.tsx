"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAdminI18n } from "@/hooks/useAdminI18n";

type Props = {
  className?: string;
  compact?: boolean;
};

export default function AdminThemeToggle({
  className = "",
  compact = false,
}: Props) {
  const { theme, toggleTheme, isDark } = useAdminTheme();
  const { t } = useAdminI18n();

  const label = isDark
    ? t("theme", "switch_light", "Mode terang", "Light mode")
    : t("theme", "switch_dark", "Mode gelap", "Dark mode");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-colors duration-300 ${
        compact
          ? "h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          : "px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-white/10 dark:hover:bg-white/15"
      } ${className}`}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -60, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {!compact ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "light" : "dark"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            {isDark ? "Light" : "Dark"}
          </motion.span>
        </AnimatePresence>
      ) : null}
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AdminTheme = "light" | "dark";

type AdminThemeContextValue = {
  theme: AdminTheme;
  isDark: boolean;
  ready: boolean;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "evomi-admin-theme";

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

function runThemeChange(update: () => void) {
  const doc = typeof document !== "undefined" ? document : null;
  const start = doc
    ? (
        doc as Document & {
          startViewTransition?: (cb: () => void) => { finished: Promise<void> };
        }
      ).startViewTransition
    : undefined;

  if (typeof start === "function") {
    try {
      start.call(doc, update);
      return;
    } catch {
      /* fallback below */
    }
  }
  update();
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    // Enable transitions after first paint to avoid flash on load
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, ready]);

  const setTheme = useCallback((next: AdminTheme) => {
    runThemeChange(() => setThemeState(next));
  }, []);

  const toggleTheme = useCallback(() => {
    runThemeChange(() =>
      setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      ready,
      setTheme,
      toggleTheme,
    }),
    [theme, ready, setTheme, toggleTheme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}

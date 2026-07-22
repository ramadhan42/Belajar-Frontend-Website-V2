"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Locale = "id" | "en";

const STORAGE_KEY = "evomi_locale";
const MIN_SHIMMER_MS = 380;
const SETTLE_MS = 100;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  ready: boolean;
  /** True while locale content is loading (refresh/boot or language switch) */
  isLocaleLoading: boolean;
  /** Increments each time loading finishes — drives reveal animation */
  revealToken: number;
  /**
   * Register an async locale-dependent load. Call the returned function when done.
   * Used on language switch and on initial page refresh/boot.
   */
  trackLocaleLoad: () => () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");
  const [ready, setReady] = useState(false);
  // Start true so refresh/boot shows the same shimmer as a language switch
  const [isLocaleLoading, setIsLocaleLoading] = useState(true);
  const [revealToken, setRevealToken] = useState(0);

  const localeRef = useRef<Locale>("id");
  const pendingRef = useRef(0);
  const switchingRef = useRef(true);
  const switchStartedAtRef = useRef(Date.now());
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    switchingRef.current = true;
    switchStartedAtRef.current = Date.now();
    setIsLocaleLoading(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "id") {
      localeRef.current = stored;
      setLocaleState(stored);
      document.documentElement.lang = stored;
    } else {
      document.documentElement.lang = "id";
    }
    setReady(true);
  }, []);

  const finishSwitchIfIdle = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

    const elapsed = Date.now() - switchStartedAtRef.current;
    const wait = Math.max(SETTLE_MS, MIN_SHIMMER_MS - elapsed);

    settleTimerRef.current = setTimeout(() => {
      if (!switchingRef.current) return;
      if (pendingRef.current > 0) {
        setIsLocaleLoading(true);
        return;
      }
      switchingRef.current = false;
      setIsLocaleLoading(false);
      setRevealToken((n) => n + 1);
    }, wait);
  }, []);

  const trackLocaleLoad = useCallback(() => {
    pendingRef.current += 1;
    if (switchingRef.current) {
      setIsLocaleLoading(true);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    }

    let ended = false;
    return () => {
      if (ended) return;
      ended = true;
      pendingRef.current = Math.max(0, pendingRef.current - 1);
      if (switchingRef.current) finishSwitchIfIdle();
    };
  }, [finishSwitchIfIdle]);

  const setLocale = useCallback((next: Locale) => {
    if (localeRef.current === next) return;
    localeRef.current = next;
    switchingRef.current = true;
    switchStartedAtRef.current = Date.now();
    setIsLocaleLoading(true);
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event("locale-change"));
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      ready,
      isLocaleLoading,
      revealToken,
      trackLocaleLoad,
    }),
    [locale, setLocale, ready, isLocaleLoading, revealToken, trackLocaleLoad],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "id" as Locale,
      setLocale: () => {},
      ready: false,
      isLocaleLoading: false,
      revealToken: 0,
      trackLocaleLoad: () => () => {},
    };
  }
  return ctx;
}

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CmsGrouped, cmsValue, getCmsPage } from "@/lib/cms";

type CmsContextValue = {
  navbar: CmsGrouped;
  footer: CmsGrouped;
  beranda: CmsGrouped;
  ready: boolean;
  tNav: (key: string, fallback: string) => string;
  tFooter: (section: string, key: string, fallback: string) => string;
  tBeranda: (section: string, key: string, fallback: string) => string;
};

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [navbar, setNavbar] = useState<CmsGrouped>({});
  const [footer, setFooter] = useState<CmsGrouped>({});
  const [beranda, setBeranda] = useState<CmsGrouped>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [nav, foot, ber] = await Promise.all([
        getCmsPage("navbar"),
        getCmsPage("footer"),
        getCmsPage("beranda"),
      ]);
      if (cancelled) return;
      setNavbar(nav);
      setFooter(foot);
      setBeranda(ber);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      navbar,
      footer,
      beranda,
      ready,
      tNav: (key, fallback) => cmsValue(navbar, "menu", key, fallback),
      tFooter: (section, key, fallback) =>
        cmsValue(footer, section, key, fallback),
      tBeranda: (section, key, fallback) =>
        cmsValue(beranda, section, key, fallback),
    }),
    [navbar, footer, beranda, ready],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    return {
      navbar: {},
      footer: {},
      beranda: {},
      ready: false,
      tNav: (_k: string, fallback: string) => fallback,
      tFooter: (_s: string, _k: string, fallback: string) => fallback,
      tBeranda: (_s: string, _k: string, fallback: string) => fallback,
    } satisfies CmsContextValue;
  }
  return ctx;
}

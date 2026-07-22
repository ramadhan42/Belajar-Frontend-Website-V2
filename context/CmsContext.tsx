"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CmsGrouped, cmsValue, getCmsPage } from "@/lib/cms";
import { useLocale } from "@/context/LocaleContext";

type CmsContextValue = {
  navbar: CmsGrouped;
  footer: CmsGrouped;
  beranda: CmsGrouped;
  ui: CmsGrouped;
  admin: CmsGrouped;
  ready: boolean;
  tNav: (key: string, fallback: string) => string;
  tFooter: (section: string, key: string, fallback: string) => string;
  tBeranda: (section: string, key: string, fallback: string) => string;
  tUi: (section: string, key: string, fallback: string) => string;
  tAdmin: (section: string, key: string, fallback: string) => string;
};

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { locale, ready: localeReady, trackLocaleLoad } = useLocale();
  const [navbar, setNavbar] = useState<CmsGrouped>({});
  const [footer, setFooter] = useState<CmsGrouped>({});
  const [beranda, setBeranda] = useState<CmsGrouped>({});
  const [ui, setUi] = useState<CmsGrouped>({});
  const [admin, setAdmin] = useState<CmsGrouped>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localeReady) return;
    let cancelled = false;
    const endLoad = trackLocaleLoad();
    setReady(false);
    (async () => {
      try {
        const [nav, foot, ber, uiPage, adminPage] = await Promise.all([
          getCmsPage("navbar", locale),
          getCmsPage("footer", locale),
          getCmsPage("beranda", locale),
          getCmsPage("ui", locale),
          getCmsPage("admin", locale),
        ]);
        if (cancelled) return;
        setNavbar(nav);
        setFooter(foot);
        setBeranda(ber);
        setUi(uiPage);
        setAdmin(adminPage);
        setReady(true);
      } finally {
        if (!cancelled) endLoad();
      }
    })();
    return () => {
      cancelled = true;
      endLoad();
    };
  }, [locale, localeReady, trackLocaleLoad]);

  const value = useMemo<CmsContextValue>(
    () => ({
      navbar,
      footer,
      beranda,
      ui,
      admin,
      ready,
      tNav: (key, fallback) => cmsValue(navbar, "menu", key, fallback),
      tFooter: (section, key, fallback) =>
        cmsValue(footer, section, key, fallback),
      tBeranda: (section, key, fallback) =>
        cmsValue(beranda, section, key, fallback),
      tUi: (section, key, fallback) => cmsValue(ui, section, key, fallback),
      tAdmin: (section, key, fallback) =>
        cmsValue(admin, section, key, fallback),
    }),
    [navbar, footer, beranda, ui, admin, ready],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

const fallbackCms: CmsContextValue = {
  navbar: {},
  footer: {},
  beranda: {},
  ui: {},
  admin: {},
  ready: false,
  tNav: (_k, fallback) => fallback,
  tFooter: (_s, _k, fallback) => fallback,
  tBeranda: (_s, _k, fallback) => fallback,
  tUi: (_s, _k, fallback) => fallback,
  tAdmin: (_s, _k, fallback) => fallback,
};

export function useCms() {
  return useContext(CmsContext) ?? fallbackCms;
}

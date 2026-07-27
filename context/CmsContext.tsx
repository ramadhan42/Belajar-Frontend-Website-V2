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
  belanja: CmsGrouped;
  belanjaDetails: CmsGrouped;
  checkout: CmsGrouped;
  ready: boolean;
  tNav: (key: string, fallback: string) => string;
  tFooter: (section: string, key: string, fallback: string) => string;
  tBeranda: (section: string, key: string, fallback: string) => string;
  tUi: (section: string, key: string, fallback: string) => string;
  tAdmin: (section: string, key: string, fallback: string) => string;
  tBelanja: (section: string, key: string, fallback: string) => string;
  tBelanjaDetails: (section: string, key: string, fallback: string) => string;
  tCheckout: (section: string, key: string, fallback: string) => string;
};

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { locale, ready: localeReady, trackLocaleLoad } = useLocale();
  const [navbar, setNavbar] = useState<CmsGrouped>({});
  const [footer, setFooter] = useState<CmsGrouped>({});
  const [beranda, setBeranda] = useState<CmsGrouped>({});
  const [ui, setUi] = useState<CmsGrouped>({});
  const [admin, setAdmin] = useState<CmsGrouped>({});
  const [belanja, setBelanja] = useState<CmsGrouped>({});
  const [belanjaDetails, setBelanjaDetails] = useState<CmsGrouped>({});
  const [checkout, setCheckout] = useState<CmsGrouped>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localeReady) return;
    let cancelled = false;
    const endLoad = trackLocaleLoad();
    setReady(false);
    (async () => {
      try {
        const [nav, foot, ber, uiPage, adminPage, bel, belDet, chk] =
          await Promise.all([
            getCmsPage("navbar", locale),
            getCmsPage("footer", locale),
            getCmsPage("beranda", locale),
            getCmsPage("ui", locale),
            getCmsPage("admin", locale),
            getCmsPage("belanja", locale),
            getCmsPage("belanja_details", locale),
            getCmsPage("checkout", locale),
          ]);
        if (cancelled) return;
        setNavbar(nav);
        setFooter(foot);
        setBeranda(ber);
        setUi(uiPage);
        setAdmin(adminPage);
        setBelanja(bel);
        setBelanjaDetails(belDet);
        setCheckout(chk);
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
      belanja,
      belanjaDetails,
      checkout,
      ready,
      tNav: (key, fallback) => cmsValue(navbar, "menu", key, fallback),
      tFooter: (section, key, fallback) =>
        cmsValue(footer, section, key, fallback),
      tBeranda: (section, key, fallback) =>
        cmsValue(beranda, section, key, fallback),
      tUi: (section, key, fallback) => cmsValue(ui, section, key, fallback),
      tAdmin: (section, key, fallback) =>
        cmsValue(admin, section, key, fallback),
      tBelanja: (section, key, fallback) =>
        cmsValue(belanja, section, key, fallback),
      tBelanjaDetails: (section, key, fallback) =>
        cmsValue(belanjaDetails, section, key, fallback),
      tCheckout: (section, key, fallback) =>
        cmsValue(checkout, section, key, fallback),
    }),
    [
      navbar,
      footer,
      beranda,
      ui,
      admin,
      belanja,
      belanjaDetails,
      checkout,
      ready,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

const fallbackCms: CmsContextValue = {
  navbar: {},
  footer: {},
  beranda: {},
  ui: {},
  admin: {},
  belanja: {},
  belanjaDetails: {},
  checkout: {},
  ready: false,
  tNav: (_k, fallback) => fallback,
  tFooter: (_s, _k, fallback) => fallback,
  tBeranda: (_s, _k, fallback) => fallback,
  tUi: (_s, _k, fallback) => fallback,
  tAdmin: (_s, _k, fallback) => fallback,
  tBelanja: (_s, _k, fallback) => fallback,
  tBelanjaDetails: (_s, _k, fallback) => fallback,
  tCheckout: (_s, _k, fallback) => fallback,
};

export function useCms() {
  return useContext(CmsContext) ?? fallbackCms;
}

"use client";

import { useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";

/**
 * Keep the locale-switch shimmer active until `busy` becomes false.
 * Re-registers on every locale change so overlapping fetches stay tracked.
 */
export function useTrackLocaleLoad(busy: boolean) {
  const { trackLocaleLoad, locale } = useLocale();

  useEffect(() => {
    if (!busy) return;
    return trackLocaleLoad();
  }, [busy, locale, trackLocaleLoad]);
}

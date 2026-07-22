"use client";

import { useEffect } from "react";
import { useCms } from "@/context/CmsContext";
import { cmsValue, resolveCmsImage } from "@/lib/cms";

const DEFAULT_TITLE = "Evomi Website";
const DEFAULT_FAVICON = "/favicon.ico";

/**
 * Applies CMS-managed browser tab title + favicon.
 * Defaults match the current static metadata when CMS is empty.
 */
export default function SiteDocumentMeta() {
  const { navbar, ready } = useCms();

  useEffect(() => {
    if (!ready) return;

    const title =
      cmsValue(navbar, "site", "browser_title", DEFAULT_TITLE).trim() ||
      DEFAULT_TITLE;
    document.title = title;

    const rawFavicon = cmsValue(navbar, "site", "favicon", DEFAULT_FAVICON);
    const faviconHref =
      resolveCmsImage(rawFavicon || DEFAULT_FAVICON) || DEFAULT_FAVICON;

    const ensureIconLink = (rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"]`,
      );
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      // Bust cache when favicon changes
      const sep = faviconHref.includes("?") ? "&" : "?";
      link.href = `${faviconHref}${sep}v=${encodeURIComponent(faviconHref)}`;
    };

    ensureIconLink("icon");
    ensureIconLink("shortcut icon");
  }, [navbar, ready]);

  return null;
}

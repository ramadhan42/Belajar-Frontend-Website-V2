"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCms } from "@/context/CmsContext";
import { cmsValue, resolveCmsImage } from "@/lib/cms";

const DEFAULT_FRONTEND_TITLE = "Evomi Website";
const DEFAULT_DASHBOARD_TITLE = "Evomi Dashboard";
const DEFAULT_FAVICON = "/favicon.ico";
/** Bump when replacing favicon files so browsers drop the cached tab icon. */
const FAVICON_CACHE_BUST = "20260723-star-t";

function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin-login" ||
    pathname.startsWith("/admin-login/")
  );
}

/**
 * Applies CMS-managed browser tab title + favicon.
 * Frontend and dashboard titles are separate CMS fields.
 */
export default function SiteDocumentMeta() {
  const pathname = usePathname();
  const { navbar, ready } = useCms();

  useEffect(() => {
    if (!ready) return;

    const onDashboard = isDashboardPath(pathname);
    const frontendTitle =
      cmsValue(navbar, "site", "browser_title", DEFAULT_FRONTEND_TITLE).trim() ||
      DEFAULT_FRONTEND_TITLE;
    const dashboardTitle =
      cmsValue(
        navbar,
        "site",
        "dashboard_browser_title",
        DEFAULT_DASHBOARD_TITLE,
      ).trim() || DEFAULT_DASHBOARD_TITLE;

    document.title = onDashboard ? dashboardTitle : frontendTitle;

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
      const sep = faviconHref.includes("?") ? "&" : "?";
      link.href = `${faviconHref}${sep}v=${FAVICON_CACHE_BUST}`;
    };

    ensureIconLink("icon");
    ensureIconLink("shortcut icon");
  }, [navbar, ready, pathname]);

  return null;
}

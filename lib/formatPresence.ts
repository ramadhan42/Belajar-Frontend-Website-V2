/** Format ISO datetime for admin/profile presence labels. */
export function formatPresenceDateTime(
  value?: string | null,
  locale: string = "id",
): string {
  if (!value) {
    return locale === "en" ? "Never" : "Belum pernah";
  }

  try {
    return new Date(value).toLocaleString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Relative-ish label for last seen (still shows absolute time as title elsewhere). */
export function formatPresenceRelative(
  value?: string | null,
  locale: string = "id",
): string {
  if (!value) {
    return locale === "en" ? "Never" : "Belum pernah";
  }

  try {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    if (Number.isNaN(diffMs)) {
      return formatPresenceDateTime(value, locale);
    }

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 2) {
      return locale === "en" ? "Online just now" : "Baru saja online";
    }
    if (minutes < 60) {
      return locale === "en"
        ? `${minutes} min ago`
        : `${minutes} menit lalu`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return locale === "en"
        ? `${hours} hr ago`
        : `${hours} jam lalu`;
    }

    return formatPresenceDateTime(value, locale);
  } catch {
    return "—";
  }
}

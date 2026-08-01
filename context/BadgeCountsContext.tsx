"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getBadgeCounts, type BadgeCounts } from "@/lib/api";

const EMPTY_COUNTS: BadgeCounts = {
  cart: 0,
  wishlist: 0,
  history: 0,
  unread: 0,
};

/** Soft poll only while tab is visible — keeps chat badge fresh without spam. */
const VISIBLE_POLL_MS = 60_000;
const FOCUS_REFRESH_COOLDOWN_MS = 5_000;

type BadgeCountsContextValue = BadgeCounts & {
  ready: boolean;
  refresh: (force?: boolean) => Promise<void>;
};

const BadgeCountsContext = createContext<BadgeCountsContextValue | null>(null);

const BADGE_EVENTS = [
  "auth-change",
  "cart_updated",
  "wishlist_updated",
  "history_updated",
  "messages_read",
] as const;

export function BadgeCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<BadgeCounts>(EMPTY_COUNTS);
  const [ready, setReady] = useState(false);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchAtRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setCounts(EMPTY_COUNTS);
      setReady(true);
      lastFetchAtRef.current = Date.now();
      return;
    }

    const now = Date.now();
    if (
      !force &&
      inFlightRef.current === null &&
      now - lastFetchAtRef.current < FOCUS_REFRESH_COOLDOWN_MS
    ) {
      return;
    }

    if (inFlightRef.current) {
      await inFlightRef.current;
      return;
    }

    const run = (async () => {
      try {
        const next = await getBadgeCounts();
        setCounts(next);
        lastFetchAtRef.current = Date.now();
      } catch (error) {
        console.error("Gagal load badge counts:", error);
      } finally {
        setReady(true);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    await run;
  }, []);

  const startPollIfVisible = useCallback(() => {
    clearPoll();
    if (typeof document === "undefined") return;
    if (document.visibilityState !== "visible") return;
    if (!localStorage.getItem("auth_token")) return;

    pollTimerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh(true);
      }
    }, VISIBLE_POLL_MS);
  }, [clearPoll, refresh]);

  useEffect(() => {
    void refresh(true);
    startPollIfVisible();

    const onBadgeEvent = () => {
      void refresh(true).then(() => startPollIfVisible());
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh(false);
        startPollIfVisible();
      } else {
        clearPoll();
      }
    };

    const onFocus = () => {
      void refresh(false);
    };

    for (const eventName of BADGE_EVENTS) {
      window.addEventListener(eventName, onBadgeEvent);
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      clearPoll();
      for (const eventName of BADGE_EVENTS) {
        window.removeEventListener(eventName, onBadgeEvent);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [clearPoll, refresh, startPollIfVisible]);

  const value = useMemo<BadgeCountsContextValue>(
    () => ({
      ...counts,
      ready,
      refresh,
    }),
    [counts, ready, refresh],
  );

  return (
    <BadgeCountsContext.Provider value={value}>
      {children}
    </BadgeCountsContext.Provider>
  );
}

export function useBadgeCounts(): BadgeCountsContextValue {
  const context = useContext(BadgeCountsContext);
  if (!context) {
    throw new Error("useBadgeCounts must be used within a BadgeCountsProvider");
  }
  return context;
}

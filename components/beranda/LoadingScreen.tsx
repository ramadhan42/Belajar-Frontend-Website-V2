"use client";

import { useEffect, useState } from "react";

const MIN_SHOW_MS = 1200;
const MAX_SHOW_MS = 2400;

function unlockScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const startedAt = Date.now();
    let raf = 0;
    let done = false;
    let hideTimer = 0;
    let pollTimer = 0;
    let maxTimer = 0;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const finish = () => {
      if (done) return;
      done = true;
      setProgress(100);
      setFadeOut(true);
      unlockScroll();
      hideTimer = window.setTimeout(() => setIsVisible(false), 500);
    };

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const soft = Math.min(92, 8 + (elapsed / MAX_SHOW_MS) * 84);
      setProgress(soft);
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const tryFinish = () => {
      const elapsed = Date.now() - startedAt;
      const ready =
        document.readyState === "complete" || elapsed >= MAX_SHOW_MS;
      if (ready && elapsed >= MIN_SHOW_MS) {
        finish();
        return;
      }
      pollTimer = window.setTimeout(tryFinish, 120);
    };

    const onLoad = () => tryFinish();
    if (document.readyState === "complete") {
      tryFinish();
    } else {
      window.addEventListener("load", onLoad);
      maxTimer = window.setTimeout(tryFinish, MAX_SHOW_MS);
    }

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.clearTimeout(pollTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", onLoad);
      unlockScroll();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`evomi-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 transition-opacity duration-500 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-busy="true"
      aria-live="polite"
      role="status"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, #1a8fd4 0%, transparent 55%), linear-gradient(165deg, #0a5f9e 0%, #1172BA 42%, #0d6aad 100%)",
      }}
    >
      <style>{`
        @keyframes evomi-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes evomi-pulse {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
        .evomi-orbit-ring { animation: evomi-orbit 2.4s linear infinite; }
        .evomi-pulse-ring { animation: evomi-pulse 2.2s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-7">
        <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
          <div
            className="evomi-pulse-ring absolute inset-0 rounded-full border border-white/25"
            aria-hidden
          />
          <div
            className="evomi-orbit-ring absolute inset-[-6px] rounded-full border border-transparent border-t-white/90 border-r-white/35"
            aria-hidden
          />
          <div
            className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            aria-hidden
          />
        </div>

        <div className="text-center">
          <p className="font-nohemi text-[30px] font-semibold tracking-[0.22em] text-white md:text-[36px]">
            EVOMI
          </p>
          <p className="mt-2 font-nohemi text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase md:text-[13px]">
            Every Version of Me
          </p>
        </div>

        <div className="h-[3px] w-44 overflow-hidden rounded-full bg-white/15 md:w-56">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

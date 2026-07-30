"use client";

import { useEffect, useState } from "react";

const MIN_SHOW_MS = 1400;
const MAX_SHOW_MS = 2800;

function unlockScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

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
      // Buka scroll segera saat fade-out, jangan tunggu unmount
      unlockScroll();
      hideTimer = window.setTimeout(() => setIsVisible(false), 650);
    };

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const soft = Math.min(92, (elapsed / MAX_SHOW_MS) * 100);
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
      className={`evomi-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-[650ms] ease-out ${
        fadeOut
          ? "opacity-0 scale-[1.02] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <style>{`
        .evomi-loader {
          background:
            radial-gradient(ellipse 80% 60% at 50% 35%, #1a8fd4 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 80% 80%, rgba(255, 163, 203, 0.22) 0%, transparent 50%),
            radial-gradient(ellipse 60% 45% at 15% 75%, rgba(165, 225, 148, 0.18) 0%, transparent 45%),
            linear-gradient(165deg, #0a5f9e 0%, #1172BA 42%, #0d6aad 100%);
        }

        @keyframes evomi-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes evomi-pulse {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }

        @keyframes evomi-letter {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes evomi-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }

        .evomi-orbit-ring {
          animation: evomi-orbit 2.4s linear infinite;
        }

        .evomi-pulse-ring {
          animation: evomi-pulse 2.2s ease-in-out infinite;
        }

        .evomi-letter {
          display: inline-block;
          animation: evomi-letter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .evomi-bar-shine {
          animation: evomi-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-[#FFA3CB]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
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
          <p className="font-nohemi text-[28px] font-semibold tracking-[0.28em] text-white md:text-[36px]">
            {"EVOMI".split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className="evomi-letter"
                style={{ animationDelay: `${180 + i * 90}ms` }}
              >
                {ch}
              </span>
            ))}
          </p>
          <p
            className="evomi-letter mt-2 font-nohemi text-[11px] font-medium tracking-[0.22em] text-white/70 uppercase md:text-[13px]"
            style={{ animationDelay: "720ms" }}
          >
            Every Version of Me
          </p>
        </div>

        <div className="mt-2 w-44 overflow-hidden rounded-full bg-white/15 md:w-56">
          <div
            className="relative h-[3px] rounded-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="evomi-bar-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}

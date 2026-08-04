"use client";

import type { ReactNode } from "react";

type AdminRichTooltipProps = {
  title: string;
  body?: string;
  highlight?: string;
  footer?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra classes on the trigger wrapper */
  triggerClassName?: string;
  side?: "top" | "bottom";
  /** Stop click bubbling (useful on clickable cards). */
  stopTriggerClick?: boolean;
};

/**
 * Dark custom tooltip panel used across admin dashboard / profile.
 * Shows on hover and keyboard focus of the trigger group.
 */
export default function AdminRichTooltip({
  title,
  body,
  highlight,
  footer,
  icon,
  children,
  className = "",
  triggerClassName = "",
  side = "bottom",
  stopTriggerClick = false,
}: AdminRichTooltipProps) {
  const panelPos =
    side === "top"
      ? "bottom-[calc(100%+10px)] top-auto"
      : "top-[calc(100%+10px)]";
  const arrowPos =
    side === "top"
      ? "-bottom-1.5 top-auto border-r border-b border-l-0 border-t-0"
      : "-top-1.5 border-l border-t border-r-0 border-b-0";

  return (
    <div
      className={`group/tip relative ${className}`}
      onClick={stopTriggerClick ? (e) => e.stopPropagation() : undefined}
    >
      <div
        className={`${
          triggerClassName.includes("w-full") ? "flex" : "inline-flex"
        } items-center ${triggerClassName}`}
      >
        {children}
      </div>

      <div
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 ${panelPos} z-40 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 opacity-0 scale-95 translate-y-1 transition-all duration-200 ease-out group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-y-0 group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100 group-focus-within/tip:translate-y-0`}
      >
        <div className="relative rounded-2xl border border-slate-200/90 bg-slate-900 px-3.5 py-3 text-left shadow-[0_18px_40px_-16px_rgba(15,23,42,0.55)]">
          <span
            className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border border-slate-200/90 bg-slate-900 ${arrowPos}`}
            aria-hidden
          />
          <div className="relative flex items-center gap-2">
            {icon ? (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white shrink-0">
                {icon}
              </span>
            ) : null}
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {title}
            </p>
          </div>
          {highlight ? (
            <p className="relative mt-2 text-sm font-semibold text-white leading-snug break-words">
              {highlight}
            </p>
          ) : null}
          {body ? (
            <p className="relative mt-1.5 text-[11px] leading-relaxed text-slate-400 whitespace-pre-line">
              {body}
            </p>
          ) : null}
          {footer ? (
            <p className="relative mt-2 text-[10px] font-medium text-emerald-400/90">
              {footer}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

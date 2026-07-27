"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CmsNumberInputProps = {
  value: string;
  onChange: (next: string) => void;
  /** Visual unit only (px / % / deg) — not editable, not part of the number input */
  unit?: string;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
};

function parseDisplayNumber(raw: string): number | null {
  const n = Number.parseFloat(raw.trim());
  return Number.isFinite(n) ? n : null;
}

/** Strip trailing css units so the field always shows a pure number. */
function toPureNumberString(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(-?\d*\.?\d*)\s*(px|%|deg|°)?$/i);
  if (match) return match[1] ?? "";
  const loose = trimmed.match(/-?\d+(?:\.\d+)?/);
  return loose ? loose[0] : trimmed;
}

function formatStepped(n: number, step: number): string {
  const decimals = String(step).includes(".")
    ? (String(step).split(".")[1]?.length ?? 0)
    : 0;
  const rounded =
    decimals > 0
      ? Math.round(n * 10 ** decimals) / 10 ** decimals
      : Math.round(n);
  if (decimals === 0) return String(rounded);
  return rounded.toFixed(decimals).replace(/\.?0+$/, "");
}

function displayUnitLabel(unit?: string) {
  if (!unit) return "";
  if (unit === "deg") return "°";
  return unit;
}

export default function CmsNumberInput({
  value,
  onChange,
  unit = "",
  step = 1,
  disabled = false,
  placeholder = "0",
}: CmsNumberInputProps) {
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayValue = toPureNumberString(value);
  const unitLabel = displayUnitLabel(unit);

  const clearHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  };

  useEffect(() => () => clearHold(), []);

  const bump = (dir: 1 | -1) => {
    const current = parseDisplayNumber(displayValue);
    const base = current ?? 0;
    onChange(formatStepped(base + dir * step, step));
  };

  const startHold = (dir: 1 | -1) => {
    if (disabled) return;
    bump(dir);
    clearHold();
    delayRef.current = setTimeout(() => {
      holdRef.current = setInterval(() => bump(dir), 60);
    }, 350);
  };

  return (
    <div
      className={`group flex h-11 overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/15 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={displayValue}
        placeholder={placeholder}
        onChange={(e) => {
          const next = toPureNumberString(e.target.value);
          if (next === "" || /^-?\d*\.?\d*$/.test(next)) {
            onChange(next);
          }
        }}
        onBlur={() => {
          if (
            displayValue === "" ||
            displayValue === "-" ||
            displayValue === "."
          ) {
            return;
          }
          const n = parseDisplayNumber(displayValue);
          if (n === null) {
            onChange("");
            return;
          }
          onChange(String(n));
        }}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-semibold tabular-nums tracking-tight text-gray-900 outline-none placeholder:font-medium placeholder:text-gray-300"
      />

      {unitLabel ? (
        <span
          aria-hidden
          className="flex shrink-0 items-center border-l border-gray-100 bg-gray-50/70 px-2.5 text-xs font-bold uppercase tracking-wide text-gray-400 select-none"
        >
          {unitLabel}
        </span>
      ) : null}

      <div className="flex w-9 shrink-0 flex-col border-l border-gray-200 bg-gray-50/80">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Naikkan nilai"
          onMouseDown={(e) => {
            e.preventDefault();
            startHold(1);
          }}
          onMouseUp={clearHold}
          onMouseLeave={clearHold}
          onTouchStart={(e) => {
            e.preventDefault();
            startHold(1);
          }}
          onTouchEnd={clearHold}
          className="flex flex-1 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 disabled:pointer-events-none"
        >
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <div className="h-px bg-gray-200" />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Turunkan nilai"
          onMouseDown={(e) => {
            e.preventDefault();
            startHold(-1);
          }}
          onMouseUp={clearHold}
          onMouseLeave={clearHold}
          onTouchStart={(e) => {
            e.preventDefault();
            startHold(-1);
          }}
          onTouchEnd={clearHold}
          className="flex flex-1 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 disabled:pointer-events-none"
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

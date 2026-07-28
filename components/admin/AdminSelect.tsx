"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type AdminSelectOption = {
  value: string;
  label: string;
  /** Optional group heading key */
  group?: string;
  /** Optional inline style for the option label (e.g. font preview) */
  style?: CSSProperties;
  disabled?: boolean;
};

type AdminSelectProps = {
  options: AdminSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Map group key → display label */
  groupLabels?: Record<string, string>;
};

type MenuPos = { top: number; left: number; width: number; maxHeight: number };

export default function AdminSelect({
  options,
  value,
  defaultValue = "",
  onChange,
  name,
  id,
  placeholder = "Pilih…",
  disabled = false,
  required = false,
  className = "",
  groupLabels = {},
}: AdminSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selected = useMemo(
    () => options.find((o) => o.value === current) ?? null,
    [options, current],
  );

  const flatEnabled = useMemo(
    () => options.filter((o) => !o.disabled),
    [options],
  );

  const grouped = useMemo(() => {
    const map = new Map<string | null, AdminSelectOption[]>();
    for (const opt of options) {
      const key = opt.group ?? null;
      const list = map.get(key) ?? [];
      list.push(opt);
      map.set(key, list);
    }
    return map;
  }, [options]);

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
      setOpen(false);
    },
    [isControlled, onChange],
  );

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
    const maxHeight = Math.min(256, preferBelow ? spaceBelow : spaceAbove);
    const top = preferBelow
      ? rect.bottom + gap
      : Math.max(12, rect.top - gap - maxHeight);
    setPos({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, maxHeight),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onReposition = () => updatePos();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = flatEnabled.findIndex((o) => o.value === current);
    setHighlight(idx >= 0 ? idx : 0);
    requestAnimationFrame(() => listRef.current?.focus());
  }, [open, current, flatEnabled]);

  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-opt-index="${highlight}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, flatEnabled.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = flatEnabled[highlight];
      if (opt) setValue(opt.value);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(flatEnabled.length - 1);
    }
  };

  let flatIndex = -1;

  const menu =
    open && mounted && pos
      ? createPortal(
          <div
            id={listboxId}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              highlight >= 0
                ? `${listboxId}-opt-${flatEnabled[highlight]?.value}`
                : undefined
            }
            onKeyDown={onListKey}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
            className="admin-select-menu z-[120] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1.5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.28)] ring-1 ring-black/5 outline-none"
          >
            {Array.from(grouped.entries()).map(([group, opts]) => (
              <div key={group ?? "__ungrouped"} role="group">
                {group ? (
                  <div className="admin-select-group sticky top-0 z-[1] bg-white/95 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 backdrop-blur-sm">
                    {groupLabels[group] ?? group}
                  </div>
                ) : null}
                {opts.map((opt) => {
                  if (!opt.disabled) flatIndex += 1;
                  const idx = opt.disabled ? -1 : flatIndex;
                  const isSelected = opt.value === current;
                  const isHi = idx === highlight;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      id={`${listboxId}-opt-${opt.value}`}
                      data-opt-index={idx}
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onMouseEnter={() => {
                        if (idx >= 0) setHighlight(idx);
                      }}
                      onClick={() => {
                        if (!opt.disabled) setValue(opt.value);
                      }}
                      className={`admin-select-option flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isHi
                          ? "admin-select-option-active"
                          : isSelected
                            ? "admin-select-option-selected"
                            : "admin-select-option-idle"
                      }`}
                    >
                      <span
                        className={`min-w-0 flex-1 truncate font-medium ${
                          isHi ? "admin-select-option-label-active" : ""
                        }`}
                        style={opt.style}
                      >
                        {opt.label}
                      </span>
                      {isSelected ? (
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isHi
                              ? "admin-select-check-active"
                              : "admin-select-check"
                          }`}
                          strokeWidth={2.75}
                        />
                      ) : (
                        <span className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {options.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-gray-400">
                Tidak ada opsi
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`admin-select relative ${className}`}>
      {name ? (
        <input type="hidden" name={name} value={current} required={required} />
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className={`admin-select-trigger group flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3.5 text-left text-sm outline-none transition-all ${
          open
            ? "border-gray-900 ring-2 ring-gray-900/15"
            : "border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span
          className={`min-w-0 flex-1 truncate font-semibold tracking-tight ${
            selected ? "text-gray-900" : "font-medium text-gray-400"
          }`}
          style={selected?.style}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${
            open ? "rotate-180 text-gray-700" : ""
          }`}
          strokeWidth={2.25}
        />
      </button>

      {menu}
    </div>
  );
}

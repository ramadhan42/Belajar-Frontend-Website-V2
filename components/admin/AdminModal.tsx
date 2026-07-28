"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type AdminModalProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  /** Extra classes for the animated panel wrapper */
  panelClassName?: string;
  /** Tailwind z-index class, default z-50 */
  zIndexClass?: string;
  /** Close when backdrop is clicked (default true) */
  closeOnBackdrop?: boolean;
};

const backdropTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };
const panelTransition = {
  type: "spring" as const,
  damping: 28,
  stiffness: 340,
  mass: 0.85,
};

export default function AdminModal({
  open,
  onClose,
  children,
  panelClassName = "max-w-lg",
  zIndexClass = "z-50",
  closeOnBackdrop = true,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}
          role="dialog"
          aria-modal="true"
        >
          <motion.button
            type="button"
            aria-label="Tutup modal"
            className="admin-modal-backdrop absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={() => {
              if (closeOnBackdrop) onClose?.();
            }}
          />
          <motion.div
            role="document"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={panelTransition}
            className={`relative z-10 w-full ${panelClassName}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

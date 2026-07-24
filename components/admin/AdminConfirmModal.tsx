"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import AdminModal from "./AdminModal";

type AdminConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** danger = red delete style (default) */
  variant?: "danger" | "default";
};

export default function AdminConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  loading = false,
  variant = "danger",
}: AdminConfirmModalProps) {
  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
      : "bg-gray-900 hover:bg-black text-white shadow-gray-900/20";

  return (
    <AdminModal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      zIndexClass="z-[90]"
      panelClassName="max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                variant === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-7">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirm()}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60 transition ${confirmClass}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

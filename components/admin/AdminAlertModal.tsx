"use client";

import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import AdminModal from "./AdminModal";

type AdminAlertModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonLabel?: string;
  loading?: boolean;
  variant?: "info" | "success" | "error";
};

export default function AdminAlertModal({
  open,
  onClose,
  title,
  message,
  buttonLabel = "Tutup",
  loading = false,
  variant = "info",
}: AdminAlertModalProps) {
  const palette =
    variant === "success"
      ? {
          icon: <CheckCircle2 size={22} />,
          iconWrap: "bg-emerald-50 text-emerald-600",
          button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
        }
      : variant === "error"
        ? {
            icon: <AlertCircle size={22} />,
            iconWrap: "bg-rose-50 text-rose-600",
            button: "bg-gray-900 hover:bg-black text-white shadow-gray-900/20",
          }
        : {
            icon: <Info size={22} />,
            iconWrap: "bg-blue-50 text-blue-600",
            button: "bg-gray-900 hover:bg-black text-white shadow-gray-900/20",
          };

  return (
    <AdminModal
      open={open}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      zIndexClass="z-[95]"
      panelClassName="max-w-md"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.iconWrap}`}
            >
              {palette.icon}
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-60 ${palette.button}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

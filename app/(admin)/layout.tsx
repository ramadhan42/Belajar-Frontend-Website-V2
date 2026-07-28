"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import SidebarAdmin from "@/components/admin/SidebarAdmin";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import {
  AdminThemeProvider,
  useAdminTheme,
} from "@/context/AdminThemeContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { theme, isDark, ready } = useAdminTheme();

  return (
    <div
      data-admin-theme={theme}
      className={`admin-shell min-h-screen flex ${
        ready ? "admin-theme-ready" : ""
      } ${
        isDark ? "dark bg-[#0b0d12] text-gray-100" : "bg-[#F8F9FA] text-gray-900"
      }`}
    >
      <SidebarAdmin />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userString =
      localStorage.getItem("user") || localStorage.getItem("auth_user");

    if (!token || !userString) {
      router.replace("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(userString);

      if (user.is_admin !== true) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_user");

        setModal({
          isOpen: true,
          message: t(
            "auth",
            "denied_message",
            "Akses ditolak! Anda tidak memiliki izin sebagai Administrator.",
            "Access denied! You do not have Administrator permission.",
          ),
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth_user", JSON.stringify(user));
      setIsAuthorized(true);
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
      router.replace("/admin-login");
    }
    // Only re-check on mount / router change; locale text for denied uses t at deny-time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleCloseModal = () => {
    setModal({ isOpen: false, message: "" });
    router.replace("/admin-login");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
        {!modal.isOpen && (
          <>
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">
              {t("auth", "verifying", "Memverifikasi akses...", "Verifying access...")}
            </p>
          </>
        )}

        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 admin-modal-backdrop bg-gray-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 fade-in duration-200">
              <div className="text-center mt-2">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-14 h-14 text-red-500" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t("auth", "denied_title", "Akses Dilarang", "Access Denied")}
                </h3>
                <p className="text-sm text-gray-600 mb-6">{modal.message}</p>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {t("auth", "back_login", "Kembali ke Login", "Back to Login")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdminThemeProvider>
  );
}

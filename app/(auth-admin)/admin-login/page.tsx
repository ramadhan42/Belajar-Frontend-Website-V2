"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. TAMBAHKAN IMPORT INI
import { SITE_STRINGS } from "@/components/constans/strings";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

export default function AdminLoginPage() {
  const router = useRouter(); // 2. INISIALISASI ROUTER
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk mengontrol Custom Modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL || BASE_URL}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: (e.target as any).email.value,
            password: (e.target as any).password.value,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.token) {
        if (data.user && data.user.is_admin === true) {
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("auth_user", JSON.stringify(data.user));

          setModal({
            isOpen: true,
            type: "success",
            message: "Login berhasil! Mengarahkan ke dashboard...",
          });

          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setModal({
            isOpen: true,
            type: "warning",
            message:
              "Akses Ditolak: Anda tidak memiliki izin sebagai Administrator.",
          });
        }
      } else {
        setModal({
          isOpen: true,
          type: "error",
          message:
            data.message ||
            "Login gagal, periksa kembali email dan password Anda.",
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Terjadi kesalahan koneksi ke server. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Masukkan kredensial Anda untuk mengakses dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white py-8 px-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-gray-100 transition-all">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all sm:text-sm"
                  placeholder="admin@evomi.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600 cursor-pointer"
                >
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="#"
                  className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Evomi. All rights reserved.
        </p>
      </div>

      {/* CUSTOM MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 fade-in duration-200">
            {/* Tombol Close (hanya muncul jika bukan sukses) */}
            {modal.type !== "success" && (
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center mt-2">
              {/* Ikon Dinamis */}
              <div className="flex justify-center mb-4">
                {modal.type === "success" && (
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
                )}
                {modal.type === "warning" && (
                  <AlertTriangle className="w-14 h-14 text-amber-500" />
                )}
                {modal.type === "error" && (
                  <XCircle className="w-14 h-14 text-red-500" />
                )}
              </div>

              {/* Judul & Pesan Dinamis */}
              <h3 className="text-lg font-bold text-gray-900 capitalize mb-2">
                {modal.type === "success"
                  ? "Berhasil!"
                  : modal.type === "warning"
                    ? "Akses Ditolak"
                    : "Gagal"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{modal.message}</p>

              {/* Tombol Mengerti (hanya muncul jika bukan sukses) */}
              {modal.type !== "success" && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Mengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

// Tipe data untuk konfigurasi status modal
interface ModalState {
  isOpen: boolean;
  type: "success" | "warning" | "error";
  title: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();

  // State untuk form login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk mengontrol custom modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    // Jika login sukses, arahkan rute setelah modal ditutup oleh user
    if (modal.type === "success") {
      router.push("/");
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      setIsLoading(false);
      setModal({
        isOpen: true,
        type: "warning",
        title: "Keamanan Lemah",
        message:
          "Password harus memiliki minimal 6 karakter demi keamanan akun Evomi Anda.",
      });
      return;
    }

    try {
      const res = await login(email, password);

      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      window.dispatchEvent(new Event("auth-change"));

      setModal({
        isOpen: true,
        type: "success",
        title: "Selamat Datang!",
        message:
          "Login berhasil. Selamat melanjutkan petualangan aroma Anda bersama Evomi.",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa kembali email dan password Anda.";
      setModal({
        isOpen: true,
        type: "error",
        title: "Akses Ditolak",
        message: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
          Masuk
        </h1>
        <p className="text-blue-100/80 font-light italic text-sm">
          Lanjutkan perjalanan Anda bersama Evomi
        </p>
      </div>

      {/* FORM LOGIN */}
      <form className="space-y-5 animate-fade-in" onSubmit={handleLoginSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-white/80 uppercase tracking-widest"
            >
              Password
            </label>
            {/* ROUTE KE HALAMAN RESET PASSWORD */}
            <Link
              href="/reset-password"
              className="text-[10px] text-white/60 hover:text-white uppercase tracking-wider transition-colors"
            >
              Lupa?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 pr-12 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-[#1172ba] font-bold py-4 rounded-2xl shadow-lg shadow-blue-950/10 hover:bg-blue-50 active:scale-[0.99] transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Memproses..." : "Masuk Sekarang"}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-white/70">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-white font-bold hover:underline underline-offset-4 tracking-wider"
          >
            DAFTAR
          </Link>
        </p>
      </div>

      {/* ================= CUSTOM MODAL COMPONENT ================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1172ba] border border-white/20 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl transition-all scale-100">
            {/* Bagian Icon Dinamis */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm">
              {modal.type === "success" && (
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {modal.type === "warning" && (
                <svg
                  className="h-8 w-8 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {modal.type === "error" && (
                <svg
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Teks Modal */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                {modal.title}
              </h3>
              <p className="text-sm text-blue-100/80 font-light leading-relaxed">
                {modal.message}
              </p>
            </div>

            {/* Tombol Aksi */}
            <button
              onClick={closeModal}
              className={`w-full font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md active:scale-[0.98] ${
                modal.type === "success"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : modal.type === "warning"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-white text-[#1172ba] hover:bg-blue-50"
              }`}
            >
              {modal.type === "success" ? "Lanjutkan" : "Mengerti"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

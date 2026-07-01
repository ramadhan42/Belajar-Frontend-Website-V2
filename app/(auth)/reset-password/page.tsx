"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

// Tipe data untuk konfigurasi status modal
interface ModalState {
  isOpen: boolean;
  type: "success" | "warning" | "error";
  title: string;
  message: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil token dan email dari URL (misal: /reset-password?token=xyz&email=user@example.com)
  const token = searchParams.get("token") || "";
  const urlEmail = searchParams.get("email") || "";

  // State untuk form reset password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Menjadikan parameter email dari URL sebagai nilai awal input email
  const [email, setEmail] = useState(urlEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // Jika berhasil mereset password, arahkan ke halaman login
    if (modal.type === "success") {
      router.push("/login");
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi 1: Minimal karakter password
    if (password.length < 6) {
      setIsLoading(false);
      setModal({
        isOpen: true,
        type: "warning",
        title: "Keamanan Lemah",
        message: "Password baru harus memiliki minimal 6 karakter demi keamanan akun Evomi Anda.",
      });
      return;
    }

    // Validasi 2: Kesamaan password konfirmasi
    if (password !== confirmPassword) {
      setIsLoading(false);
      setModal({
        isOpen: true,
        type: "warning",
        title: "Ketidakcocokan Data",
        message: "Konfirmasi password tidak cocok. Pastikan Anda mengetik ulang password dengan benar.",
      });
      return;
    }

    try {
      // TODO: Hubungkan dengan fungsi API reset password Anda
      // Gunakan state 'email' yang diinputkan user, bukan sekadar dari URL
      // const res = await resetPasswordApi({ token, email, password });
      
      // Simulasi delay pengerjaan API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setModal({
        isOpen: true,
        type: "success",
        title: "Password Diperbarui!",
        message: "Password akun Anda berhasil diubah. Silakan masuk menggunakan password baru Anda.",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Gagal mengatur ulang password. Tautan mungkin sudah kedaluwarsa.";
      setModal({
        isOpen: true,
        type: "error",
        title: "Gagal Memperbarui",
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
          Atur Ulang Password
        </h1>
        <p className="text-blue-100/80 font-light italic text-sm">
          Buat rahasia baru untuk melanjutkan petualangan bersama Evomi
        </p>
      </div>

      {/* FORM RESET PASSWORD */}
      <form className="space-y-5 animate-fade-in" onSubmit={handleResetSubmit}>
        
        {/* INPUT: PASSWORD BARU */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
          >
            Password Baru
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

        {/* INPUT: KONFIRMASI PASSWORD BARU */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
          >
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 pr-12 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* INPUT: KONFIRMASI EMAIL */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
          >
            Konfirmasi Email Anda
          </label>
          <input
            id="email"
            type="email"
            placeholder="Masukkan email terdaftar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
          />
        </div>

        {/* TOMBOL AKSI */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-[#1172ba] font-bold py-4 rounded-2xl shadow-lg shadow-blue-950/10 hover:bg-blue-50 active:scale-[0.99] transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
        </button>
      </form>

      {/* FOOTER */}
      <div className="text-center pt-2">
        <p className="text-sm text-white/70">
          Ingat password Anda?{" "}
          <Link
            href="/login"
            className="text-white font-bold hover:underline underline-offset-4 tracking-wider"
          >
            MASUK
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
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {modal.type === "warning" && (
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {modal.type === "error" && (
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              {modal.type === "success" ? "Ke Halaman Login" : "Mengerti"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper Suspense wajib digunakan di Next.js App Router saat komponen memakai useSearchParams()
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center text-white italic animate-pulse py-8">
        Memuat halaman pengaturan ulang...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
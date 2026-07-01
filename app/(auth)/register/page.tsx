"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await register(name, email, password);
      // Simpan token & user ke localStorage
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      // Beritahu Navbar (dan komponen lain) bahwa auth state berubah
      window.dispatchEvent(new Event("auth-change"));
      // Arahkan ke halaman utama setelah registrasi berhasil
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registrasi gagal. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
          Daftar
        </h1>
        <p className="text-blue-100/80 font-light italic text-sm">
          Gabung dan nikmati fitur lengkap kami
        </p>
      </div>

      {/* Pesan error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/40 rounded-2xl px-5 py-3 text-sm text-white text-center">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
            >
              Nama
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
            />
          </div>

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
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Tambahkan event handler di sini
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
                autoComplete="new-password"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 pr-12 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
              />

              {/* Ikon hanya akan muncul jika isFocused bernilai true */}
              {isFocused && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // Mencegah input kehilangan fokus saat tombol diklik
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-[#1172ba] font-bold py-4 rounded-2xl shadow-lg shadow-blue-950/10 hover:bg-blue-50 active:scale-[0.99] transition-all uppercase tracking-widest text-sm mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Memproses..." : "Buat Akun"}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-white/70">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-white font-bold hover:underline underline-offset-4 tracking-wider"
          >
            MASUK
          </Link>
        </p>
      </div>
    </div>
  );
}

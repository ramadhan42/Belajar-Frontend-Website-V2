'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      // Simpan token & user ke localStorage
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      // Beritahu Navbar (dan komponen lain) bahwa auth state berubah
      window.dispatchEvent(new Event('auth-change'));
      // Arahkan ke halaman utama setelah login berhasil
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
          Masuk
        </h1>
        <p className="text-blue-100/80 font-light italic text-sm">
          Lanjutkan perjalanan Anda bersama Evomi
        </p>
      </div>

      {/* Pesan error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/40 rounded-2xl px-5 py-3 text-sm text-white text-center">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
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
            <Link
              href="#"
              className="text-[10px] text-white/60 hover:text-white uppercase tracking-wider transition-colors"
            >
              Lupa?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-[#1172ba] font-bold py-4 rounded-2xl shadow-lg shadow-blue-950/10 hover:bg-blue-50 active:scale-[0.99] transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-white/70">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-white font-bold hover:underline underline-offset-4 tracking-wider"
          >
            DAFTAR
          </Link>
        </p>
      </div>
    </div>
  );
}

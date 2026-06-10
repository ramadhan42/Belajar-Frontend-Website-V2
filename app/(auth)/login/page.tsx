'use client';

import Link from 'next/link';

export default function LoginPage() {
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

      <form className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/80 uppercase tracking-widest ml-1">Email</label>
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-widest">Password</label>
            <Link href="#" className="text-[10px] text-white/60 hover:text-white uppercase tracking-wider transition-colors">
              Lupa?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all duration-200"
          />
        </div>

        <button className="w-full bg-white text-[#1172ba] font-bold py-4 rounded-2xl shadow-lg shadow-blue-950/10 hover:bg-blue-50 active:scale-[0.99] transition-all uppercase tracking-widest text-sm mt-4">
          Masuk Sekarang
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-white/70">
          Belum punya akun?{' '}
          <Link href="/register" className="text-white font-bold hover:underline underline-offset-4 tracking-wider">
            DAFTAR
          </Link>
        </p>
      </div>
    </div>
  );
}
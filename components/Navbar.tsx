import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#0071bc] text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Menu Kiri: Logo / Brand */}
      <div className="text-2xl font-bold tracking-wide">
        <Link href="/">Evomi</Link>
      </div>

      {/* Menu Tengah */}
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="bg-white text-[#0071bc] px-4 py-2 rounded-full font-semibold text-center hover:bg-opacity-90 transition-all"
        >
          Beranda
        </Link>
        <Link
          href="/tentang"
          className="hover:text-gray-200 font-medium transition-colors"
        >
          Tentang
        </Link>
        <Link
          href="/belanja"
          className="hover:text-gray-200 font-medium transition-colors"
        >
          Belanja
        </Link>
        <Link
          href="/kuis"
          className="hover:text-gray-200 font-medium transition-colors"
        >
          Kuis
        </Link>
      </div>

      {/* Menu Kanan */}
      <div className="flex items-center space-x-6">
        <Link
          href="/login"
          className="hover:text-gray-200 font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          href="/daftar"
          className="bg-white text-[#0071bc] px-5 py-2 rounded-full font-semibold text-center hover:bg-opacity-90 transition-all"
        >
          Daftar
        </Link>
      </div>
    </nav>
  );
}

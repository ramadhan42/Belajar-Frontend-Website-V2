import Link from "next/link";
import Image from "next/image"; // 1. Import komponen Image bawaan Next.js

export default function Navbar() {
  return (
    <nav className="bg-[#0071bc] text-white px-6 py-4 flex items-center justify-between shadow-md">
      
      {/* Menu Kiri: Logo / Brand diganti dengan Gambar */}
      <div className="mt-5 ml-5">
        <Link href="/">
          <Image
            src="/src/images/Group-navbar-logo.png" // Path otomatis membaca isi dalam folder public
            alt="Logo Evomi"
            width={120} // WAJIB GANTI: Isi dengan angka lebar asli gambar kamu (px)
            height={40} // WAJIB GANTI: Isi dengan angka tinggi asli gambar kamu (px)
            className="w-auto h-auto object-contain"
            priority // Agar logo di-load pertama kali tanpa delay
          />
        </Link>
      </div>

      {/* Menu Tengah */}
      <div className="flex items-center space-x-6 mt-5">
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
      <div className="flex items-center space-x-6 mt-5 mr-5">
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
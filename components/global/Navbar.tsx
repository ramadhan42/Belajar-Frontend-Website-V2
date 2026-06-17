"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { logout } from "@/lib/api";

// Tipe data untuk konfigurasi status modal navbar
interface NavModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { navbarColor } = useNavbarColor();
  const router = useRouter();

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // State untuk Custom Modal di Navbar
  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  // Sync auth state
  useEffect(() => {
    const readAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userRaw = localStorage.getItem("auth_user");
      if (token && userRaw) {
        try {
          const user = JSON.parse(userRaw);
          setUserEmail(user.email ?? null);
        } catch {
          setUserEmail(null);
        }
      } else {
        setUserEmail(null);
      }
    };

    readAuth();
    window.addEventListener("storage", readAuth);
    window.addEventListener("auth-change", readAuth);
    return () => {
      window.removeEventListener("storage", readAuth);
      window.removeEventListener("auth-change", readAuth);
    };
  }, []);

  // --- LOGIC CUSTOM MODAL NAVIGASI ---
  const handleNavAction = (e: React.MouseEvent, path: string, title: string, message: string) => {
    e.preventDefault(); // Mencegah routing instan bawaan <Link>
    setIsOpen(false); // Tutup menu mobile jika sedang terbuka

    // Munculkan modal transisi
    setNavModal({
      isOpen: true,
      type: "loading",
      title,
      message,
    });

    // Simulasi delay singkat agar animasi modal terlihat (800ms) lalu pindah rute
    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(path);
    }, 800);
  };

  // --- LOGIC CUSTOM MODAL LOGOUT ---
  const confirmLogout = () => {
    setIsOpen(false);
    setNavModal({
      isOpen: true,
      type: "confirm",
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari akun Evomi?",
      confirmText: "Ya, Keluar",
      onConfirm: async () => {
        // Ganti tampilan modal ke loading saat proses logout berjalan
        setNavModal({
          isOpen: true,
          type: "loading",
          title: "Memproses...",
          message: "Sedang mengeluarkan akun Anda...",
        });
        await performLogout();
      },
    });
  };

  const performLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await logout();
    } catch {
      // Lanjutkan logout lokal meski server error
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUserEmail(null);
      window.dispatchEvent(new Event("auth-change"));
      setIsLogoutLoading(false);
      
      // Tampilkan pesan sukses sebentar
      setNavModal({
        isOpen: true,
        type: "success",
        title: "Berhasil Keluar",
        message: "Sampai jumpa kembali di Evomi!",
      });

      setTimeout(() => {
        setNavModal((prev) => ({ ...prev, isOpen: false }));
        router.push("/");
      }, 1200);
    }
  };

  const navLinkClass =
    "flex justify-center items-center w-full md:w-[100px] text-[16px] py-2.5 font-bold rounded-full text-center text-white hover:bg-white hover:text-[var(--nav-color)] hover-bold-effect transition-colors duration-300";

  return (
    <div className="p-4 md:p-4 w-full relative z-50 md:mt-5">
      <nav
        className="text-white rounded-[25px] px-6 md:px-6 py-3 md:px-8 md:py-4 relative w-[100%] max-w-[1240px] mx-auto transition-colors duration-0"
        style={
          {
            backgroundColor: navbarColor,
            fontFamily: "Arial, Helvetica, sans-serif",
            "--nav-color": navbarColor,
          } as React.CSSProperties
        }
      >
        <style>{`
          .hover-bold-effect {
            transition: text-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, transform 0.2s ease-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
          }
          .hover-bold-effect:hover {
            text-shadow: 0.8px 0 0 currentColor; 
            transform: scale(0.95) translateY(2px);
          }
        `}</style>

        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="md:ml-2 flex-shrink-0 mb-1 md:mb-2.5">
            <Link 
              href="/"
              onClick={(e) => handleNavAction(e, "/", "Beranda Utama", "Mengarahkan ke halaman utama Evomi...")}
            >
              <Image
                src="/src/images/navbar/evomi-logo.png"
                alt="Logo Evomi"
                width={110}
                height={30}
                className="object-contain brightness-0 invert w-auto h-6 md:h-10"
                priority
              />
            </Link>
          </div>

          {/* DESKTOP VIEW: MENU TENGAH */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/" 
              onClick={(e) => handleNavAction(e, "/", "Beranda Utama", "Mengarahkan ke halaman utama Evomi...")}
              className={navLinkClass}
            >
              Beranda
            </Link>
            <Link 
              href="/#third-section" 
              onClick={(e) => handleNavAction(e, "/#third-section", "Tentang Evomi", "Mengarahkan ke informasi tentang Evomi...")}
              className={navLinkClass}
            >
              Tentang
            </Link>
            <Link
              href="/belanja"
              onClick={(e) => handleNavAction(e, "/belanja", "Katalog Produk", "Mengarahkan ke halaman belanja Evomi...")}
              className={navLinkClass}
            >
              Belanja
            </Link>
            <Link
              href="/kuis"
              onClick={(e) => handleNavAction(e, "/kuis", "Kuis Persona", "Mengarahkan ke halaman Kuis Karakteristik...")}
              className={navLinkClass}
            >
              Kuis
            </Link>
          </div>

          {/* DESKTOP VIEW: MENU KANAN */}
          <div className="hidden md:flex items-center space-x-3 md:mr-2">
            {userEmail ? (
              <>
                <Link
                  href="/profile"
                  onClick={(e) => handleNavAction(e, "/profile", "Profil Pengguna", "Membuka halaman profil Anda...")}
                  className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[18px] border border-white hover:bg-transparent hover:text-white transition-colors duration-300"
                  title={userEmail}
                >
                  {userEmail.charAt(0).toUpperCase()}
                </Link>

                <button
                  onClick={confirmLogout}
                  disabled={isLogoutLoading}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                    (e.currentTarget as HTMLButtonElement).style.color = `${navbarColor}99`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                  }}
                  className={`${navLinkClass} bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed`}
                  style={{ color: "white" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={(e) => handleNavAction(e, "/login", "Halaman Masuk", "Mengarahkan ke halaman masuk...")}
                  className={navLinkClass}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={(e) => handleNavAction(e, "/register", "Halaman Pendaftaran", "Mengarahkan ke halaman pendaftaran...")}
                  className={navLinkClass}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* MOBILE VIEW: HAMBURGER BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-2"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE VIEW: DROPDOWN MENU */}
        {isOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-full mt-3 px-6 py-5 flex flex-col space-y-2 shadow-xl rounded-2xl border z-40 transition-colors duration-0"
            style={{ backgroundColor: navbarColor, borderColor: `${navbarColor}99` }}
          >
            <Link 
              href="/" 
              onClick={(e) => handleNavAction(e, "/", "Beranda Utama", "Mengarahkan ke halaman utama Evomi...")} 
              className={navLinkClass}
            >
              Beranda
            </Link>
            <Link 
              href="/#third-section" 
              onClick={(e) => handleNavAction(e, "/#third-section", "Tentang Evomi", "Mengarahkan ke informasi tentang Evomi...")} 
              className={navLinkClass}
            >
              Tentang
            </Link>
            <Link
              href="/belanja"
              onClick={(e) => handleNavAction(e, "/belanja", "Katalog Produk", "Mengarahkan ke halaman belanja Evomi...")}
              className={navLinkClass}
            >
              Belanja
            </Link>
            <Link
              href="/kuis"
              onClick={(e) => handleNavAction(e, "/kuis", "Kuis Persona", "Mengarahkan ke halaman Kuis Karakteristik...")}
              className={navLinkClass}
            >
              Kuis
            </Link>

            <div className="my-3 transition-colors duration-300" style={{ borderTopColor: `${navbarColor}99`, borderTopWidth: "1px" }} />

            {userEmail ? (
              <div className="flex flex-col items-center space-y-3 w-full">
                <Link
                  href="/profile"
                  onClick={(e) => handleNavAction(e, "/profile", "Profil Pengguna", "Membuka halaman profil Anda...")}
                  className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[18px] border border-white hover:bg-transparent hover:text-white transition-colors duration-300"
                >
                  {userEmail.charAt(0).toUpperCase()}
                </Link>

                <button
                  onClick={confirmLogout}
                  className={`${navLinkClass} bg-white/15`}
                  style={{ color: "white" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={(e) => handleNavAction(e, "/login", "Halaman Masuk", "Mengarahkan ke halaman masuk...")} 
                  className={navLinkClass}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={(e) => handleNavAction(e, "/register", "Halaman Pendaftaran", "Mengarahkan ke halaman pendaftaran...")} 
                  className={navLinkClass}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ================= CUSTOM MODAL COMPONENT (Z-INDEX SUPER TINGGI) ================= */}
      {navModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1172ba] border border-white/20 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl transition-all scale-100">
            
            {/* Ikon Dinamis Berdasarkan Tipe Modal */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm">
              {navModal.type === 'confirm' && (
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {navModal.type === 'success' && (
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {navModal.type === 'loading' && (
                <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>

            {/* Teks Modal */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                {navModal.title}
              </h3>
              <p className="text-sm text-blue-100/80 font-light leading-relaxed">
                {navModal.message}
              </p>
            </div>

            {/* Tombol Aksi (Hanya muncul jika tipe modal adalah konfirmasi) */}
            {navModal.type === 'confirm' && (
              <div className="flex space-x-3 mt-4 pt-2">
                <button
                  onClick={() => setNavModal((prev) => ({ ...prev, isOpen: false }))}
                  className="w-full font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md active:scale-[0.98] bg-white/20 text-white hover:bg-white/30"
                >
                  Batal
                </button>
                <button
                  onClick={navModal.onConfirm}
                  className="w-full font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs shadow-md active:scale-[0.98] bg-red-500 text-white hover:bg-red-600"
                >
                  {navModal.confirmText}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
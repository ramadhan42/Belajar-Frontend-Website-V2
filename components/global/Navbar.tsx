"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { logout } from "@/lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { navbarColor } = useNavbarColor();
  const router = useRouter();

  // Auth state — dibaca dari localStorage agar reaktif terhadap login/logout
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // Sync auth state: saat mount dan saat storage berubah (tab lain / login/logout)
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
    // Custom event agar bisa trigger dari tab yang sama (setelah login/logout)
    window.addEventListener("auth-change", readAuth);
    return () => {
      window.removeEventListener("storage", readAuth);
      window.removeEventListener("auth-change", readAuth);
    };
  }, []);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await logout();
    } catch {
      // Lanjutkan logout lokal meski server error
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUserEmail(null);
      // Beritahu komponen lain di tab yang sama
      window.dispatchEvent(new Event("auth-change"));
      setIsOpen(false);
      setIsLogoutLoading(false);
      router.push("/");
    }
  };

  // Class seragam untuk semua menu agar memiliki efek hover pill (rounded-full, bg-white, text dinamis)
 // Class seragam untuk semua menu agar memiliki efek hover pill (rounded-full, bg-white, text dinamis)
  // Ditambahkan w-full md:w-[110px] dan flex justify-center agar lebarnya sama rata
  const navLinkClass = "flex justify-center items-center w-full md:w-[100px] text-[16px] py-2.5 font-bold rounded-full text-center text-white hover:bg-white hover:text-[var(--nav-color)] hover-bold-effect transition-colors duration-300";

  return (
    /* Wrapper luar untuk memberikan ruang agar rounded-full terlihat (efek floating) */
    <div className="p-4 md:p-4 w-full relative z-50 md:mt-5">
      <nav
        className="text-white rounded-[25px] px-6 md:px-6 py-3 md:px-8 md:py-4 relative w-[100%] max-w-[1240px] mx-auto transition-colors duration-0"
        style={{ 
          backgroundColor: navbarColor, 
          fontFamily: "Arial, Helvetica, sans-serif",
          "--nav-color": navbarColor // Deklarasi variabel CSS dinamis untuk Tailwind hover
        } as React.CSSProperties}
      >
        {/* --- CSS ANIMASI HOVER BOLD & PRESSED BUTTON --- */}
        <style>{`
          .hover-bold-effect {
            transition: text-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out, transform 0.2s ease-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
          }
          .hover-bold-effect:hover {
            text-shadow: 0.8px 0 0 currentColor; 
            transform: scale(0.95) translateY(2px);
          }
        `}</style>

        {/* Kontainer Utama Navigasi */}
        <div className="flex items-center justify-between">
          {/* Menu Kiri: Logo */}
          <div className="md:ml-2 flex-shrink-0 mb-1 md:mb-2.5">
            <Link href="/">
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

          {/* --- DESKTOP VIEW: MENU TENGAH --- */}
          {/* Jarak diubah menjadi space-x-2 karena item sudah memiliki padding horizontal (px-5) */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Beranda
            </Link>

            <Link href="/#third-section" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Tentang
            </Link>

            <Link href="/halaman/belanja" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Belanja
            </Link>

            <Link href="/halaman/kuis" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Kuis
            </Link>
          </div>

          {/* --- DESKTOP VIEW: MENU KANAN --- */}
          <div className="hidden md:flex items-center space-x-2 md:mr-2">
            {userEmail ? (
              <>
                {/* Email user — truncate jika panjang */}
                <span
                  className="max-w-[160px] truncate text-[14px] font-semibold text-white/90 px-3 py-2"
                  title={userEmail}
                >
                  {userEmail}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1172BA";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                  }}
                  className={`${navLinkClass} bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed`}
                  style={{ color: "white" }}
                >
                  {isLogoutLoading ? "Keluar..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={navLinkClass}>
                  Login
                </Link>

                <Link href="/register" className={navLinkClass}>
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* --- MOBILE VIEW: HAMBURGER BUTTON --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-2"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                // Icon Cross (X) saat menu terbuka
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icon Hamburger Menu (≡) saat menu tertutup
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* --- MOBILE VIEW: DROPDOWN MENU --- */}
        {isOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-full mt-3 px-6 py-5 flex flex-col space-y-2 shadow-xl rounded-2xl border z-40 transition-colors duration-0"
            style={{ backgroundColor: navbarColor, borderColor: `${navbarColor}99` }}
          >
            <Link href="/" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Beranda
            </Link>
            <Link href="/#third-section" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Tentang
            </Link>
            <Link href="/halaman/belanja" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Belanja
            </Link>
            <Link href="/halaman/kuis" onClick={() => setIsOpen(false)} className={navLinkClass}>
              Kuis
            </Link>

            {/* Garis Pembatas Tipis */}
            <div
              className="my-3 transition-colors duration-300"
              style={{ borderTopColor: `${navbarColor}99`, borderTopWidth: "1px" }}
            />

            {userEmail ? (
              <>
                {/* Email user di mobile */}
                <span className="text-center text-[14px] font-semibold text-white/80 py-2 truncate">
                  {userEmail}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1172BA";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                  }}
                  className={`${navLinkClass} bg-white/15 disabled:opacity-60`}
                  style={{ color: "white" }}
                >
                  {isLogoutLoading ? "Keluar..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className={navLinkClass}>
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className={navLinkClass}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
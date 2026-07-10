"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { logout } from "@/lib/api";
import { motion, AnimatePresence, useInView } from "framer-motion";

import { SITE_STRINGS } from "@/components/constans/strings";

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
  const pathname = usePathname();

  // STATE UNTUK BADGE MERAH
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email) {
          const res = await fetch(
            `${SITE_STRINGS.base_url.url_backend}/api/contact/unread-count?email=${user.email}`,
          );
          const data = await res.json();
          if (data.success) {
            setUnreadCount(data.count);
          }
        }
      }
    } catch (error) {
      console.error("Gagal load unread badge di Navbar:", error);
    }
  };

  useEffect(() => {
    // Jalankan saat Navbar pertama dimuat
    fetchUnreadCount();

    // Polling setiap 5 detik agar Navbar selalu up-to-date
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    // Menangkap sinyal "messages_read" yang dikirim oleh ChatPage
    // agar angka merah langsung hilang saat chat dibuka
    window.addEventListener("messages_read", fetchUnreadCount);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("messages_read", fetchUnreadCount);
    };
  }, [pathname]); // Akan mengecek ulang setiap kali user pindah halaman

  // Helper: cek apakah menu aktif berdasarkan path
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/beranda";
    return pathname.startsWith(path);
  };

  // PERUBAHAN UTAMA 1:
  // Menggunakan width (md:w-[110px]) dan height (md:h-[44px]) tetap
  // Menghapus padding md:px-6 agar kotak hover besarnya seragam di semua menu
  const navItemClass = (path: string) =>
    `flex justify-center items-center w-full py-2.5 md:py-0 md:w-[110px] md:h-[44px] text-[12px] md:text-[17px] font-normal rounded-full text-center hover-bold-effect transition-colors duration-300 ${
      isActive(path)
        ? "bg-white text-[var(--nav-color)]"
        : "text-white hover:bg-white hover:text-[var(--nav-color)]"
    }`;

  // Detect apakah navbar dalam view
  const navRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(navRef, { margin: "0px 0px -20px 0px" });

  // Warna navbar selalu dari context (default #1172BA)
  const finalBg = navbarColor;

  // Stagger variants — re-trigger tiap isInView berubah
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const [navModal, setNavModal] = useState<NavModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

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

  const handleNavAction = (
    e: React.MouseEvent,
    path: string,
    title: string,
    message: string,
  ) => {
    e.preventDefault();

    // Cek apakah posisi user sudah berada persis di path yang dituju untuk mencegah duplikasi
    if (window.location.pathname + window.location.hash === path) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setNavModal({ isOpen: true, type: "loading", title, message });
    setTimeout(() => {
      setNavModal((prev) => ({ ...prev, isOpen: false }));
      router.push(path);
    }, 800);
  };

  const confirmLogout = () => {
    setIsOpen(false);
    setNavModal({
      isOpen: true,
      type: "confirm",
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari akun Evomi?",
      confirmText: "Ya, Keluar",
      onConfirm: async () => {
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
      // lanjut logout lokal
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUserEmail(null);
      window.dispatchEvent(new Event("auth-change"));
      setIsLogoutLoading(false);
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

  // PERUBAHAN UTAMA 2:
  // Class untuk menu Login dan Register dibuat identik dengan navItemClass 
  // menggunakan md:w-[110px] dan md:h-[44px]
  const navLinkClass =
    "flex justify-center items-center w-full py-2.5 md:py-0 md:w-[110px] md:h-[44px] text-[12px] md:text-[17px] font-normal rounded-full text-center text-white hover:bg-white hover:text-[var(--nav-color)] hover-bold-effect transition-colors duration-300";

  return (
    <>
      <motion.div
        ref={navRef}
        className="px-2 py-2 md:p-4 md:pt-7 md:px-15 w-full relative z-50"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <nav
          className="text-white rounded-[18px] md:rounded-[25px] px-3 py-2 md:px-8 md:py-3 relative w-[100%] max-w-[4200px] mx-auto"
          style={
            {
              backgroundColor: finalBg,
              transition: "background-color 0.6s ease",
              fontFamily: "Arial, Helvetica, sans-serif",
              "--nav-color": finalBg,
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
            <motion.div
              variants={itemVariants}
              className="md:ml-2 flex-shrink-0"
            >
              <Link
                href="/"
                onClick={(e) =>
                  handleNavAction(
                    e,
                    "/",
                    "Beranda Utama",
                    "Mengarahkan ke halaman utama Evomi...",
                  )
                }
              >
                <Image
                  src="/src/images/navbar/evomi-logo.png"
                  alt="Logo Evomi"
                  width={110}
                  height={30}
                  className="object-contain brightness-0 invert w-auto h-5 md:h-10 -translate-y-1"
                  priority
                />
              </Link>
            </motion.div>

            {/* DESKTOP: MENU TENGAH */}
            {/* Menggunakan space-x-1 agar rapih berdampingan */}
            <div className="hidden md:flex items-center space-x-1">
              <motion.div variants={itemVariants}>
                <Link
                  href="/"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/",
                      "Beranda Utama",
                      "Mengarahkan ke halaman utama Evomi...",
                    )
                  }
                  className={navItemClass("/")}
                >
                  Beranda
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/#third-section"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/#third-section",
                      "Tentang Evomi",
                      "Mengarahkan ke informasi tentang Evomi...",
                    )
                  }
                  className={navItemClass("/#third-section")}
                >
                  Tentang
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/belanja"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/belanja",
                      "Katalog Produk",
                      "Mengarahkan ke halaman belanja Evomi...",
                    )
                  }
                  className={navItemClass("/belanja")}
                >
                  Belanja
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/kuis"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/kuis",
                      "Kuis Persona",
                      "Mengarahkan ke halaman Kuis Karakteristik...",
                    )
                  }
                  className={navItemClass("/kuis")}
                >
                  Kuis
                </Link>
              </motion.div>
            </div>

            {/* DESKTOP: MENU KANAN */}
            <div className="hidden md:flex items-center space-x-1 md:mr-2">
              {userEmail ? (
                <>
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/profile"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile",
                          "Profil Pengguna",
                          "Membuka halaman profil Anda...",
                        )
                      }
                      className="relative flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[18px] border border-white hover:bg-transparent hover:text-white transition-colors duration-300"
                      title={userEmail}
                    >
                      {userEmail.charAt(0).toUpperCase()}

                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-black shadow-sm animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={confirmLogout}
                      disabled={isLogoutLoading}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                        (e.currentTarget as HTMLButtonElement).style.color = `${finalBg}99`;
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
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/login"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/login",
                          "Halaman Masuk",
                          "Mengarahkan ke halaman masuk...",
                        )
                      }
                      className={navLinkClass}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/register"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/register",
                          "Halaman Pendaftaran",
                          "Mengarahkan ke halaman pendaftaran...",
                        )
                      }
                      className={navLinkClass}
                    >
                      Daftar
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* MOBILE: HAMBURGER */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white focus:outline-none p-1.5"
              >
                {isOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* MOBILE: DROPDOWN */}
          {isOpen && (
            <div
              className="md:hidden absolute left-0 right-0 top-full mt-2 px-4 py-3 flex flex-col space-y-1 shadow-xl rounded-[18px] border z-40"
              style={{ backgroundColor: finalBg, borderColor: `${finalBg}99` }}
            >
              <Link
                href="/"
                onClick={(e) =>
                  handleNavAction(
                    e,
                    "/",
                    "Beranda Utama",
                    "Mengarahkan ke halaman utama Evomi...",
                  )
                }
                className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
              >
                Beranda
              </Link>
              <Link
                href="/#third-section"
                onClick={(e) =>
                  handleNavAction(
                    e,
                    "/#third-section",
                    "Tentang Evomi",
                    "Mengarahkan ke informasi tentang Evomi...",
                  )
                }
                className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
              >
                Tentang
              </Link>
              <Link
                href="/belanja"
                onClick={(e) =>
                  handleNavAction(
                    e,
                    "/belanja",
                    "Katalog Produk",
                    "Mengarahkan ke halaman belanja Evomi...",
                  )
                }
                className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
              >
                Belanja
              </Link>
              <Link
                href="/kuis"
                onClick={(e) =>
                  handleNavAction(
                    e,
                    "/kuis",
                    "Kuis Persona",
                    "Mengarahkan ke halaman Kuis Karakteristik...",
                  )
                }
                className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
              >
                Kuis
              </Link>
              <div
                className="my-1.5"
                style={{
                  borderTopColor: `${finalBg}99`,
                  borderTopWidth: "1px",
                }}
              />
              {userEmail ? (
                <div className="flex flex-col items-left space-y-4 w-full">
                  <Link
                    href="/profile"
                    onClick={(e) =>
                      handleNavAction(
                        e,
                        "/profile",
                        "Profil Pengguna",
                        "Membuka halaman profil Anda...",
                      )
                    }
                    className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[12px] border border-white hover:bg-transparent hover:text-white transition-colors duration-300"
                  >
                    {userEmail.charAt(0).toUpperCase()}
                  </Link>
                  <button
                    onClick={confirmLogout}
                    className="flex items-center justify-center w-full text-[12px] py-2 px-3 font-bold rounded-full bg-white/15 text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={(e) =>
                      handleNavAction(
                        e,
                        "/login",
                        "Halaman Masuk",
                        "Mengarahkan ke halaman masuk...",
                      )
                    }
                    className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={(e) =>
                      handleNavAction(
                        e,
                        "/register",
                        "Halaman Pendaftaran",
                        "Mengarahkan ke halaman pendaftaran...",
                      )
                    }
                    className="flex items-center w-full text-[12px] py-2 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)] transition-colors duration-200"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </motion.div>

      {/* CUSTOM MODAL */}
      <AnimatePresence>
        {navModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (navModal.type === "confirm")
                setNavModal((prev) => ({ ...prev, isOpen: false }));
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-8 max-w-[280px] md:max-w-[340px] w-full text-center shadow-2xl overflow-hidden"
            >
              <div
                className={`mx-auto flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full mb-3 md:mb-5 transition-colors duration-300
                ${navModal.type === "success" ? "bg-green-50 text-green-500" : ""}
                ${navModal.type === "confirm" ? "bg-amber-50 text-amber-500" : ""}
                ${navModal.type === "loading" ? "bg-blue-50 text-blue-500" : ""}
              `}
              >
                {navModal.type === "confirm" && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="h-7 w-7 md:h-10 md:w-10 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </motion.svg>
                )}
                {navModal.type === "success" && (
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-7 w-7 md:h-10 md:w-10 text-green-500"
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
                  </motion.svg>
                )}
                {navModal.type === "loading" && (
                  <svg
                    className="h-7 w-7 md:h-10 md:w-10 animate-spin text-[#1172BA]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>

              <div className="space-y-1.5 md:space-y-3">
                <h3 className="text-[16px] md:text-[20px] font-bold text-gray-800 tracking-wide">
                  {navModal.title}
                </h3>
                <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed px-1">
                  {navModal.message}
                </p>
              </div>

              {navModal.type === "confirm" && (
                <div className="flex space-x-2 md:space-x-3 mt-4 md:mt-6">
                  <button
                    onClick={() =>
                      setNavModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="w-full font-bold py-2 md:py-3 rounded-xl text-[11px] md:text-[12px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={navModal.onConfirm}
                    className="w-full font-bold py-2 md:py-3 rounded-xl text-[11px] md:text-[12px] bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    {navModal.confirmText}
                  </button>
                </div>
              )}
              {navModal.type === "success" && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 1.2, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-[4px] bg-green-500"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import {
  logout,
  getCartItems,
  getWishlistItems,
  getShoppingHistory,
} from "@/lib/api";
import { motion, AnimatePresence, useInView } from "framer-motion";

import { SITE_STRINGS } from "@/components/constans/strings";
import { useCms } from "@/context/CmsContext";

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
  const { tNav } = useCms();
  const router = useRouter();
  const pathname = usePathname();

  // STATE UNTUK BADGE UNREAD + MENU AKUN
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const formatBadge = (count: number) => (count > 99 ? "99+" : count);

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

  const fetchMenuCounts = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setCartCount(0);
      setHistoryCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const [cart, history, wishlist] = await Promise.all([
        getCartItems().catch(() => []),
        getShoppingHistory().catch(() => []),
        getWishlistItems().catch(() => []),
      ]);

      setCartCount(Array.isArray(cart) ? cart.length : 0);
      setHistoryCount(Array.isArray(history) ? history.length : 0);
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    } catch (error) {
      console.error("Gagal load badge menu akun di Navbar:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    fetchMenuCounts();

    const intervalId = setInterval(() => {
      fetchUnreadCount();
      fetchMenuCounts();
    }, 5000);

    window.addEventListener("messages_read", fetchUnreadCount);
    window.addEventListener("cart_updated", fetchMenuCounts);
    window.addEventListener("wishlist_updated", fetchMenuCounts);
    window.addEventListener("history_updated", fetchMenuCounts);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("messages_read", fetchUnreadCount);
      window.removeEventListener("cart_updated", fetchMenuCounts);
      window.removeEventListener("wishlist_updated", fetchMenuCounts);
      window.removeEventListener("history_updated", fetchMenuCounts);
    };
  }, [pathname, fetchMenuCounts]);

  // Helper: cek apakah menu aktif berdasarkan path
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/beranda";
    return pathname.startsWith(path);
  };

  // Class menu: aktif = bg-white teks warna navbar, tidak aktif = teks putih + hover soft
  const navItemClass = (path: string) =>
    `nav-pill flex justify-center items-center w-full md:w-auto md:px-6 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center ${
      isActive(path)
        ? "is-active bg-white text-[var(--nav-color)] shadow-sm"
        : "text-white hover:bg-white/95 hover:text-[var(--nav-color)] hover:shadow-sm"
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
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  };

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
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
          setUserName(user.name ?? null);
          const avatar = user.avatar_profile;
          if (avatar) {
            setUserAvatar(
              avatar.startsWith("http")
                ? avatar
                : `${SITE_STRINGS.base_url.url_backend}/storage/${avatar}`,
            );
          } else {
            setUserAvatar(null);
          }
        } catch {
          setUserEmail(null);
          setUserAvatar(null);
          setUserName(null);
        }
      } else {
        setUserEmail(null);
        setUserAvatar(null);
        setUserName(null);
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
      setUserAvatar(null);
      setUserName(null);
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

  const navLinkClass =
    "nav-pill flex justify-center items-center w-full md:w-auto md:px-6 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center text-white hover:bg-white/95 hover:text-[var(--nav-color)] hover:shadow-sm";

  const userInitial = (userName || userEmail || "?").charAt(0).toUpperCase();

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
              "--nav-color": finalBg,
            } as React.CSSProperties
          }
        >
          <style>{`
            .nav-pill {
              transition:
                background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
              will-change: transform;
            }
            .nav-pill:hover {
              transform: translateY(-1px);
            }
            .nav-pill:active {
              transform: translateY(0) scale(0.98);
              transition-duration: 0.15s;
            }
            .nav-pill.is-active:hover {
              transform: none;
            }
            .nav-avatar {
              transition:
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              will-change: transform;
            }
            .nav-avatar:hover {
              transform: translateY(-2px) scale(1.06);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
              background-color: #ffffff;
              color: var(--nav-color);
              border-color: rgba(255, 255, 255, 0.95);
            }
            .nav-avatar:active {
              transform: translateY(0) scale(0.97);
              transition-duration: 0.15s;
            }
            .nav-avatar-ring {
              position: absolute;
              inset: -3px;
              border-radius: 9999px;
              border: 1.5px solid rgba(255, 255, 255, 0.35);
              opacity: 0;
              transform: scale(0.92);
              transition:
                opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              pointer-events: none;
            }
            .nav-avatar:hover .nav-avatar-ring {
              opacity: 1;
              transform: scale(1);
            }
            .nav-avatar-wrap {
              position: relative;
            }
            .nav-avatar-tooltip {
              position: absolute;
              top: calc(100% + 14px);
              right: 0;
              min-width: 240px;
              max-width: 300px;
              padding: 12px 14px;
              border-radius: 16px;
              background: #ffffff;
              color: #111827;
              box-shadow:
                0 12px 28px rgba(0, 0, 0, 0.16),
                0 0 0 1px rgba(17, 24, 39, 0.06);
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              transform: translateY(-8px) scale(0.96);
              transform-origin: top right;
              transition:
                opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                visibility 0.28s;
              z-index: 70;
            }
            .nav-avatar-tooltip::before {
              content: "";
              position: absolute;
              top: -6px;
              right: 16px;
              width: 12px;
              height: 12px;
              background: #ffffff;
              transform: rotate(45deg);
              box-shadow: -1px -1px 0 rgba(17, 24, 39, 0.06);
            }
            .nav-avatar-wrap:hover .nav-avatar-tooltip {
              opacity: 1;
              visibility: visible;
              transform: translateY(0) scale(1);
            }
            .nav-avatar-wrap:has(.nav-unread-badge:hover) .nav-avatar-tooltip {
              opacity: 0;
              visibility: hidden;
              transform: translateY(-8px) scale(0.96);
            }
            .nav-unread-badge {
              position: absolute;
              top: -4px;
              right: -4px;
              z-index: 2;
            }
            .nav-unread-tip {
              position: absolute;
              bottom: calc(100% + 10px);
              left: 50%;
              transform: translateX(-50%) translateY(4px) scale(0.96);
              white-space: nowrap;
              padding: 7px 10px;
              border-radius: 10px;
              background: #111827;
              color: #ffffff;
              font-size: 11px;
              font-weight: 600;
              line-height: 1.2;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              transition:
                opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                visibility 0.25s;
              z-index: 80;
            }
            .nav-unread-tip::after {
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              margin-left: -5px;
              border: 5px solid transparent;
              border-top-color: #111827;
            }
            .nav-unread-badge:hover .nav-unread-tip {
              opacity: 1;
              visibility: visible;
              transform: translateX(-50%) translateY(0) scale(1);
            }
            .nav-mobile-link {
              transition:
                background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                padding-left 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-mobile-link:hover {
              transform: translateX(2px);
            }
            .nav-logout {
              position: relative;
              overflow: hidden;
              background-color: rgba(255, 255, 255, 0.14);
              color: #ffffff !important;
              border: 1.5px solid rgba(255, 255, 255, 0.28);
              box-shadow: none;
              transition:
                background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              will-change: transform;
            }
            .nav-logout span,
            .nav-logout .nav-logout-icon {
              color: inherit !important;
              stroke: currentColor;
              transition:
                color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                stroke 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-logout:hover {
              background-color: #ffffff !important;
              color: var(--nav-color, #1172BA) !important;
              border-color: #ffffff;
              box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
              transform: translateY(-2px);
            }
            .nav-logout:hover span,
            .nav-logout:hover .nav-logout-icon {
              color: var(--nav-color, #1172BA) !important;
              stroke: var(--nav-color, #1172BA) !important;
            }
            .nav-logout:active {
              transform: translateY(0) scale(0.97);
              transition-duration: 0.15s;
            }
            .nav-logout:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
            .nav-logout:hover .nav-logout-icon {
              transform: translateX(2px);
            }
          `}</style>

          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              variants={itemVariants}
              className="md:ml-2 flex-shrink-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                  {tNav("beranda", "Beranda")}
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
                  {tNav("tentang", "Tentang")}
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
                  {tNav("belanja", "Belanja")}
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
                  {tNav("kuis", "Kuis")}
                </Link>
              </motion.div>
            </div>

            {/* DESKTOP: MENU KANAN */}
            <div className="hidden md:flex items-center space-x-2 md:mr-2">
              {userEmail ? (
                <>
                  <motion.div variants={itemVariants} className="nav-avatar-wrap">
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
                      className="nav-avatar relative flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[17px] border-2 border-white/90 shadow-sm"
                      aria-label="Buka profil"
                    >
                      <span className="nav-avatar-ring" aria-hidden />
                      <span className="relative z-[1] h-full w-full rounded-full overflow-hidden flex items-center justify-center">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="select-none tracking-tight">
                            {userInitial}
                          </span>
                        )}
                      </span>


                      {unreadCount > 0 && (
                        <span
                          className="nav-unread-badge flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold shadow-md ring-2 ring-white"
                          aria-label={`${unreadCount} pesan belum dibaca`}
                        >
                          {formatBadge(unreadCount)}
                          <span className="nav-unread-tip" role="tooltip">
                            {formatBadge(unreadCount)} pesan belum dibaca
                          </span>
                        </span>
                      )}
                    </Link>

                    <div className="nav-avatar-tooltip" role="tooltip">
                      <div className="relative z-[1] space-y-2.5 text-left">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nav-color)] text-white text-sm font-bold overflow-hidden">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-gray-900 leading-tight">
                              Akun Saya
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                Pesan belum dibaca
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {unreadCount > 0
                                  ? "Ada balasan baru dari admin"
                                  : "Tidak ada pesan baru"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${
                                unreadCount > 0
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {formatBadge(unreadCount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                Keranjang belanja
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {cartCount > 0
                                  ? "Produk siap checkout"
                                  : "Keranjang masih kosong"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${
                                cartCount > 0
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {formatBadge(cartCount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                Riwayat belanja
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {historyCount > 0
                                  ? "Pesanan yang pernah dibuat"
                                  : "Belum ada riwayat"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${
                                historyCount > 0
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {formatBadge(historyCount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                Wishlist
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {wishlistCount > 0
                                  ? "Produk yang disimpan"
                                  : "Wishlist masih kosong"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${
                                wishlistCount > 0
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {formatBadge(wishlistCount)}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-400">
                          Klik untuk membuka profil
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={confirmLogout}
                      disabled={isLogoutLoading}
                      className="nav-logout flex items-center justify-center gap-2 w-full md:w-auto md:px-6 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center"
                      style={
                        {
                          "--nav-color": finalBg || "#1172BA",
                        } as React.CSSProperties
                      }
                    >
                      <span>{tNav("logout", "Logout")}</span>
                      <svg
                        className="nav-logout-icon w-3.5 h-3.5 md:w-4 md:h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
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
                      {tNav("login", "Login")}
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
                      {tNav("register", "Daftar")}
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* MOBILE: HAMBURGER */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white focus:outline-none p-1.5 rounded-full transition-transform duration-300 ease-out hover:bg-white/10 active:scale-95"
                aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                </motion.div>
              </button>
            </div>
          </div>

          {/* MOBILE: DROPDOWN */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="mobile-menu"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="md:hidden absolute left-0 right-0 top-full mt-2 px-4 py-3 flex flex-col space-y-1 shadow-xl rounded-[18px] border z-40 origin-top"
                style={{
                  backgroundColor: finalBg,
                  borderColor: `${finalBg}99`,
                }}
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
                  className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                >
                  {tNav("beranda", "Beranda")}
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
                  className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                >
                  {tNav("tentang", "Tentang")}
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
                  className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                >
                  {tNav("belanja", "Belanja")}
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
                  className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                >
                  {tNav("kuis", "Kuis")}
                </Link>
                <div
                  className="my-1.5"
                  style={{
                    borderTopColor: `${finalBg}99`,
                    borderTopWidth: "1px",
                  }}
                />
                {userEmail ? (
                  <div className="flex flex-col items-stretch gap-3 w-full pt-1">
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
                      className="group flex items-center gap-3 w-full rounded-2xl px-2 py-2 transition-colors duration-300 ease-out hover:bg-white/10"
                    >
                      <span className="relative flex items-center justify-center w-[40px] h-[40px] shrink-0 rounded-full bg-white text-[var(--nav-color)] font-bold text-[14px] border-2 border-white/90 shadow-sm overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-md">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold shadow-md ring-2 ring-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="flex flex-col min-w-0 text-left">
                        <span className="text-[12px] font-bold text-white truncate">
                          Akun Saya
                        </span>
                        <span className="text-[10px] text-white/70 truncate">
                          {userEmail}
                        </span>
                      </span>
                    </Link>
                    <button
                      onClick={confirmLogout}
                      className="nav-logout flex items-center justify-center gap-2 w-full text-[12px] py-2.5 px-3 font-bold rounded-full"
                      style={
                        {
                          "--nav-color": finalBg || "#1172BA",
                        } as React.CSSProperties
                      }
                    >
                      <span>{tNav("logout", "Logout")}</span>
                      <svg
                        className="nav-logout-icon w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
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
                      className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      {tNav("login", "Login")}
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
                      className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      {tNav("register", "Daftar")}
                    </Link>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
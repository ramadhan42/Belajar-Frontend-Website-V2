"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { logout } from "@/lib/api";
import { motion, AnimatePresence, useInView } from "framer-motion";

import { SITE_STRINGS } from "@/components/constans/strings";
import { useCms } from "@/context/CmsContext";
import LanguageSwitcher from "@/components/global/LanguageSwitcher";
import { useLocale } from "@/context/LocaleContext";
import { useBadgeCounts } from "@/context/BadgeCountsContext";
import { L } from "@/lib/localeText";

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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { navbarColor } = useNavbarColor();
  const { tNav, tUi } = useCms();
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const {
    unread: unreadCount,
    cart: cartCount,
    history: historyCount,
    wishlist: wishlistCount,
  } = useBadgeCounts();

  const en = locale === "en";
  const account = useMemo(
    () => ({
      myAccount: tUi(
        "account",
        "my_account",
        en ? "My Account" : "Akun Saya",
      ),
      menuLabel: tUi(
        "account",
        "menu_label",
        en ? "Account menu" : "Menu akun",
      ),
      profile: tUi(
        "account",
        "profile",
        en ? "Profile Settings" : "Pengaturan Profil",
      ),
      profileDesc: tUi(
        "account",
        "profile_desc",
        en ? "Account data & settings" : "Data akun & pengaturan",
      ),
      profileTitle: tUi(
        "account",
        "profile_title",
        en ? "User Profile" : "Profil Pengguna",
      ),
      profileLoading: tUi(
        "account",
        "profile_loading",
        en ? "Opening your profile..." : "Membuka halaman profil Anda...",
      ),
      messages: tUi(
        "account",
        "messages",
        en ? "Unread messages" : "Pesan belum dibaca",
      ),
      messagesShort: tUi("account", "messages_short", en ? "Messages" : "Pesan"),
      messagesTitle: tUi(
        "account",
        "messages_title",
        en ? "Your Messages" : "Pesan Anda",
      ),
      messagesLoading: tUi(
        "account",
        "messages_loading",
        en ? "Opening your inbox..." : "Membuka kotak pesan...",
      ),
      messagesNew: tUi(
        "account",
        "messages_new",
        en ? "New reply from admin" : "Ada balasan baru dari admin",
      ),
      messagesEmpty: tUi(
        "account",
        "messages_empty",
        en ? "No new messages" : "Tidak ada pesan baru",
      ),
      unreadTip: tUi(
        "account",
        "unread_tip",
        en ? "unread messages" : "pesan belum dibaca",
      ),
      cart: tUi(
        "account",
        "cart",
        en ? "Shopping cart" : "Keranjang belanja",
      ),
      cartShort: tUi("account", "cart_short", en ? "Cart" : "Keranjang"),
      cartTitle: tUi(
        "account",
        "cart_title",
        en ? "Shopping Cart" : "Keranjang Belanja",
      ),
      cartLoading: tUi(
        "account",
        "cart_loading",
        en ? "Opening shopping cart..." : "Membuka keranjang belanja...",
      ),
      cartReady: tUi(
        "account",
        "cart_ready",
        en ? "Ready to checkout" : "Produk siap checkout",
      ),
      cartEmpty: tUi(
        "account",
        "cart_empty",
        en ? "Cart is empty" : "Keranjang masih kosong",
      ),
      history: tUi(
        "account",
        "history",
        en ? "Order history" : "Riwayat belanja",
      ),
      historyShort: tUi(
        "account",
        "history_short",
        en ? "History" : "Riwayat",
      ),
      historyTitle: tUi(
        "account",
        "history_title",
        en ? "Order History" : "Riwayat Belanja",
      ),
      historyLoading: tUi(
        "account",
        "history_loading",
        en ? "Opening order history..." : "Membuka riwayat belanja...",
      ),
      historyReady: tUi(
        "account",
        "history_ready",
        en ? "Orders you've placed" : "Pesanan yang pernah dibuat",
      ),
      historyEmpty: tUi(
        "account",
        "history_empty",
        en ? "No order history yet" : "Belum ada riwayat",
      ),
      wishlist: tUi("account", "wishlist", "Wishlist"),
      wishlistTitle: tUi("account", "wishlist_title", "Wishlist"),
      wishlistLoading: tUi(
        "account",
        "wishlist_loading",
        en ? "Opening wishlist..." : "Membuka wishlist...",
      ),
      wishlistReady: tUi(
        "account",
        "wishlist_ready",
        en ? "Saved products" : "Produk yang disimpan",
      ),
      wishlistEmpty: tUi(
        "account",
        "wishlist_empty",
        en ? "Wishlist is empty" : "Wishlist masih kosong",
      ),
      language: tUi("account", "language", en ? "Language" : "Bahasa"),
    }),
    [tUi, en],
  );

  const navAction = useMemo(
    () => ({
      beranda: {
        title: L(locale, "Beranda Utama", "Home"),
        message: L(
          locale,
          "Mengarahkan ke halaman utama Evomi...",
          "Redirecting to the Evomi home page...",
        ),
      },
      tentang: {
        title: L(locale, "Tentang Evomi", "About Evomi"),
        message: L(
          locale,
          "Mengarahkan ke informasi tentang Evomi...",
          "Redirecting to information about Evomi...",
        ),
      },
      belanja: {
        title: L(locale, "Katalog Produk", "Product Catalog"),
        message: L(
          locale,
          "Mengarahkan ke halaman belanja Evomi...",
          "Redirecting to the Evomi shop page...",
        ),
      },
      kuis: {
        title: L(locale, "Kuis Persona", "Persona Quiz"),
        message: L(
          locale,
          "Mengarahkan ke halaman Kuis Karakteristik...",
          "Redirecting to the Personality Quiz page...",
        ),
      },
      login: {
        title: L(locale, "Halaman Masuk", "Login Page"),
        message: L(
          locale,
          "Mengarahkan ke halaman masuk...",
          "Redirecting to the login page...",
        ),
      },
      register: {
        title: L(locale, "Halaman Pendaftaran", "Registration Page"),
        message: L(
          locale,
          "Mengarahkan ke halaman pendaftaran...",
          "Redirecting to the registration page...",
        ),
      },
    }),
    [locale],
  );

  const logoutCopy = useMemo(
    () => ({
      confirmTitle: L(locale, "Konfirmasi Keluar", "Confirm Logout"),
      confirmMessage: L(
        locale,
        "Apakah Anda yakin ingin keluar dari akun Evomi?",
        "Are you sure you want to log out of your Evomi account?",
      ),
      confirmAction: L(locale, "Ya, Keluar", "Yes, Log Out"),
      processingTitle: L(locale, "Memproses...", "Processing..."),
      processingMessage: L(
        locale,
        "Sedang mengeluarkan akun Anda...",
        "Logging you out...",
      ),
      successTitle: L(locale, "Berhasil Keluar", "Logged Out Successfully"),
      successMessage: L(
        locale,
        "Sampai jumpa kembali di Evomi!",
        "See you again at Evomi!",
      ),
      cancel: L(locale, "Batal", "Cancel"),
    }),
    [locale],
  );

  const menuLabel = {
    close: L(locale, "Tutup menu", "Close menu"),
    open: L(locale, "Buka menu", "Open menu"),
  };

  const formatBadge = (count: number) => (count > 99 ? "99+" : count);

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const onPointerDown = (event: PointerEvent | MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        accountMenuRef.current &&
        target &&
        !accountMenuRef.current.contains(target)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountMenuOpen(false);
    };

    // capture: true agar tetap tertangkap meski ada stopPropagation di elemen lain
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen]);

  // Helper: cek apakah menu aktif berdasarkan path
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/beranda";
    return pathname.startsWith(path);
  };

  // Class menu: aktif = bg-white teks warna navbar, tidak aktif = teks putih + hover soft
  // Desktop: lebar pill disamakan (grid 4 kolom) agar bg putih tidak pendek/panjang beda-beda
  const navItemClass = (path: string) =>
    `nav-pill flex justify-center items-center w-full md:min-w-[7.25rem] md:px-5 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center whitespace-nowrap ${
      isActive(path)
        ? "is-active bg-white text-[var(--nav-color)] shadow-sm"
        : "text-white hover:bg-white/95 hover:text-[var(--nav-color)] hover:shadow-sm"
    }`;

  // Detect apakah navbar dalam view
  const navRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(navRef, { margin: "0px 0px -20px 0px" });

  // Warna navbar selalu dari context (default #1172BA)
  const finalBg = navbarColor;

  // Latar di belakang pill navbar (padding luar) — biru seperti beranda
  const hasBlueNavBackdrop =
    pathname === "/" ||
    pathname === "/beranda" ||
    pathname === "/belanja" ||
    pathname === "/about" ||
    pathname === "/contact";
  const navBackdropColor = hasBlueNavBackdrop
    ? finalBg || "#1172BA"
    : "transparent";

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
      title: logoutCopy.confirmTitle,
      message: logoutCopy.confirmMessage,
      confirmText: logoutCopy.confirmAction,
      onConfirm: async () => {
        setNavModal({
          isOpen: true,
          type: "loading",
          title: logoutCopy.processingTitle,
          message: logoutCopy.processingMessage,
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
      localStorage.removeItem("user");
      setUserEmail(null);
      setUserAvatar(null);
      setUserName(null);
      window.dispatchEvent(new Event("auth-change"));
      setIsLogoutLoading(false);
      setNavModal({
        isOpen: true,
        type: "success",
        title: logoutCopy.successTitle,
        message: logoutCopy.successMessage,
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
        style={{
          backgroundColor: navBackdropColor,
          transition: `background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <nav
          className="theme-color-shimmer-chrome text-white rounded-[18px] md:rounded-[25px] px-3 py-2 md:px-8 md:py-3 relative w-[100%] max-w-[4200px] mx-auto"
          style={
            {
              backgroundColor: finalBg,
              transition:
                "background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
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
              min-width: 260px;
              max-width: 320px;
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
              z-index: 80;
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
            .nav-avatar-wrap.is-open .nav-avatar-tooltip {
              opacity: 1;
              visibility: visible;
              pointer-events: auto;
              transform: translateY(0) scale(1);
            }
            .nav-account-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              width: 100%;
              padding: 8px 10px;
              border-radius: 12px;
              text-align: left;
              transition: background-color 0.2s ease;
            }
            .nav-account-item:hover {
              background-color: #f3f4f6;
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
                    navAction.beranda.title,
                    navAction.beranda.message,
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

            {/* DESKTOP: MENU TENGAH — lebar pill disamakan (4 kolom) */}
            <div className="hidden md:grid grid-cols-4 gap-1 items-center">
              <motion.div variants={itemVariants} className="w-full">
                <Link
                  href="/"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/",
                      navAction.beranda.title,
                      navAction.beranda.message,
                    )
                  }
                  className={navItemClass("/")}
                >
                  {tNav("beranda", "Beranda")}
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Link
                  href="/#about"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/#about",
                      navAction.tentang.title,
                      navAction.tentang.message,
                    )
                  }
                  className={navItemClass("/#about")}
                >
                  {tNav("tentang", "Tentang")}
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Link
                  href="/belanja"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/belanja",
                      navAction.belanja.title,
                      navAction.belanja.message,
                    )
                  }
                  className={navItemClass("/belanja")}
                >
                  {tNav("belanja", "Belanja")}
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Link
                  href="/kuis"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/kuis",
                      navAction.kuis.title,
                      navAction.kuis.message,
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
                  {isAccountMenuOpen ? (
                    <button
                      type="button"
                      aria-label="Tutup menu akun"
                      className="fixed inset-0 z-[65] cursor-default bg-transparent"
                      onClick={() => setIsAccountMenuOpen(false)}
                    />
                  ) : null}
                  <motion.div
                    variants={itemVariants}
                    className={`nav-avatar-wrap relative z-[70]${isAccountMenuOpen ? " is-open" : ""}`}
                    ref={accountMenuRef}
                  >
                    <button
                      type="button"
                      onClick={() => setIsAccountMenuOpen((open) => !open)}
                      className="nav-avatar relative flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white text-[var(--nav-color)] font-bold text-[17px] border-2 border-white/90 shadow-sm"
                      aria-label={account.menuLabel}
                      aria-expanded={isAccountMenuOpen}
                      aria-haspopup="menu"
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
                          aria-label={`${formatBadge(unreadCount)} ${account.unreadTip}`}
                        >
                          {formatBadge(unreadCount)}
                          <span className="nav-unread-tip" role="tooltip">
                            {formatBadge(unreadCount)} {account.unreadTip}
                          </span>
                        </span>
                      )}
                    </button>

                    <div
                      className="nav-avatar-tooltip"
                      role="menu"
                      aria-label={account.menuLabel}
                    >
                      <div className="relative z-[1] space-y-2.5 text-left">
                        <div className="flex items-center gap-2.5 px-1">
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
                              {account.myAccount}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="space-y-0.5">
                          <Link
                            href="/profile"
                            role="menuitem"
                            onClick={(e) => {
                              setIsAccountMenuOpen(false);
                              handleNavAction(
                                e,
                                "/profile",
                                account.profileTitle,
                                account.profileLoading,
                              );
                            }}
                            className="nav-account-item"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                {account.profile}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {account.profileDesc}
                              </p>
                            </div>
                          </Link>

                          <Link
                            href="/profile/chat"
                            role="menuitem"
                            onClick={(e) => {
                              setIsAccountMenuOpen(false);
                              handleNavAction(
                                e,
                                "/profile/chat",
                                account.messagesTitle,
                                account.messagesLoading,
                              );
                            }}
                            className="nav-account-item"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                {account.messages}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {unreadCount > 0
                                  ? account.messagesNew
                                  : account.messagesEmpty}
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
                          </Link>

                          <Link
                            href="/profile/cart"
                            role="menuitem"
                            onClick={(e) => {
                              setIsAccountMenuOpen(false);
                              handleNavAction(
                                e,
                                "/profile/cart",
                                account.cartTitle,
                                account.cartLoading,
                              );
                            }}
                            className="nav-account-item"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                {account.cart}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {cartCount > 0
                                  ? account.cartReady
                                  : account.cartEmpty}
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
                          </Link>

                          <Link
                            href="/profile/history"
                            role="menuitem"
                            onClick={(e) => {
                              setIsAccountMenuOpen(false);
                              handleNavAction(
                                e,
                                "/profile/history",
                                account.historyTitle,
                                account.historyLoading,
                              );
                            }}
                            className="nav-account-item"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                {account.history}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {historyCount > 0
                                  ? account.historyReady
                                  : account.historyEmpty}
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
                          </Link>

                          <Link
                            href="/profile/wishlist"
                            role="menuitem"
                            onClick={(e) => {
                              setIsAccountMenuOpen(false);
                              handleNavAction(
                                e,
                                "/profile/wishlist",
                                account.wishlistTitle,
                                account.wishlistLoading,
                              );
                            }}
                            className="nav-account-item"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800">
                                {account.wishlist}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {wishlistCount > 0
                                  ? account.wishlistReady
                                  : account.wishlistEmpty}
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
                          </Link>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="flex items-center justify-between gap-3 px-1 pt-0.5">
                          <p className="text-[11px] font-semibold text-gray-800">
                            {account.language}
                          </p>
                          <LanguageSwitcher variant="dark" />
                        </div>
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
                          navAction.login.title,
                          navAction.login.message,
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
                          navAction.register.title,
                          navAction.register.message,
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
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsOpen(!isOpen);
                }}
                className="text-white focus:outline-none p-1.5 rounded-full transition-transform duration-300 ease-out hover:bg-white/10 active:scale-95"
                aria-label={isOpen ? menuLabel.close : menuLabel.open}
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
                  transition:
                    "background-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1), border-color var(--theme-bg-duration, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <Link
                  href="/"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/",
                      navAction.beranda.title,
                      navAction.beranda.message,
                    )
                  }
                  className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                >
                  {tNav("beranda", "Beranda")}
                </Link>
                <Link
                  href="/#about"
                  onClick={(e) =>
                    handleNavAction(
                      e,
                      "/#about",
                      navAction.tentang.title,
                      navAction.tentang.message,
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
                      navAction.belanja.title,
                      navAction.belanja.message,
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
                      navAction.kuis.title,
                      navAction.kuis.message,
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
                  <div className="flex flex-col items-stretch gap-2 w-full pt-1">
                    <div className="flex items-center gap-3 w-full rounded-2xl px-2 py-2">
                      <span className="relative flex items-center justify-center w-[40px] h-[40px] shrink-0 rounded-full bg-white text-[var(--nav-color)] font-bold text-[14px] border-2 border-white/90 shadow-sm overflow-hidden">
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
                          {account.myAccount}
                        </span>
                        <span className="text-[10px] text-white/70 truncate">
                          {userEmail}
                        </span>
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile",
                          account.profileTitle,
                          account.profileLoading,
                        )
                      }
                      className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      <span>{account.profile}</span>
                    </Link>
                    <Link
                      href="/profile/chat"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile/chat",
                          account.messagesTitle,
                          account.messagesLoading,
                        )
                      }
                      className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      <span>{account.messagesShort}</span>
                      <span
                        className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                          unreadCount > 0
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white/70"
                        }`}
                      >
                        {formatBadge(unreadCount)}
                      </span>
                    </Link>
                    <Link
                      href="/profile/cart"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile/cart",
                          account.cartTitle,
                          account.cartLoading,
                        )
                      }
                      className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      <span>{account.cartShort}</span>
                      <span
                        className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                          cartCount > 0
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white/70"
                        }`}
                      >
                        {formatBadge(cartCount)}
                      </span>
                    </Link>
                    <Link
                      href="/profile/history"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile/history",
                          account.historyTitle,
                          account.historyLoading,
                        )
                      }
                      className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      <span>{account.historyShort}</span>
                      <span
                        className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                          historyCount > 0
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white/70"
                        }`}
                      >
                        {formatBadge(historyCount)}
                      </span>
                    </Link>
                    <Link
                      href="/profile/wishlist"
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          "/profile/wishlist",
                          account.wishlistTitle,
                          account.wishlistLoading,
                        )
                      }
                      className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      <span>{account.wishlist}</span>
                      <span
                        className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                          wishlistCount > 0
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white/70"
                        }`}
                      >
                        {formatBadge(wishlistCount)}
                      </span>
                    </Link>

                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="text-[12px] font-bold text-white">
                        {account.language}
                      </span>
                      <LanguageSwitcher variant="light" />
                    </div>

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
                          navAction.login.title,
                          navAction.login.message,
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
                          navAction.register.title,
                          navAction.register.message,
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
                    {logoutCopy.cancel}
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
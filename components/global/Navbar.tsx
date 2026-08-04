"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { logout } from "@/lib/api";
import { motion, AnimatePresence, useInView, type Variants } from "framer-motion";

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
      adminDashboard: tUi(
        "account",
        "admin_dashboard",
        en ? "Admin Dashboard" : "Dashboard Admin",
      ),
      adminDashboardDesc: tUi(
        "account",
        "admin_dashboard_desc",
        en ? "Manage Evomi store & CMS" : "Kelola toko & CMS Evomi",
      ),
      adminDashboardTitle: tUi(
        "account",
        "admin_dashboard_title",
        en ? "Admin Dashboard" : "Dashboard Admin",
      ),
      adminDashboardLoading: tUi(
        "account",
        "admin_dashboard_loading",
        en
          ? "Opening admin dashboard..."
          : "Membuka dashboard admin...",
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
      artikel: {
        title: L(locale, "Artikel Parfum", "Perfume Articles"),
        message: L(
          locale,
          "Mengarahkan ke halaman artikel Evomi...",
          "Redirecting to the Evomi articles page...",
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

  // Class menu: aktif = teks warna navbar (bg diganti indikator sliding), tidak aktif = teks putih
  // Desktop: lebar pill disamakan (grid 4 kolom)
  const navItemClass = (path: string) =>
    `nav-pill relative z-[1] flex justify-center items-center w-full md:min-w-[7.25rem] md:px-5 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center whitespace-nowrap ${
      isActive(path)
        ? "is-active text-[var(--nav-color)]"
        : "text-white"
    }`;

  // Detect apakah navbar dalam view
  const navRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(navRef, { margin: "0px 0px -20px 0px", once: false });

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

  const navEase = [0.22, 1, 0.36, 1] as const;
  const navEaseExit = [0.4, 0, 1, 1] as const;

  // Stagger variants — re-trigger tiap isInView berubah
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.06,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: navEase },
    },
  };

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -12, scale: 0.97, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.38,
        ease: navEase,
        when: "beforeChildren",
        staggerChildren: 0.045,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.98,
      filter: "blur(4px)",
      transition: { duration: 0.24, ease: navEaseExit },
    },
  };

  const mobileItemVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.32, ease: navEase },
    },
  };

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
          setIsAdmin(Boolean(user.is_admin));
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
          setIsAdmin(false);
        }
      } else {
        setUserEmail(null);
        setUserAvatar(null);
        setUserName(null);
        setIsAdmin(false);
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
    }, 620);
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
      setIsAdmin(false);
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
    "nav-pill relative z-[1] flex justify-center items-center w-full md:w-auto md:px-6 text-[12px] md:text-[18px] py-2.5 font-normal rounded-full text-center text-white";

  const userInitial = (userName || userEmail || "?").charAt(0).toUpperCase();

  const desktopLinks = [
    {
      path: "/",
      href: "/",
      label: tNav("beranda", "Beranda"),
      action: navAction.beranda,
      match: "/",
    },
    {
      path: "/#about",
      href: "/#about",
      label: tNav("tentang", "Tentang"),
      action: navAction.tentang,
      match: "/#about",
    },
    {
      path: "/belanja",
      href: "/belanja",
      label: tNav("belanja", "Belanja"),
      action: navAction.belanja,
      match: "/belanja",
    },
    {
      path: "/artikel",
      href: "/artikel",
      label: tNav("artikel", L(locale, "Artikel", "Articles")),
      action: navAction.artikel,
      match: "/artikel",
    },
    {
      path: "/kuis",
      href: "/kuis",
      label: tNav("kuis", "Kuis"),
      action: navAction.kuis,
      match: "/kuis",
    },
  ] as const;

  const activeDesktopPath =
    desktopLinks.find((link) => isActive(link.match))?.match ?? null;

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
              isolation: isolate;
              transition:
                color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-pill::before {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: 9999px;
              background: rgba(255, 255, 255, 0.96);
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
              opacity: 0;
              transform: scale(0.92);
              transition:
                opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
              z-index: -1;
              pointer-events: none;
            }
            .nav-pill:hover:not(.is-active) {
              color: var(--nav-color);
            }
            .nav-pill:hover:not(.is-active)::before {
              opacity: 1;
              transform: scale(1);
            }
            .nav-pill:active:not(.is-active) {
              opacity: 0.92;
              transition-duration: 0.16s;
            }
            .nav-pill.is-active {
              transform: none;
            }
            .nav-pill-indicator {
              position: absolute;
              inset: 0;
              border-radius: 9999px;
              background: #ffffff;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
              z-index: 0;
              pointer-events: none;
            }
            .nav-avatar {
              transition:
                box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-avatar:hover {
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
              background-color: #ffffff;
              color: var(--nav-color);
              border-color: rgba(255, 255, 255, 0.95);
            }
            .nav-avatar:active {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition-duration: 0.16s;
            }
            .nav-avatar-ring {
              position: absolute;
              inset: -3px;
              border-radius: 9999px;
              border: 1.5px solid rgba(255, 255, 255, 0.4);
              opacity: 0;
              transform: scale(0.92);
              transition:
                opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
              pointer-events: none;
            }
            .nav-avatar:hover .nav-avatar-ring,
            .nav-avatar-wrap.is-open .nav-avatar-ring {
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
                0 16px 36px rgba(0, 0, 0, 0.14),
                0 0 0 1px rgba(17, 24, 39, 0.06);
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              transform: translateY(-10px) scale(0.96);
              transform-origin: top right;
              transition:
                opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                visibility 0.38s;
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
              transition:
                background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
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
              transform: translateX(-50%) translateY(6px) scale(0.94);
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
                opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.36s cubic-bezier(0.22, 1, 0.36, 1),
                visibility 0.32s;
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
              position: relative;
              overflow: hidden;
              transition:
                background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                padding-left 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-mobile-link:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            .nav-logout {
              position: relative;
              overflow: hidden;
              background-color: rgba(255, 255, 255, 0.14);
              color: #ffffff !important;
              border: 1.5px solid rgba(255, 255, 255, 0.28);
              box-shadow: none;
              transition:
                background-color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-logout span,
            .nav-logout .nav-logout-icon {
              color: inherit !important;
              stroke: currentColor;
              transition:
                color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                stroke 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .nav-logout:hover {
              background-color: #ffffff !important;
              color: var(--nav-color, #1172BA) !important;
              border-color: #ffffff;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
            }
            .nav-logout:hover span,
            .nav-logout:hover .nav-logout-icon {
              color: var(--nav-color, #1172BA) !important;
              stroke: var(--nav-color, #1172BA) !important;
            }
            .nav-logout:active {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition-duration: 0.16s;
            }
            .nav-logout:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
            .nav-logout:hover .nav-logout-icon {
              transform: translateX(3px);
            }
            @media (prefers-reduced-motion: reduce) {
              .nav-pill,
              .nav-pill::before,
              .nav-avatar,
              .nav-avatar-ring,
              .nav-avatar-tooltip,
              .nav-account-item,
              .nav-mobile-link,
              .nav-logout,
              .nav-logout span,
              .nav-logout .nav-logout-icon,
              .nav-unread-tip {
                transition-duration: 0.01ms !important;
              }
              .nav-pill:hover:not(.is-active),
              .nav-avatar:hover,
              .nav-logout:hover,
              .nav-mobile-link:hover,
              .nav-account-item:hover {
                transform: none;
              }
            }
          `}</style>

          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              variants={itemVariants}
              className="md:ml-2 flex-shrink-0"
              whileTap={{ opacity: 0.85 }}
              transition={{ duration: 0.25, ease: navEase }}
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
                  className="object-contain brightness-0 invert w-auto h-5 md:h-10 -translate-y-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  priority
                  unoptimized
                />
              </Link>
            </motion.div>

            {/* DESKTOP: MENU TENGAH — lebar pill disamakan (4 kolom) */}
            <div className="hidden md:grid grid-cols-5 gap-1 items-center">
              {desktopLinks.map((link) => {
                const active = isActive(link.match);
                return (
                  <motion.div
                    key={link.match}
                    variants={itemVariants}
                    className="relative w-full"
                  >
                    {active && activeDesktopPath === link.match ? (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="nav-pill-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 34,
                          mass: 0.75,
                        }}
                      />
                    ) : null}
                    <Link
                      href={link.href}
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          link.path,
                          link.action.title,
                          link.action.message,
                        )
                      }
                      className={navItemClass(link.match)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
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
                          {isAdmin ? (
                            <Link
                              href="/dashboard"
                              role="menuitem"
                              onClick={(e) => {
                                setIsAccountMenuOpen(false);
                                handleNavAction(
                                  e,
                                  "/dashboard",
                                  account.adminDashboardTitle,
                                  account.adminDashboardLoading,
                                );
                              }}
                              className="nav-account-item"
                            >
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-gray-800">
                                  {account.adminDashboard}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {account.adminDashboardDesc}
                                </p>
                              </div>
                            </Link>
                          ) : null}

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
                className="text-white focus:outline-none p-1.5 rounded-full transition-[transform,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/15 active:scale-95"
                aria-label={isOpen ? menuLabel.close : menuLabel.open}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.4, ease: navEase }}
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
                {(
                  [
                    {
                      href: "/",
                      path: "/",
                      label: tNav("beranda", "Beranda"),
                      action: navAction.beranda,
                    },
                    {
                      href: "/#about",
                      path: "/#about",
                      label: tNav("tentang", "Tentang"),
                      action: navAction.tentang,
                    },
                    {
                      href: "/belanja",
                      path: "/belanja",
                      label: tNav("belanja", "Belanja"),
                      action: navAction.belanja,
                    },
                    {
                      href: "/artikel",
                      path: "/artikel",
                      label: tNav("artikel", L(locale, "Artikel", "Articles")),
                      action: navAction.artikel,
                    },
                    {
                      href: "/kuis",
                      path: "/kuis",
                      label: tNav("kuis", "Kuis"),
                      action: navAction.kuis,
                    },
                  ] as const
                ).map((link) => (
                  <motion.div key={link.path} variants={mobileItemVariants}>
                    <Link
                      href={link.href}
                      onClick={(e) =>
                        handleNavAction(
                          e,
                          link.path,
                          link.action.title,
                          link.action.message,
                        )
                      }
                      className="nav-mobile-link flex items-center w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  variants={mobileItemVariants}
                  className="my-1.5"
                  style={{
                    borderTopColor: `${finalBg}99`,
                    borderTopWidth: "1px",
                  }}
                />
                {userEmail ? (
                  <motion.div
                    variants={mobileItemVariants}
                    className="flex flex-col items-stretch gap-2 w-full pt-1"
                  >
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

                    {isAdmin ? (
                      <Link
                        href="/dashboard"
                        onClick={(e) =>
                          handleNavAction(
                            e,
                            "/dashboard",
                            account.adminDashboardTitle,
                            account.adminDashboardLoading,
                          )
                        }
                        className="nav-mobile-link flex items-center justify-between w-full text-[12px] py-2.5 px-3 font-bold rounded-full text-white hover:bg-white hover:text-[var(--nav-color)]"
                      >
                        <span>{account.adminDashboard}</span>
                      </Link>
                    ) : null}
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
                  </motion.div>
                ) : (
                  <>
                    <motion.div variants={mobileItemVariants}>
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
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
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
                    </motion.div>
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
              initial={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.94, y: 10, filter: "blur(4px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
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
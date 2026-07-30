"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingCart,
  History,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCms } from "@/context/CmsContext";
import { useBadgeCounts } from "@/context/BadgeCountsContext";
import { useNavbarColor } from "@/context/NavbarColorContext";
import { L } from "@/lib/localeText";
import { PROFILE_BRAND_BLUE } from "@/components/profile/brand";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { tUi } = useCms();
  const { setNavbarAndFooterColor } = useNavbarColor();
  const {
    unread: unreadCount,
    cart: cartCount,
    history: historyCount,
    wishlist: wishlistCount,
  } = useBadgeCounts();

  useEffect(() => {
    setNavbarAndFooterColor(PROFILE_BRAND_BLUE);
  }, [pathname, setNavbarAndFooterColor]);

  const copy = {
    menuTitle: tUi(
      "profile",
      "menu_title",
      L(locale, "Menu Akun", "Account Menu"),
    ),
    menuSubtitle: tUi(
      "profile",
      "menu_subtitle",
      L(locale, "Kelola aktivitas & akun Anda", "Manage your activity & account"),
    ),
  };

  const menuItems = [
    {
      href: "/profile",
      label: tUi(
        "profile",
        "settings",
        L(locale, "Pengaturan Profil", "Profile Settings"),
      ),
      icon: User,
    },
    {
      href: "/profile/chat",
      label: tUi(
        "profile",
        "messages",
        L(locale, "Pesan Anda", "Your Messages"),
      ),
      icon: MessageCircle,
    },
    {
      href: "/profile/cart",
      label: tUi(
        "profile",
        "cart",
        L(locale, "Keranjang Belanja", "Shopping Cart"),
      ),
      icon: ShoppingCart,
    },
    {
      href: "/profile/history",
      label: tUi(
        "profile",
        "history",
        L(locale, "Riwayat Belanja", "Order History"),
      ),
      icon: History,
    },
    {
      href: "/profile/wishlist",
      label: tUi("profile", "wishlist", L(locale, "Wishlist", "Wishlist")),
      icon: Heart,
    },
  ];

  const getBadgeCount = (href: string) => {
    switch (href) {
      case "/profile/chat":
        return unreadCount;
      case "/profile/cart":
        return cartCount;
      case "/profile/history":
        return historyCount;
      case "/profile/wishlist":
        return wishlistCount;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 sticky top-6">
            <div className="px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {copy.menuTitle}
              </h2>
              <p className="text-sm text-gray-500 font-light mt-0.5">
                {copy.menuSubtitle}
              </p>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const badgeCount = getBadgeCount(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: PROFILE_BRAND_BLUE }
                        : undefined
                    }
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-black"
                      }`}
                    />
                    {item.label}

                    {badgeCount > 0 && (
                      <span
                        className={`ml-auto flex h-5 min-w-5 px-1 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                          isActive
                            ? "bg-white text-black"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Konten Halaman */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

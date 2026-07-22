"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  User,
  ShoppingCart,
  History,
  Heart,
  MessageCircle,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import {
  getCartItems,
  getWishlistItems,
  getShoppingHistory,
} from "@/lib/api";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const menuItems = [
    { href: "/profile", label: "Pengaturan Profil", icon: User },
    { href: "/profile/chat", label: "Pesan Anda", icon: MessageCircle },
    { href: "/profile/cart", label: "Keranjang Belanja", icon: ShoppingCart },
    { href: "/profile/history", label: "Riwayat Belanja", icon: History },
    { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  ];

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
      console.error("Gagal load unread badge:", error);
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
      console.error("Gagal load badge menu akun:", error);
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

  const getBadgeCount = (label: string) => {
    switch (label) {
      case "Pesan Anda":
        return unreadCount;
      case "Keranjang Belanja":
        return cartCount;
      case "Riwayat Belanja":
        return historyCount;
      case "Wishlist":
        return wishlistCount;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/80 p-4 sm:p-5 sticky top-6 shadow-sm shadow-gray-100/50">
            <div className="px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Menu Akun
              </h2>
              <p className="text-sm text-gray-500 font-light mt-0.5">
                Kelola aktivitas & akun Anda
              </p>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const badgeCount = getBadgeCount(item.label);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? "bg-black text-white shadow-md shadow-black/10 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
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
                            : "bg-green-500 text-white shadow-sm ring-2 ring-green-100"
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

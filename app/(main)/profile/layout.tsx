"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  User,
  ShoppingCart,
  History,
  Heart,
  MessageCircle,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Daftar menu navigasi
  const menuItems = [
    { href: "/profile", label: "Pengaturan Profil", icon: User },
    { href: "/profile/chat", label: "Pesan Anda", icon: MessageCircle },
    { href: "/profile/cart", label: "Keranjang Belanja", icon: ShoppingCart },
    { href: "/profile/history", label: "Riwayat Belanja", icon: History },
    { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  ];

  // Fungsi untuk menarik angka pesan yang belum dibaca dari database
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

  useEffect(() => {
    // 1. Cek saat komponen pertama kali dimuat atau saat ganti halaman
    fetchUnreadCount();

    // 2. Auto-refresh (Polling) setiap 5 detik agar Badge Merah muncul otomatis
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    // 3. Listener jika pesan baru saja dibuka di halaman chat (agar badge langsung hilang)
    window.addEventListener("messages_read", fetchUnreadCount);

    // Cleanup interval & listener saat komponen ditutup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("messages_read", fetchUnreadCount);
    };
  }, [pathname]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100/80 p-5 sticky top-6 shadow-sm shadow-gray-100/50">
            <div className="px-4 py-3 mb-4">
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

                    {/* SINYAL MERAH (UNREAD BADGE) */}
                    {item.label === "Pesan Anda" && unreadCount > 0 && (
                      <span
                        className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                          isActive
                            ? "bg-white text-black"
                            : "bg-red-500 text-white shadow-sm ring-2 ring-red-100 animate-pulse"
                        }`}
                      >
                        {unreadCount}
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

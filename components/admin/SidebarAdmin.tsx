"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  UserCircle,
  Heart,
  ShoppingBag,
  MessageSquare,
  Truck,
  LogOut,
  ShoppingBasket,
  Users,
  Mail,
  ClipboardList,
  FilePenLine,
  Boxes,
  Tag,
} from "lucide-react";
import { SITE_STRINGS } from "../constans/strings";
import LanguageSwitcher from "@/components/global/LanguageSwitcher";
import { useAdminI18n } from "@/hooks/useAdminI18n";

const menuItems = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboard, id: "Dashboard", en: "Dashboard" },
  { key: "cms", path: "/dashboard/cms", icon: FilePenLine, id: "CMS", en: "CMS" },
  { key: "products", path: "/dashboard/products", icon: Package, id: "Produk", en: "Products" },
  { key: "promos", path: "/dashboard/promos", icon: Tag, id: "Promo", en: "Promos" },
  { key: "kurirs", path: "/dashboard/kurirs", icon: Boxes, id: "Kurir", en: "Couriers" },
  { key: "quiz", path: "/dashboard/quiz", icon: ClipboardList, id: "Kuis", en: "Quiz" },
  { key: "orders", path: "/dashboard/orders", icon: ShoppingBag, id: "Pesanan", en: "Orders" },
  { key: "trackings", path: "/dashboard/trackings", icon: Truck, id: "Pelacakan", en: "Trackings" },
  { key: "messages", path: "/dashboard/messages", icon: MessageSquare, id: "Pesan", en: "Messages" },
  { key: "cart", path: "/dashboard/cart", icon: ShoppingBasket, id: "Keranjang", en: "Cart" },
  { key: "wishlist", path: "/dashboard/wishlist", icon: Heart, id: "Wishlist", en: "Wishlist" },
  { key: "users", path: "/dashboard/users", icon: Users, id: "Semua User", en: "All Users" },
  { key: "subscribers", path: "/dashboard/subscribers", icon: Mail, id: "Subscriber", en: "Subscribers" },
  { key: "profile", path: "/dashboard/profile", icon: UserCircle, id: "Profil Admin", en: "Admin Profile" },
] as const;

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useAdminI18n();

  const handleLogout = async () => {
    const baseUrl = SITE_STRINGS.base_url.url_backend;
    const token = localStorage.getItem("auth_token");

    try {
      await fetch(`${baseUrl}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_user");
      router.push("/admin-login");
    }
  };

  return (
    <aside className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col fixed left-0 top-0 overflow-hidden">
      <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100 gap-2">
        <h1 className="text-xl font-bold tracking-wider text-gray-900 shrink-0">
          EVOMI
          <span className="text-sm font-normal text-gray-400 ml-1.5">Admin</span>
        </h1>
        <LanguageSwitcher variant="dark" />
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          const Icon = item.icon;
          const label = t("sidebar", item.key, item.id, item.en);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive ? "text-white" : "text-gray-400 hover:text-gray-600"
                }
              />
              <span className="text-sm font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">
            {t("sidebar", "logout", "Keluar", "Logout")}
          </span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
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
  Users, // 1. Tambahkan ikon Users
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Products", icon: Package, path: "/dashboard/products" },
  { name: "Orders / Pesanan", icon: ShoppingBag, path: "/dashboard/orders" },
  { name: "Trackings Order", icon: Truck, path: "/dashboard/trackings" },
  {
    name: "Message / Contact",
    icon: MessageSquare,
    path: "/dashboard/messages",
  },
  { name: "Cart", icon: ShoppingBasket, path: "/dashboard/cart" },
  { name: "Wishlist", icon: Heart, path: "/dashboard/wishlist" },
  // 2. Tambahkan menu All Users di sini
  { name: "All Users", icon: Users, path: "/dashboard/users" }, 
  { name: "User Profile", icon: UserCircle, path: "/dashboard/profile" },
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";
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
      console.error("Gagal logout:", error);
    } finally {
      localStorage.removeItem("auth_token");
      router.push("/admin-login");
    }
  };

  return (
    <aside className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col fixed left-0 top-0">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-wider text-gray-900">
          EVOMI
          <span className="text-sm font-normal text-gray-400 ml-2">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
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
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
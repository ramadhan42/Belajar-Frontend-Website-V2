"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingCart, History, Heart } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Daftar menu untuk mempermudah deteksi active state
  const menuItems = [
    { href: '/profile', label: 'Pengaturan Profil', icon: User },
    { href: '/profile/cart', label: 'Keranjang Belanja', icon: ShoppingCart },
    { href: '/profile/history', label: 'Riwayat Belanja', icon: History },
    { href: '/profile/wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100/80 p-5 sticky top-6 shadow-sm shadow-gray-100/50">
            <div className="px-4 py-3 mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Akun</h2>
              <p className="text-sm text-gray-500 font-light mt-0.5">Kelola aktivitas & akun Anda</p>
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
                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-black"
                    }`} /> 
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Konten Halaman */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
import Link from 'next/link';
import { User, ShoppingCart, History, Heart } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 px-4">Menu Akun</h2>
            <nav className="space-y-1">
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-black transition-colors">
                <User className="w-5 h-5" /> Pengaturan Profil
              </Link>
              <Link href="/profile/cart" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-black transition-colors">
                <ShoppingCart className="w-5 h-5" /> Keranjang Belanja
              </Link>
              <Link href="/profile/history" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-black transition-colors">
                <History className="w-5 h-5" /> Riwayat Belanja
              </Link>
              <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-black transition-colors">
                <Heart className="w-5 h-5" /> Wishlist
              </Link>
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
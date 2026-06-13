"use client";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  // Contoh data dummy keranjang
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Evomi Signature Parfum 50ml", price: 150000, quantity: 1, image: "/placeholder.jpg" },
    { id: 2, name: "Evomi Vanilla Mist 30ml", price: 100000, quantity: 2, image: "/placeholder.jpg" },
  ]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>

      {cartItems.length > 0 ? (
        <div className="space-y-6">
          {/* Daftar Produk */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Kontrol Kuantitas */}
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <button className="text-gray-500 hover:text-black"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button className="text-gray-500 hover:text-black"><Plus className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Tombol Hapus */}
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Belanja</p>
              <p className="text-2xl font-bold text-gray-900">Rp {total.toLocaleString("id-ID")}</p>
            </div>
            <Link href="/checkout" className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-center shadow-md">
              Checkout Sekarang
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Keranjang belanja Anda masih kosong.</p>
          <Link href="/" className="text-black font-medium hover:underline">Mulai Belanja</Link>
        </div>
      )}
    </div>
  );
}
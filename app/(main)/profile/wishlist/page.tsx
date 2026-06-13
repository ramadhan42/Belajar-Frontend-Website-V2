import { ShoppingCart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const wishlists = [
    { id: 1, name: "Evomi Rose Elegance 50ml", price: 175000, inStock: true },
    { id: 2, name: "Evomi Ocean Breeze 100ml", price: 250000, inStock: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wishlist Tersimpan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {wishlists.map((item) => (
          <div key={item.id} className="group border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all relative overflow-hidden">
            {/* Action Buttons Top Right */}
            <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10">
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-300 text-sm">Gambar Produk</span>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
              <p className="text-lg font-bold text-gray-900 mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
              <p className={`text-xs mt-2 ${item.inStock ? 'text-green-600' : 'text-red-500'}`}>
                {item.inStock ? 'Stok Tersedia' : 'Stok Habis'}
              </p>
            </div>

            {/* Add to cart */}
            <button 
              disabled={!item.inStock}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.inStock 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {item.inStock ? 'Masukkan Keranjang' : 'Habis'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Loader2 } from "lucide-react";
import {
  wishlistApi,
  cartApi,
  WishlistItem,
  formatProductPrice,
  getProductImageUrl,
} from "@/lib/api";

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistApi.getWishlist().then((data) => {
      setWishlists(data);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (id: number) => {
    await wishlistApi.removeFromWishlist(id);
    setWishlists(wishlists.filter((item) => item.id !== id));
  };

  const handleAddToCart = async (productId: number, wishlistItemId: number) => {
    try {
      await cartApi.addToCart(productId, 1);
      alert("Berhasil dimasukkan ke keranjang!");
      handleRemove(wishlistItemId);
    } catch (e) {
      alert("Gagal menambahkan ke keranjang");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Wishlist Tersimpan
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {wishlists.map((item) => {
          // 🎨 Dynamic background (ambil dari produk kalau ada)
          // const bgColor =
          //   item.product?.bg_color || "bg-gray-50"; // fallback

          return (
            <div
              key={item.id}
              className="border border-gray-100 rounded-xl p-4 relative bg-white hover:shadow-lg transition-all duration-300"
            >
              {/* REMOVE BUTTON */}
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* IMAGE */}
              <div
                className={`w-full h-52 rounded-xl mb-4 flex items-center justify-center overflow-hidden`}
              >
                {item.product?.image_produk_belanja ? (
                  <img
                    src={
                      getProductImageUrl(
                        item.product.image_produk_belanja
                      ) ?? ""
                    }
                    alt={item.product.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>

              {/* PRODUCT INFO */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {item.product?.title}
                </h3>
                <p className="text-lg font-bold mt-1 text-black">
                  {formatProductPrice(item.product?.price)}
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={() =>
                  handleAddToCart(item.product_id, item.id)
                }
                className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Masukkan Keranjang
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { wishlistApi, formatProductPrice, getProductImageUrl } from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L, productLocaleText } from "@/lib/localeText";

/** Warna bg gambar produk — sama seperti halaman Belanja */
const PRODUCT_IMG_BG: Record<string, string> = {
  purpose_prestige: "#1172BA",
  prestige: "#1172BA",
  peaceful_calm: "#5EA14A",
  rebel_brave: "#E33D35",
  sweet_shy: "#DD74A5",
};

function getProductImageBg(product?: {
  color?: string | null;
  personality_type?: string | null;
} | null) {
  if (product?.color) return product.color;
  const key = product?.personality_type ?? "";
  return PRODUCT_IMG_BG[key] || "#1172BA";
}

export default function WishlistDetailPage() {
  const { locale } = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const copy = useMemo(
    () => ({
      loading: L(locale, "Memuat detail produk...", "Loading product details..."),
      productNotFound: L(locale, "Produk tidak ditemukan", "Product not found"),
      backToWishlist: L(locale, "Kembali ke Wishlist", "Back to Wishlist"),
      detailTitle: L(locale, "Detail Produk Wishlist", "Wishlist Product Details"),
      imageUnavailable: L(
        locale,
        "Gambar tidak tersedia",
        "Image not available",
      ),
      descriptionLabel: L(locale, "Deskripsi Produk:", "Product Description:"),
      noDescription: L(
        locale,
        "Tidak ada deskripsi yang tersedia untuk produk ini. Silakan hubungi admin untuk info lebih lanjut.",
        "No description is available for this product. Please contact admin for more information.",
      ),
      addToCartButton: L(locale, "Tambahkan ke Keranjang", "Add to Cart"),
      copyright: L(
        locale,
        "© 2026 Toko Anda. All rights reserved.",
        "© 2026 Your Store. All rights reserved.",
      ),
      footerTagline: L(
        locale,
        "Dibuat dengan ❤️ untuk pengalaman belanja yang lebih baik.",
        "Made with ❤️ for a better shopping experience.",
      ),
    }),
    [locale],
  );

  // useEffect(() => {
  //   if (id) {
  //     // Pastikan method ini ada di api.ts Anda, sesuaikan dengan endpoint backend Anda
  //     wishlistApi
  //       .getWishlistDetail(Number(id))
  //       .then((data) => {
  //         setItem(data);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         console.error("Gagal memuat detail:", err);
  //         setLoading(false);
  //       });
  //   }
  // }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      wishlistApi
        .getWishlistDetail(Number(id), locale)
        .then((data) => {
          setItem(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal memuat detail:", err);
          setLoading(false);
        });
    }
  }, [id, locale]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">{copy.loading}</p>
      </div>
    );
  }

  if (!item || !item.product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {copy.productNotFound}
        </h2>
        <button
          onClick={() => router.push("/wishlist")}
          className="text-blue-600 hover:underline"
        >
          {copy.backToWishlist}
        </button>
      </div>
    );
  }

  // Mengambil warna produk (ganti 'brand_color' dengan field warna dari backend Anda, misal 'color_code')
  // Jika produk tidak punya warna khusus, akan fallback ke warna hitam (#000000)
  const themeColor = item.product?.brand_color || "#000000";

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 transition-colors duration-500"
      style={{ "--primary-color": themeColor } as React.CSSProperties}
    >
      {/* Navbar Dinamis */}
      <nav
        className="text-white p-4 shadow-md sticky top-0 z-50 flex items-center gap-4 transition-colors duration-500"
        style={{ backgroundColor: "var(--primary-color)" }}
      >
        <button
          onClick={() => router.push("/wishlist")}
          className="p-2 hover:bg-white/20 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">{copy.detailTitle}</h1>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">
          {/* Kolom Gambar */}
          {/* Kolom Gambar */}
          <div
            className="w-full aspect-square rounded-2xl p-8 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: getProductImageBg(item.product),
            }}
          >
            {item.product?.image_1 ? (
              <img
                src={
                  getProductImageUrl(item.product.image_1 as string) || ""
                }
                alt={productLocaleText(item.product, "title", locale)}
                className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-white/80">{copy.imageUnavailable}</span>
            )}
          </div>

          {/* Kolom Detail */}
          <div className="flex flex-col h-full">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
              {productLocaleText(item.product, "title", locale)}
            </h1>

            <p
              className="text-3xl font-bold mb-6 transition-colors duration-500"
              style={{ color: "var(--primary-color)" }}
            >
              {formatProductPrice(item.product.price)}
            </p>

            <div className="prose prose-sm text-gray-600 mb-8 flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {copy.descriptionLabel}
              </h3>
              <p>
                {productLocaleText(
                  item.product,
                  "description",
                  locale,
                  copy.noDescription,
                )}
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-auto space-y-3">
              <button
                className="w-full text-white py-4 rounded-xl text-base font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <ShoppingCart className="w-5 h-5" />
                {copy.addToCartButton}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Dinamis */}
      <footer
        className="text-white p-6 mt-10 transition-colors duration-500"
        style={{ backgroundColor: "var(--primary-color)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm opacity-90">
          <p>{copy.copyright}</p>
          <p>{copy.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}

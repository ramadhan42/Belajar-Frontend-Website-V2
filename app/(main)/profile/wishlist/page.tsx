"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Heart,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  ExternalLink,
} from "lucide-react";
import {
  wishlistApi,
  cartApi,
  WishlistItem,
  formatProductPrice,
  getProductImageUrl,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L, productLocaleText } from "@/lib/localeText";
import ProfileBrandShell, {
  useProfileBrand,
} from "@/components/profile/ProfileBrandShell";

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

interface ModalConfig {
  isOpen: boolean;
  type: "success" | "warning" | "error" | "confirm";
  message: string;
}

export default function WishlistPage() {
  const { locale } = useLocale();
  const brand = useProfileBrand();
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const copy = useMemo(
    () => ({
      title: L(locale, "Wishlist", "Wishlist"),
      subtitle: L(
        locale,
        "Koleksi aroma favoritmu — siap dipindah ke keranjang kapan saja.",
        "Your favorite scents — ready to move to cart anytime.",
      ),
      loading: L(locale, "Memuat wishlist...", "Loading wishlist..."),
      emptyTitle: L(locale, "Wishlist masih kosong", "Your wishlist is empty"),
      emptySubtitle: L(
        locale,
        "Simpan produk favoritmu di sini biar gampang ditemukan lagi.",
        "Save your favorites here so they're easy to find again.",
      ),
      noImage: L(locale, "No Image", "No Image"),
      productImageAlt: L(locale, "Gambar Produk", "Product Image"),
      addToCartButton: L(locale, "Masukkan Keranjang", "Add to Cart"),
      adding: L(locale, "Menambahkan...", "Adding..."),
      confirmRemoveMessage: L(
        locale,
        "Hapus produk ini dari wishlist?",
        "Remove this product from your wishlist?",
      ),
      removeSuccess: L(
        locale,
        "Produk dihapus dari wishlist.",
        "Removed from wishlist.",
      ),
      removeFailed: L(
        locale,
        "Gagal menghapus item dari wishlist.",
        "Failed to remove item from wishlist.",
      ),
      loginRequired: L(
        locale,
        "Silakan login terlebih dahulu untuk menambahkan produk.",
        "Please log in first to add products.",
      ),
      addToCartSuccess: L(
        locale,
        "Ditambahkan ke keranjang.",
        "Added to cart.",
      ),
      addToCartFailed: L(
        locale,
        "Gagal menambahkan ke keranjang",
        "Failed to add to cart",
      ),
      modalConfirmTitle: L(locale, "Hapus dari wishlist?", "Remove from wishlist?"),
      modalErrorTitle: L(locale, "Gagal", "Failed"),
      cancel: L(locale, "Batal", "Cancel"),
      confirmDelete: L(locale, "Ya, Hapus", "Yes, Delete"),
      understood: L(locale, "Mengerti", "Got it"),
      shopNow: L(locale, "Mulai Belanja", "Start Shopping"),
      viewProduct: L(locale, "Lihat produk", "View product"),
      itemsCount: (n: number) =>
        L(locale, `${n} produk`, `${n} product${n === 1 ? "" : "s"}`),
      goToCart: L(locale, "Ke Keranjang", "Go to Cart"),
    }),
    [locale],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    setLoading(true);
    wishlistApi
      .getWishlist(locale)
      .then((data) => {
        setWishlists(data);
        window.dispatchEvent(new Event("wishlist_updated"));
      })
      .catch(() => setWishlists([]))
      .finally(() => setLoading(false));
  }, [locale]);

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    setItemToDelete(null);
  };

  const confirmRemove = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete(id);
    setModal({
      isOpen: true,
      type: "confirm",
      message: copy.confirmRemoveMessage,
    });
  };

  const executeRemove = async () => {
    if (!itemToDelete) return;
    try {
      await wishlistApi.removeFromWishlist(itemToDelete);
      setWishlists((prev) => prev.filter((item) => item.id !== itemToDelete));
      window.dispatchEvent(new Event("wishlist_updated"));
      closeModal();
      showToast(copy.removeSuccess);
    } catch {
      setModal({
        isOpen: true,
        type: "error",
        message: copy.removeFailed,
      });
      setItemToDelete(null);
    }
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    productId: number,
    wishlistItemId: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      setModal({
        isOpen: true,
        type: "error",
        message: copy.loginRequired,
      });
      return;
    }

    if (addingId === wishlistItemId) return;

    try {
      setAddingId(wishlistItemId);
      await cartApi.addToCart(productId, 1);
      await wishlistApi.removeFromWishlist(wishlistItemId);
      setWishlists((prev) => prev.filter((item) => item.id !== wishlistItemId));
      window.dispatchEvent(new Event("cart_updated"));
      window.dispatchEvent(new Event("wishlist_updated"));
      showToast(copy.addToCartSuccess);
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        message: err?.message || copy.addToCartFailed,
      });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <ProfileBrandShell
        title={copy.title}
        subtitle={copy.subtitle}
        icon={Heart}
        loading={loading}
        loadingText={copy.loading}
        headerRight={
          <div className="flex items-center gap-2 shrink-0">
            {wishlists.length > 0 ? (
              <span className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
                {copy.itemsCount(wishlists.length)}
              </span>
            ) : null}
            <Link
              href="/profile/cart"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/25 hover:bg-white/25 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {copy.goToCart}
            </Link>
          </div>
        }
      >
        {wishlists.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${brand}14` }}
            >
              <Heart className="w-7 h-7" style={{ color: brand }} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {copy.emptyTitle}
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {copy.emptySubtitle}
            </p>
            <Link
              href="/belanja"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition hover:opacity-90"
              style={{ backgroundColor: brand }}
            >
              {copy.shopNow}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlists.map((item) => {
              const imageToDisplay =
                item.product?.image_2 || item.product?.image_1;
              const productHref = `/belanja/${item.product_id}`;

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-4 transition-all group"
                >
                  <button
                    type="button"
                    onClick={(e) => confirmRemove(e, item.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors border border-rose-100"
                    aria-label={copy.confirmDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={productHref}
                    className="block focus:outline-none"
                  >
                    <div
                      className="w-[78%] mx-auto aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden p-2.5"
                      style={{
                        backgroundColor: getProductImageBg(item.product),
                      }}
                    >
                      {imageToDisplay ? (
                        <img
                          src={getProductImageUrl(imageToDisplay) ?? ""}
                          alt={productLocaleText(
                            item.product,
                            "title",
                            locale,
                            copy.productImageAlt,
                          )}
                          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-white/80 text-sm">
                          {copy.noImage}
                        </span>
                      )}
                    </div>

                    <div className="mb-3 pr-8">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:underline decoration-slate-300 underline-offset-2">
                        {productLocaleText(item.product, "title", locale)}
                      </h3>
                      <p
                        className="text-lg font-bold mt-1"
                        style={{ color: brand }}
                      >
                        {formatProductPrice(item.product?.price)}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                        {copy.viewProduct}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    disabled={addingId === item.id}
                    onClick={(e) =>
                      handleAddToCart(e, item.product_id, item.id)
                    }
                    className="mt-auto w-full text-white py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    style={{ backgroundColor: brand }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addingId === item.id
                      ? copy.adding
                      : copy.addToCartButton}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ProfileBrandShell>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mt-2">
              <div className="flex justify-center mb-4">
                {modal.type === "confirm" && (
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                )}
                {modal.type === "success" && (
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                )}
                {modal.type === "error" && (
                  <XCircle className="w-12 h-12 text-rose-500" />
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {modal.type === "confirm"
                  ? copy.modalConfirmTitle
                  : copy.modalErrorTitle}
              </h3>
              <p className="text-sm text-slate-600 mb-6">{modal.message}</p>

              <div className="flex gap-2">
                {modal.type === "confirm" ? (
                  <>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium"
                    >
                      {copy.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={executeRemove}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold"
                    >
                      {copy.confirmDelete}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: brand }}
                  >
                    {copy.understood}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

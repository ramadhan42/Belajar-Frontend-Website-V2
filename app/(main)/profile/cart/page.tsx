"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  ShoppingBag,
  ArrowRight,
  Package,
  Sparkles,
} from "lucide-react";
import {
  getCartItems,
  CartItem,
  getProductImageUrl,
  formatProductPrice,
  cartApi,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L, productLocaleText } from "@/lib/localeText";
import { useProfileBrand } from "@/components/profile/ProfileBrandShell";
import { profileBrandGradient } from "@/components/profile/brand";

interface ModalConfig {
  isOpen: boolean;
  type: "success" | "warning" | "error" | "confirm";
  message: string;
  confirmAction?: () => void;
}

export default function CartPage() {
  const { locale } = useLocale();
  const brand = useProfileBrand();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const copy = useMemo(
    () => ({
      title: L(locale, "Keranjang Belanja", "Shopping Cart"),
      subtitle: L(
        locale,
        "Siap checkout? Cek ulang item favoritmu dulu.",
        "Ready to checkout? Review your picks first.",
      ),
      loading: L(locale, "Memuat keranjang...", "Loading cart..."),
      totalLabel: L(locale, "Total Belanja", "Order Total"),
      itemsCount: (n: number) =>
        L(locale, `${n} item di keranjang`, `${n} item${n === 1 ? "" : "s"} in cart`),
      subtotalLine: L(locale, "Subtotal", "Subtotal"),
      checkoutButton: L(locale, "Checkout Sekarang", "Checkout Now"),
      continueShopping: L(locale, "Lanjut Belanja", "Continue Shopping"),
      emptyCart: L(locale, "Keranjang masih kosong", "Your cart is empty"),
      emptyHint: L(
        locale,
        "Jelajahi koleksi aroma Evomi dan temukan yang paling “gue banget”.",
        "Explore Evomi scents and find the one that feels like you.",
      ),
      shopNow: L(locale, "Mulai Belanja", "Start Shopping"),
      noImage: L(locale, "No Image", "No Image"),
      loadFailed: L(
        locale,
        "Gagal memuat keranjang belanja.",
        "Failed to load shopping cart.",
      ),
      confirmRemoveItem: L(
        locale,
        "Hapus produk ini dari keranjang?",
        "Remove this product from your cart?",
      ),
      removeSuccess: L(locale, "Item dihapus dari keranjang.", "Item removed from cart."),
      removeFailed: L(locale, "Gagal menghapus item.", "Failed to remove item."),
      updateQtyFailed: L(
        locale,
        "Gagal memperbarui jumlah produk.",
        "Failed to update quantity.",
      ),
      stockLimit: L(
        locale,
        "Stok tidak mencukupi untuk jumlah ini.",
        "Not enough stock for this quantity.",
      ),
      checkoutProcessing: L(
        locale,
        "Mengalihkan ke checkout...",
        "Redirecting to checkout...",
      ),
      modalConfirmTitle: L(locale, "Hapus item?", "Remove item?"),
      modalSuccessTitle: L(locale, "Berhasil", "Success"),
      modalErrorTitle: L(locale, "Gagal", "Failed"),
      cancel: L(locale, "Batal", "Cancel"),
      confirmDelete: L(locale, "Ya, Hapus", "Yes, Delete"),
      understood: L(locale, "Mengerti", "Got it"),
      perItem: L(locale, "per item", "each"),
      lineTotal: L(locale, "Total", "Total"),
      stockLeft: (n: number) =>
        L(locale, `Sisa stok ${n}`, `${n} left in stock`),
    }),
    [locale],
  );

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCartItems(locale);
      setCartItems(data);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err: any) {
      setError(err.message || copy.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerModal = (
    type: ModalConfig["type"],
    message: string,
    confirmAction?: () => void,
  ) => {
    setModal({ isOpen: true, type, message, confirmAction });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleRemoveItem = (cartItemId: number) => {
    triggerModal("confirm", copy.confirmRemoveItem, async () => {
      try {
        await cartApi.removeFromCart(cartItemId);
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        window.dispatchEvent(new Event("cart_updated"));
        showToast(copy.removeSuccess);
      } catch {
        triggerModal("error", copy.removeFailed);
      }
    });
  };

  const handleUpdateQuantity = async (
    currentQty: number,
    change: number,
    cartItemId: number,
    stock?: number,
  ) => {
    const newQty = currentQty + change;

    if (newQty < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    if (typeof stock === "number" && stock >= 0 && newQty > stock) {
      showToast(copy.stockLimit);
      return;
    }

    if (updatingItemId === cartItemId) return;

    const prevItems = cartItems;
    try {
      setUpdatingItemId(cartItemId);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
      await cartApi.updateQuantity(cartItemId, newQty);
      window.dispatchEvent(new Event("cart_updated"));
    } catch {
      setCartItems(prevItems);
      try {
        const refreshedData = await getCartItems(locale);
        setCartItems(refreshedData);
      } catch {
        /* ignore */
      }
      triggerModal("error", copy.updateQtyFailed);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = () => {
    showToast(copy.checkoutProcessing);
    window.setTimeout(() => {
      router.push("/checkout?type=cart");
    }, 600);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product?.price || "0") * item.quantity,
    0,
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="rounded-[28px] overflow-hidden border border-gray-100 min-h-[400px] flex flex-col items-center justify-center bg-white">
        <Loader2
          className="w-8 h-8 animate-spin mb-4"
          style={{ color: brand }}
        />
        <p className="text-gray-500 font-medium text-sm">{copy.loading}</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-[28px] overflow-hidden border border-gray-100 bg-white"
      style={{ ["--cart-brand" as string]: brand }}
    >
      {/* Header */}
      <div
        className="relative px-5 sm:px-7 py-5 text-white"
        style={{
          background: profileBrandGradient(brand),
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 90% 0%, rgba(255,255,255,0.18), transparent 35%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-9 h-9 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} />
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate flex items-center gap-1.5">
                {copy.title}
                <Sparkles size={14} className="opacity-80 shrink-0" />
              </h1>
            </div>
            <p className="text-[12px] sm:text-sm text-white/80 font-medium pl-[2.75rem]">
              {cartItems.length > 0
                ? copy.itemsCount(itemCount)
                : copy.subtitle}
            </p>
          </div>
          <Link
            href="/belanja"
            className="shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-[11px] font-semibold transition"
          >
            {copy.continueShopping}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-7 bg-white">
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium">
            {error}
          </div>
        ) : null}

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-3">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isItemUpdating = updatingItemId === item.id;
                const unit = parseFloat(product.price || "0");
                const line = unit * item.quantity;
                const stock = product.quantity;
                const img = getProductImageUrl(product.image_1);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                  >
                    <Link
                      href={`/belanja/${item.product_id}`}
                      className="w-full sm:w-24 h-28 sm:h-24 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100"
                      style={{ backgroundColor: `${brand}12` }}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          className="max-h-full max-w-full object-contain p-2"
                          alt={productLocaleText(product, "title", locale)}
                        />
                      ) : (
                        <Package className="text-gray-300" size={28} />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/belanja/${item.product_id}`}
                            className="font-bold text-gray-900 hover:underline line-clamp-2 text-[15px]"
                          >
                            {productLocaleText(product, "title", locale)}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatProductPrice(product.price)}{" "}
                            <span className="text-gray-400">
                              · {copy.perItem}
                            </span>
                          </p>
                          {typeof stock === "number" ? (
                            <p className="text-[11px] font-medium text-gray-400 mt-1">
                              {copy.stockLeft(stock)}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isItemUpdating}
                          className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition disabled:opacity-40"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.quantity,
                                -1,
                                item.id,
                                stock,
                              )
                            }
                            disabled={isItemUpdating}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[28px] text-center text-sm font-bold text-gray-900">
                            {isItemUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.quantity,
                                1,
                                item.id,
                                stock,
                              )
                            }
                            disabled={
                              isItemUpdating ||
                              (typeof stock === "number" &&
                                item.quantity >= stock)
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            {copy.lineTotal}
                          </p>
                          <p
                            className="text-base font-bold"
                            style={{ color: brand }}
                          >
                            {formatProductPrice(line)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  {copy.subtotalLine}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{copy.itemsCount(itemCount)}</span>
                  <span className="font-semibold text-gray-900">
                    {formatProductPrice(total)}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      {copy.totalLabel}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatProductPrice(total)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition"
                  style={{ backgroundColor: brand }}
                >
                  {copy.checkoutButton}
                  <ArrowRight size={16} />
                </button>
                <Link
                  href="/belanja"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition sm:hidden"
                >
                  {copy.continueShopping}
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
            <div
              className="mx-auto w-16 h-16 rounded-[22px] flex items-center justify-center text-white mb-4"
              style={{ backgroundColor: brand }}
            >
              <ShoppingBag size={28} />
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">
              {copy.emptyCart}
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              {copy.emptyHint}
            </p>
            <Link
              href="/belanja"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition"
              style={{ backgroundColor: brand }}
            >
              {copy.shopNow}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      ) : null}

      {/* Modal */}
      {modal.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mt-2">
              <div className="flex justify-center mb-4">
                {modal.type === "success" && (
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                )}
                {(modal.type === "warning" || modal.type === "confirm") && (
                  <AlertTriangle className="w-14 h-14 text-amber-500" />
                )}
                {modal.type === "error" && (
                  <XCircle className="w-14 h-14 text-rose-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {modal.type === "confirm"
                  ? copy.modalConfirmTitle
                  : modal.type === "success"
                    ? copy.modalSuccessTitle
                    : copy.modalErrorTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{modal.message}</p>
              <div className="flex gap-3">
                {modal.type === "confirm" ? (
                  <>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50"
                    >
                      {copy.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const action = modal.confirmAction;
                        closeModal();
                        action?.();
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700"
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
      ) : null}
    </div>
  );
}

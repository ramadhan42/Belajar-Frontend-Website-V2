"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Package,
  ChevronRight,
  ChevronLeft,
  Trash2,
  CheckCircle,
  History,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  getShoppingHistory,
  ShoppingHistoryItem,
  formatProductPrice,
  getProductImageUrl,
  removeHistoryItem,
  orderGrandTotal,
} from "@/lib/api";
import { SITE_STRINGS } from "@/components/constans/strings";
import { useLocale } from "@/context/LocaleContext";
import { L, productLocaleText } from "@/lib/localeText";
import ProfileBrandShell, {
  useProfileBrand,
} from "@/components/profile/ProfileBrandShell";
import { profileBrandGradient } from "@/components/profile/brand";
import {
  normalizePaymentStatus,
  paymentStatusBadgeClass,
  paymentStatusLabel,
} from "@/lib/paymentStatus";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

interface GroupedHistory {
  groupId: string;
  created_at: string;
  items: ShoppingHistoryItem[];
  totalGroupPrice: number;
  totalQuantity: number;
}

interface ModalState {
  isOpen: boolean;
  type: "confirm" | "loading" | "success" | "error";
  variant?: "delete" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function HistoryPage() {
  const { locale } = useLocale();
  const brand = useProfileBrand();

  const copy = useMemo(
    () => ({
      loading: L(locale, "Memuat riwayat belanja...", "Loading order history..."),
      loadFailed: L(
        locale,
        "Gagal memuat riwayat belanja. Pastikan Anda sudah login.",
        "Failed to load order history. Make sure you are logged in.",
      ),
      retry: L(locale, "Coba Lagi", "Try Again"),
      title: L(locale, "Riwayat Belanja", "Order History"),
      subtitle: L(
        locale,
        "Pantau status pesanan dan konfirmasi penerimaan paket.",
        "Track order status and confirm when your package arrives.",
      ),
      unknownDate: L(locale, "Tanggal tidak diketahui", "Unknown date"),
      itemsUnit: L(locale, "Barang", "Items"),
      otherProducts: L(locale, "Produk Lain", "Other Products"),
      product: L(locale, "Produk", "Product"),
      receivedConfirmTitle: L(locale, "Pesanan Diterima", "Order Received"),
      receivedConfirmMessage: L(
        locale,
        "Apakah Anda yakin telah menerima paket pesanan ini dengan baik? Jika ya, pesanan akan diselesaikan.",
        "Are you sure you have received this order package in good condition? If so, the order will be marked as completed.",
      ),
      receivedConfirmButton: L(locale, "Ya, Terima Pesanan", "Yes, Order Received"),
      processingTitle: L(locale, "Memproses...", "Processing..."),
      completingOrderMessage: L(
        locale,
        "Sedang menyelesaikan pesanan Anda...",
        "Completing your order...",
      ),
      successTitle: L(locale, "Berhasil!", "Success!"),
      orderCompletedMessage: L(
        locale,
        "Pesanan telah berhasil diselesaikan.",
        "The order has been completed successfully.",
      ),
      failedTitle: L(locale, "Gagal", "Failed"),
      confirmErrorMessage: L(
        locale,
        "Terjadi kesalahan saat mengonfirmasi pesanan. Coba lagi.",
        "An error occurred while confirming the order. Please try again.",
      ),
      deleteHistoryTitle: L(locale, "Hapus Riwayat", "Delete History"),
      deleteHistoryMessage: L(
        locale,
        "Apakah Anda yakin ingin menghapus seluruh pesanan ini dari riwayat belanja?",
        "Are you sure you want to remove this entire order from your shopping history?",
      ),
      confirmDeleteButton: L(locale, "Ya, Hapus", "Yes, Delete"),
      deletingHistoryMessage: L(
        locale,
        "Sedang menghapus riwayat pesanan Anda...",
        "Removing your order history...",
      ),
      historyDeletedMessage: L(
        locale,
        "Riwayat pesanan telah dihapus.",
        "Order history has been removed.",
      ),
      deleteErrorMessage: L(
        locale,
        "Terjadi kesalahan saat menghapus riwayat. Coba lagi.",
        "An error occurred while removing the history. Please try again.",
      ),
      statusWaiting: L(locale, "Menunggu Konfirmasi", "Awaiting Confirmation"),
      statusPacking: L(locale, "Dikemas", "Packing"),
      statusShipping: L(locale, "Dalam Perjalanan", "In Transit"),
      statusArrived: L(locale, "Sampai Tujuan", "Arrived"),
      statusDone: L(locale, "Selesai", "Completed"),
      confirmReceivedTitleAttr: L(
        locale,
        "Konfirmasi Pesanan Diterima",
        "Confirm Order Received",
      ),
      receivedLabel: L(locale, "Diterima", "Received"),
      deleteHistoryTitleAttr: L(
        locale,
        "Hapus Riwayat Pesanan",
        "Delete Order History",
      ),
      pagePrefix: L(locale, "Halaman", "Page"),
      pageOf: L(locale, "dari", "of"),
      emptyTitle: L(locale, "Riwayat belanja kosong", "Order history is empty"),
      emptySubtitle: L(
        locale,
        "Belum ada pembelian. Mulai jelajahi koleksi aroma Evomi.",
        "No purchases yet. Start exploring Evomi scents.",
      ),
      startShopping: L(locale, "Mulai Belanja", "Start Shopping"),
      cancel: L(locale, "Batal", "Cancel"),
      close: L(locale, "Tutup", "Close"),
      dateLocale: locale === "en" ? "en-US" : "id-ID",
      confirmFailedApi: L(
        locale,
        "Gagal konfirmasi pesanan",
        "Failed to confirm order",
      ),
      ordersCount: (n: number) =>
        L(locale, `${n} pesanan`, `${n} order${n === 1 ? "" : "s"}`),
      viewDetail: L(locale, "Lihat detail", "View details"),
    }),
    [locale],
  );

  const [history, setHistory] = useState<GroupedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toast, setToast] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "loading",
    title: "",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getShoppingHistory(locale);

      const groupedObj = data.reduce(
        (acc: Record<string, GroupedHistory>, item: ShoppingHistoryItem) => {
          const key = item.created_at || "unknown";

          if (!acc[key]) {
            acc[key] = {
              groupId: String(item.id),
              created_at: key,
              items: [],
              totalGroupPrice: 0,
              totalQuantity: 0,
            };
          }

          acc[key].items.push(item);

          // produk + ongkir − promo (sekali), bukan total_price + ongkir hardcode
          acc[key].totalGroupPrice += orderGrandTotal(item);
          acc[key].totalQuantity += item.quantity || 1;

          return acc;
        },
        {},
      );

      const groupedArray = Object.values(groupedObj).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setHistory(groupedArray);
      window.dispatchEvent(new Event("history_updated"));
    } catch (err: any) {
      setError(err.message || copy.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(history.length / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [history.length, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          label: copy.statusWaiting,
          color: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
      case "pengemasan":
        return {
          label: copy.statusPacking,
          color: "bg-sky-50 text-sky-800 border-sky-200",
          dot: "bg-sky-500",
        };
      case "dalam_perjalanan":
        return {
          label: copy.statusShipping,
          color: "bg-indigo-50 text-indigo-800 border-indigo-200",
          dot: "bg-indigo-500",
        };
      case "diterima":
        return {
          label: copy.statusArrived,
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "selesai":
        return {
          label: copy.statusDone,
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
      default:
        return {
          label: status || copy.statusDone,
          color: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const confirmReceipt = (e: React.MouseEvent, group: GroupedHistory) => {
    e.preventDefault();
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "confirm",
      variant: "confirm",
      title: copy.receivedConfirmTitle,
      message: copy.receivedConfirmMessage,
      confirmText: copy.receivedConfirmButton,
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          variant: "confirm",
          title: copy.processingTitle,
          message: copy.completingOrderMessage,
        });

        try {
          const response = await fetch(
            `${BASE_URL}/api/orders/${group.groupId}/confirm`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            },
          );

          if (!response.ok) throw new Error(copy.confirmFailedApi);

          setHistory((prev) =>
            prev.map((g) => {
              if (g.groupId === group.groupId) {
                return {
                  ...g,
                  items: g.items.map((i) => ({ ...i, status: "diterima" })),
                };
              }
              return g;
            }),
          );

          closeModal();
          showToast(copy.orderCompletedMessage);
        } catch {
          setModal({
            isOpen: true,
            type: "error",
            variant: "confirm",
            title: copy.failedTitle,
            message: copy.confirmErrorMessage,
          });
        }
      },
    });
  };

  const confirmDeleteGroup = (e: React.MouseEvent, group: GroupedHistory) => {
    e.preventDefault();
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "confirm",
      variant: "delete",
      title: copy.deleteHistoryTitle,
      message: copy.deleteHistoryMessage,
      confirmText: copy.confirmDeleteButton,
      onConfirm: async () => {
        setModal({
          isOpen: true,
          type: "loading",
          variant: "delete",
          title: copy.processingTitle,
          message: copy.deletingHistoryMessage,
        });

        try {
          await Promise.all(group.items.map((i) => removeHistoryItem(i.id)));
          setHistory((prev) => prev.filter((g) => g.groupId !== group.groupId));
          window.dispatchEvent(new Event("history_updated"));
          closeModal();
          showToast(copy.historyDeletedMessage);
        } catch {
          setModal({
            isOpen: true,
            type: "error",
            variant: "delete",
            title: copy.failedTitle,
            message: copy.deleteErrorMessage,
          });
        }
      },
    });
  };

  if (error) {
    return (
      <ProfileBrandShell
        title={copy.title}
        subtitle={copy.subtitle}
        icon={History}
      >
        <div className="bg-white rounded-2xl border border-rose-100 p-10 text-center">
          <p className="text-rose-600 mb-4 font-medium text-sm">{error}</p>
          <button
            onClick={() => fetchHistory()}
            className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            {copy.retry}
          </button>
        </div>
      </ProfileBrandShell>
    );
  }

  return (
    <>
      <ProfileBrandShell
        title={copy.title}
        subtitle={copy.subtitle}
        icon={History}
        loading={isLoading}
        loadingText={copy.loading}
        headerRight={
          history.length > 0 ? (
            <span className="shrink-0 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
              {copy.ordersCount(history.length)}
            </span>
          ) : null
        }
      >
        {history.length > 0 ? (
          <div className="space-y-3">
            {currentItems.map((group) => {
              const date = group.created_at
                ? new Date(group.created_at).toLocaleDateString(copy.dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : copy.unknownDate;

              const firstItem = group.items[0];
              const isNumericId = /^\d+$/.test(group.groupId);
              const invoiceId = isNumericId
                ? `#INV-${group.groupId}`
                : `#${group.groupId.toUpperCase()}`;

              const currentStatus = (firstItem as any).status || "selesai";
              const statusConfig = getStatusConfig(currentStatus);
              const imageUrl = firstItem.product
                ? getProductImageUrl(firstItem.product.image_1)
                : null;
              const extraItemsCount = group.items.length - 1;

              return (
                <Link
                  href={`/profile/history/${group.groupId}`}
                  key={group.groupId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl border border-gray-100 bg-white hover:border-slate-200 transition-all gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-4 w-full sm:w-auto overflow-hidden">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative p-1.5 border border-white/40"
                      style={{ backgroundColor: `${brand}14` }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productLocaleText(
                            firstItem.product,
                            "title",
                            locale,
                            copy.product,
                          )}
                          className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}

                      {extraItemsCount > 0 && (
                        <span className="absolute bottom-1 right-1 bg-slate-900/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          +{extraItemsCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-0.5">
                      <p
                        className="font-bold text-xs mb-1 tracking-wide"
                        style={{ color: brand }}
                      >
                        {invoiceId}
                      </p>

                      {firstItem.product && (
                        <p className="font-semibold text-slate-900 text-[15px] truncate mb-1.5">
                          {productLocaleText(firstItem.product, "title", locale)}{" "}
                          {extraItemsCount > 0 && (
                            <span className="text-slate-500 font-normal text-sm">
                              (+{extraItemsCount} {copy.otherProducts})
                            </span>
                          )}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-500">
                        <span>{date}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                        <span>
                          {group.totalQuantity} {copy.itemsUnit}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                        <span className="font-bold text-slate-900">
                          {formatProductPrice(group.totalGroupPrice.toString())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${paymentStatusBadgeClass(
                          normalizePaymentStatus(
                            (firstItem as any).payment_status,
                          ),
                        )}`}
                      >
                        {paymentStatusLabel(
                          normalizePaymentStatus(
                            (firstItem as any).payment_status,
                          ),
                          locale === "en" ? "en" : "id",
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                        />
                        {statusConfig.label}
                      </span>
                    </div>

                    {currentStatus === "dalam_perjalanan" && (
                      <button
                        type="button"
                        onClick={(e) => confirmReceipt(e, group)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-colors z-10"
                        title={copy.confirmReceivedTitleAttr}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {copy.receivedLabel}
                        </span>
                      </button>
                    )}

                    {(currentStatus === "diterima" ||
                      currentStatus === "selesai") && (
                      <button
                        type="button"
                        onClick={(e) => confirmDeleteGroup(e, group)}
                        className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors z-10 bg-rose-50 border border-rose-100"
                        title={copy.deleteHistoryTitleAttr}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                      {copy.viewDetail}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {copy.pagePrefix}{" "}
                  <span className="font-bold" style={{ color: brand }}>
                    {currentPage}
                  </span>{" "}
                  {copy.pageOf} {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${brand}14` }}
            >
              <ShoppingBag className="w-7 h-7" style={{ color: brand }} />
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
              {copy.startShopping}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </ProfileBrandShell>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-white/20"
            style={{
              background: profileBrandGradient(brand),
            }}
          >
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15">
              {modal.type === "confirm" &&
                (modal.variant === "delete" ? (
                  <Trash2 className="w-7 h-7 text-amber-300" />
                ) : (
                  <CheckCircle className="w-7 h-7 text-emerald-300" />
                ))}
              {modal.type === "success" && (
                <CheckCircle className="w-7 h-7 text-emerald-300" />
              )}
              {modal.type === "error" && (
                <Trash2 className="w-7 h-7 text-rose-300" />
              )}
              {modal.type === "loading" && (
                <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {modal.title}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {modal.message}
              </p>
            </div>

            {modal.type === "confirm" && (
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full font-semibold py-3 rounded-xl text-sm bg-white/15 text-white hover:bg-white/25 transition"
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  onClick={modal.onConfirm}
                  className={`w-full font-semibold py-3 rounded-xl text-sm text-white transition ${
                    modal.variant === "delete"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {modal.confirmText}
                </button>
              </div>
            )}
            {(modal.type === "success" || modal.type === "error") && (
              <button
                type="button"
                onClick={closeModal}
                className="w-full mt-1 bg-white font-bold py-3 rounded-xl text-sm transition hover:bg-blue-50"
                style={{ color: brand }}
              >
                {copy.close}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

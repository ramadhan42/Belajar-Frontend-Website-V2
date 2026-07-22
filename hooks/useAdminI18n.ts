"use client";

import { useCallback, useMemo } from "react";
import { useCms } from "@/context/CmsContext";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";

/**
 * Admin UI copy — CMS page `admin` + locale-aware fallbacks.
 * Same LocaleContext / CmsProvider as the storefront.
 */
export function useAdminI18n() {
  const { locale } = useLocale();
  const { tAdmin, ready } = useCms();

  const t = useCallback(
    (section: string, key: string, id: string, en: string) =>
      tAdmin(section, key, L(locale, id, en)),
    [locale, tAdmin],
  );

  const common = useMemo(
    () => ({
      save: t("common", "save", "Simpan", "Save"),
      save_changes: t(
        "common",
        "save_changes",
        "Simpan Perubahan",
        "Save Changes",
      ),
      saving: t("common", "saving", "Menyimpan...", "Saving..."),
      cancel: t("common", "cancel", "Batal", "Cancel"),
      edit: t("common", "edit", "Edit", "Edit"),
      delete: t("common", "delete", "Hapus", "Delete"),
      add: t("common", "add", "Tambah", "Add"),
      search: t("common", "search", "Cari", "Search"),
      actions: t("common", "actions", "Aksi", "Actions"),
      loading: t("common", "loading", "Memuat...", "Loading..."),
      refresh: t("common", "refresh", "Refresh Data", "Refresh Data"),
      yes_delete: t("common", "yes_delete", "Ya, Hapus", "Yes, Delete"),
      confirm_delete: t(
        "common",
        "confirm_delete",
        "Hapus data?",
        "Delete this data?",
      ),
      empty: t("common", "empty", "Tidak ada data.", "No data found."),
      status: t("common", "status", "Status", "Status"),
      user: t("common", "user", "Pengguna", "User"),
      product: t("common", "product", "Produk", "Product"),
      price: t("common", "price", "Harga", "Price"),
      quantity: t("common", "quantity", "Jumlah", "Qty"),
      date: t("common", "date", "Tanggal", "Date"),
      email: t("common", "email", "Email", "Email"),
      name: t("common", "name", "Nama", "Name"),
      id: t("common", "id", "ID", "ID"),
      reply: t("common", "reply", "Balas", "Reply"),
      close: t("common", "close", "Tutup", "Close"),
      back: t("common", "back", "Kembali", "Back"),
    }),
    [t],
  );

  return { locale, ready, t, common, tAdmin };
}

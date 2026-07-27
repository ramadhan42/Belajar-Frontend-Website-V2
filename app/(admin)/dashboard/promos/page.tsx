"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { getAdminHeaders, formatProductPrice, type Promo } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import AdminModal from "@/components/admin/AdminModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";

type FormState = {
  harga_promo: string;
  tanggal_berlaku_promo: string;
  tanggal_berakhir_promo: string;
};

const emptyForm: FormState = {
  harga_promo: "",
  tanggal_berlaku_promo: "",
  tanggal_berakhir_promo: "",
};

function toInputDate(value?: string | null): string {
  if (!value) return "";
  // Accept ISO datetime or YYYY-MM-DD
  return String(value).slice(0, 10);
}

function formatDisplayDate(value?: string | null, locale = "id"): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(
      locale === "en" ? "en-US" : "id-ID",
      { day: "numeric", month: "short", year: "numeric" },
    );
  } catch {
    return String(value).slice(0, 10);
  }
}

function isPromoActive(promo: Promo): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = promo.tanggal_berlaku_promo
    ? new Date(toInputDate(promo.tanggal_berlaku_promo))
    : null;
  const end = promo.tanggal_berakhir_promo
    ? new Date(toInputDate(promo.tanggal_berakhir_promo))
    : null;
  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);
  if (start && today < start) return false;
  if (end && today > end) return false;
  return Boolean(start);
}

export default function PromosPage() {
  const { t, locale, common } = useAdminI18n();
  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<Promo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/promos`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat promo");
      }
      setPromos(data.data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t(
              "promos",
              "load_error",
              "Gagal memuat data promo.",
              "Failed to load promo data.",
            );
      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = promos.filter((p) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      String(p.harga_promo).includes(q) ||
      toInputDate(p.tanggal_berlaku_promo).includes(q) ||
      toInputDate(p.tanggal_berakhir_promo).includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openAdd = () => {
    setModalMode("add");
    setSelected(null);
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      ...emptyForm,
      tanggal_berlaku_promo: today,
      tanggal_berakhir_promo: today,
    });
    setIsModalOpen(true);
  };

  const openEdit = (promo: Promo) => {
    setModalMode("edit");
    setSelected(promo);
    setForm({
      harga_promo: String(promo.harga_promo ?? ""),
      tanggal_berlaku_promo: toInputDate(promo.tanggal_berlaku_promo),
      tanggal_berakhir_promo: toInputDate(promo.tanggal_berakhir_promo),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        harga_promo: Number(form.harga_promo),
        tanggal_berlaku_promo: form.tanggal_berlaku_promo,
        tanggal_berakhir_promo: form.tanggal_berakhir_promo,
      };

      const url =
        modalMode === "add"
          ? `${baseUrl}/api/admin/promos`
          : `${baseUrl}/api/admin/promos/${selected?.id}`;

      const res = await fetch(url, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const firstError =
          data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat()?.[0]
            : null;
        throw new Error(
          (typeof firstError === "string" && firstError) ||
            data.message ||
            "Gagal menyimpan promo",
        );
      }

      showNotification(
        modalMode === "add"
          ? t(
              "promos",
              "created",
              "Promo berhasil ditambahkan.",
              "Promo added successfully.",
            )
          : t(
              "promos",
              "updated",
              "Promo berhasil diperbarui.",
              "Promo updated successfully.",
            ),
        "success",
      );
      setIsModalOpen(false);
      await fetchPromos();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menyimpan",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/admin/promos/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: getAdminHeaders(),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus promo");
      }
      showNotification(
        t(
          "promos",
          "deleted",
          "Promo berhasil dihapus.",
          "Promo deleted successfully.",
        ),
        "success",
      );
      setDeleteTarget(null);
      await fetchPromos();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menghapus",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {notification ? (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {notification.message}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tag size={28} />
            {t("promos", "title", "Promo", "Promos")}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            {t(
              "promos",
              "subtitle",
              "Kelola potongan harga aktif di halaman belanja details.",
              "Manage discounts shown on the product detail page.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition shadow-sm"
        >
          <Plus size={16} />
          {t("promos", "add", "Tambah Promo", "Add Promo")}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t(
                "promos",
                "search_ph",
                "Cari nominal atau tanggal...",
                "Search amount or date...",
              )}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("promos", "col_amount", "Harga Promo", "Promo Amount")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("promos", "col_start", "Berlaku", "Starts")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("promos", "col_end", "Berakhir", "Ends")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("promos", "col_status", "Status", "Status")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  {t("promos", "col_actions", "Aksi", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((promo) => {
                const active = isPromoActive(promo);
                return (
                  <tr
                    key={promo.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <Tag size={16} />
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatProductPrice(promo.harga_promo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDisplayDate(promo.tanggal_berlaku_promo, locale)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDisplayDate(
                          promo.tanggal_berakhir_promo,
                          locale,
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {active
                          ? t("promos", "status_active", "Aktif", "Active")
                          : t(
                              "promos",
                              "status_inactive",
                              "Nonaktif",
                              "Inactive",
                            )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(promo)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 transition shadow-sm"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(promo)}
                          className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-sm text-gray-400 font-medium">
                      {t(
                        "promos",
                        "empty",
                        "Belum ada data promo.",
                        "No promo data yet.",
                      )}
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {filtered.length > 0 ? (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/50">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
              >
                Prev
              </button>
              <div className="text-sm font-bold text-gray-700 min-w-[80px] text-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                {currentPage}{" "}
                <span className="text-gray-400 font-medium mx-1">/</span>{" "}
                {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        panelClassName="max-w-lg"
      >
        <div className="bg-white w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">
              {modalMode === "add"
                ? t("promos", "add", "Tambah Promo", "Add Promo")
                : t("promos", "edit", "Edit Promo", "Edit Promo")}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t(
                  "promos",
                  "col_amount",
                  "Harga Promo (Rp)",
                  "Promo Amount (Rp)",
                )}
              </span>
              <input
                required
                type="number"
                min={0}
                step="1000"
                value={form.harga_promo}
                onChange={(e) =>
                  setForm({ ...form, harga_promo: e.target.value })
                }
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="15000"
              />
              <span className="mt-1 block text-[11px] text-gray-400">
                {t(
                  "promos",
                  "amount_hint",
                  "Potongan dari total produk + ongkir di belanja details.",
                  "Discount from product + shipping total on product detail.",
                )}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("promos", "col_start", "Tanggal Berlaku", "Start Date")}
                </span>
                <input
                  required
                  type="date"
                  value={form.tanggal_berlaku_promo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tanggal_berlaku_promo: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("promos", "col_end", "Tanggal Berakhir", "End Date")}
                </span>
                <input
                  required
                  type="date"
                  min={form.tanggal_berlaku_promo || undefined}
                  value={form.tanggal_berakhir_promo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tanggal_berakhir_promo: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                {t("common", "cancel", "Batal", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition disabled:opacity-60"
              >
                {saving
                  ? t("common", "saving", "Menyimpan...", "Saving...")
                  : t("common", "save", "Simpan", "Save")}
              </button>
            </div>
          </form>
        </div>
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t("promos", "delete_title", "Hapus Promo?", "Delete Promo?")}
        message={t(
          "promos",
          "delete_desc",
          "Promo ini akan dihapus permanen dan tidak lagi diterapkan di belanja details.",
          "This promo will be permanently deleted and no longer applied on product detail.",
        )}
        confirmLabel={t("common", "delete", "Hapus", "Delete")}
        cancelLabel={common.cancel}
      />
    </div>
  );
}

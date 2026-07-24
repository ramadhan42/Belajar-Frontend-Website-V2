"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Truck,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { getAdminHeaders } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import AdminModal from "@/components/admin/AdminModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";

interface Kurir {
  id: number;
  nama: string;
  jenis: string;
  harga: number | string;
  destinasi: string;
  estimasi_hari?: number | null;
  is_active?: boolean;
}

type FormState = {
  nama: string;
  jenis: string;
  harga: string;
  destinasi: string;
  estimasi_hari: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  nama: "",
  jenis: "",
  harga: "",
  destinasi: "",
  estimasi_hari: "3",
  is_active: true,
};

export default function KurirsPage() {
  const { t, common } = useAdminI18n();
  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const [kurirs, setKurirs] = useState<Kurir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<Kurir | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Kurir | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchKurirs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/kurirs?all=1`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat kurir");
      }
      setKurirs(data.data || []);
    } catch (err: any) {
      showNotification(
        err?.message ||
          t(
            "kurirs",
            "load_error",
            "Gagal memuat data kurir.",
            "Failed to load courier data.",
          ),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKurirs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = kurirs.filter((k) => {
    const q = searchTerm.toLowerCase();
    return (
      k.nama.toLowerCase().includes(q) ||
      k.jenis.toLowerCase().includes(q) ||
      k.destinasi.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedKurirs = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openAdd = () => {
    setModalMode("add");
    setSelected(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (kurir: Kurir) => {
    setModalMode("edit");
    setSelected(kurir);
    setForm({
      nama: kurir.nama,
      jenis: kurir.jenis,
      harga: String(kurir.harga ?? ""),
      destinasi: kurir.destinasi,
      estimasi_hari: String(kurir.estimasi_hari ?? 3),
      is_active: kurir.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama: form.nama.trim(),
        jenis: form.jenis.trim(),
        harga: Number(form.harga),
        destinasi: form.destinasi.trim(),
        estimasi_hari: Number(form.estimasi_hari) || 3,
        is_active: form.is_active,
      };

      const url =
        modalMode === "add"
          ? `${baseUrl}/api/admin/kurirs`
          : `${baseUrl}/api/admin/kurirs/${selected?.id}`;

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
            "Gagal menyimpan kurir",
        );
      }

      showNotification(
        modalMode === "add"
          ? t(
              "kurirs",
              "created",
              "Kurir berhasil ditambahkan.",
              "Courier added successfully.",
            )
          : t(
              "kurirs",
              "updated",
              "Kurir berhasil diperbarui.",
              "Courier updated successfully.",
            ),
        "success",
      );
      setIsModalOpen(false);
      await fetchKurirs();
    } catch (err: any) {
      showNotification(err?.message || "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/kurirs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus kurir");
      }
      showNotification(
        t(
          "kurirs",
          "deleted",
          "Kurir berhasil dihapus.",
          "Courier deleted successfully.",
        ),
        "success",
      );
      setDeleteTarget(null);
      await fetchKurirs();
    } catch (err: any) {
      showNotification(err?.message || "Gagal menghapus", "error");
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
            <Truck size={28} />
            {t("kurirs", "title", "Kurir", "Couriers")}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            {t(
              "kurirs",
              "subtitle",
              "Kelola daftar kurir pengiriman untuk halaman belanja.",
              "Manage shipping couriers for the shop pages.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition shadow-sm"
        >
          <Plus size={16} />
          {t("kurirs", "add", "Tambah Kurir", "Add Courier")}
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
                "kurirs",
                "search_ph",
                "Cari nama, jenis, atau destinasi...",
                "Search name, type, or destination...",
              )}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("kurirs", "col_name", "Nama", "Name")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("kurirs", "col_type", "Jenis", "Type")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("kurirs", "col_price", "Harga", "Price")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  {t("kurirs", "col_dest", "Destinasi", "Destination")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("kurirs", "col_eta", "Estimasi (hari)", "ETA (days)")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  {common.status}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[120px]">
                  {common.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedKurirs.map((kurir) => (
                <tr
                  key={kurir.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {kurir.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{kurir.jenis}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Rp{Number(kurir.harga).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[220px] truncate">
                    {kurir.destinasi}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {kurir.estimasi_hari ?? 3}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                        kurir.is_active !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {kurir.is_active !== false
                        ? t("kurirs", "active", "Aktif", "Active")
                        : t("kurirs", "inactive", "Nonaktif", "Inactive")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(kurir)}
                        className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 bg-white shadow-sm transition"
                        title={common.edit}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(kurir)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 bg-white shadow-sm transition"
                        title={common.delete}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedKurirs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Truck size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      {t(
                        "kurirs",
                        "empty",
                        "Belum ada data kurir.",
                        "No courier data yet.",
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
                  ? t("kurirs", "add", "Tambah Kurir", "Add Courier")
                  : t("kurirs", "edit", "Edit Kurir", "Edit Courier")}
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
                  {t("kurirs", "col_name", "Nama", "Name")}
                </span>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="JNE Reguler"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("kurirs", "col_type", "Jenis", "Type")}
                </span>
                <input
                  required
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="REG / YES / Express"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t("kurirs", "col_price", "Harga", "Price")}
                  </span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="20000"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t("kurirs", "col_eta", "Estimasi (hari)", "ETA (days)")}
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={30}
                    value={form.estimasi_hari}
                    onChange={(e) =>
                      setForm({ ...form, estimasi_hari: e.target.value })
                    }
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t("kurirs", "col_dest", "Destinasi", "Destination")}
                </span>
                <input
                  required
                  value={form.destinasi}
                  onChange={(e) =>
                    setForm({ ...form, destinasi: e.target.value })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Seluruh Indonesia"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                {t("kurirs", "active", "Aktif", "Active")}
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                >
                  {saving ? common.loading : common.save}
                </button>
              </div>
            </form>
        </div>
      </AdminModal>

      <AdminConfirmModal
        open={!!deleteTarget}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={deleting}
        title={t("kurirs", "delete_title", "Hapus Kurir?", "Delete Courier?")}
        message={
          deleteTarget
            ? t(
                "kurirs",
                "delete_message",
                `Kurir "${deleteTarget.nama}" (${deleteTarget.jenis}) akan dihapus permanen dari daftar pengiriman.`,
                `Courier "${deleteTarget.nama}" (${deleteTarget.jenis}) will be permanently removed from shipping options.`,
              )
            : ""
        }
        confirmLabel={t("kurirs", "delete_confirm", "Ya, Hapus", "Yes, Delete")}
        cancelLabel={common.cancel}
      />
    </div>
  );
}

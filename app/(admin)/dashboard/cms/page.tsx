"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  CmsField,
  CmsPageKey,
  FaqItem,
  adminGetCmsPage,
  adminSaveCmsPage,
  adminGetFaqs,
  adminCreateFaq,
  adminUpdateFaq,
  adminDeleteFaq,
  uploadCmsImage,
  resolveCmsImage,
} from "@/lib/cms";

type TabKey = "beranda" | "faq" | "kontak" | "navfooter";

const TABS: { key: TabKey; label: string }[] = [
  { key: "beranda", label: "Beranda" },
  { key: "faq", label: "FAQ" },
  { key: "kontak", label: "Kontak" },
  { key: "navfooter", label: "Navbar / Footer" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  second: "Section 2 — Karakter",
  third: "Section 3 — Brand Values",
  fourth: "Section 4 — Thanks Card",
  fifth: "Section 5 — Produk",
  sixth: "Section 6 — Packaging",
  seventh: "Section 7 — CTA Kuis",
  header: "Header",
  info: "Info Kontak",
  menu: "Menu",
  bulletin: "Buletin",
  help: "Bantuan",
  social: "Sosial",
  legal: "Legal",
};

export default function CmsDashboardPage() {
  const [tab, setTab] = useState<TabKey>("beranda");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<CmsField[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3200);
  };

  const pageForTab = (t: TabKey): CmsPageKey | null => {
    if (t === "beranda") return "beranda";
    if (t === "kontak") return "kontak";
    if (t === "navfooter") return null;
    return null;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "faq") {
        setFaqs(await adminGetFaqs());
        setFields([]);
      } else if (tab === "navfooter") {
        const [nav, foot] = await Promise.all([
          adminGetCmsPage("navbar"),
          adminGetCmsPage("footer"),
        ]);
        setFields([...nav, ...foot]);
      } else {
        const page = pageForTab(tab);
        if (page) setFields(await adminGetCmsPage(page));
      }
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal memuat data CMS",
      );
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<string, CmsField[]> = {};
    for (const f of fields) {
      const gKey = `${f.page}::${f.section}`;
      if (!map[gKey]) map[gKey] = [];
      map[gKey].push(f);
    }
    return map;
  }, [fields]);

  const updateFieldValue = (index: number, value: string) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, value } : f)),
    );
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    try {
      const path = await uploadCmsImage(file);
      updateFieldValue(index, path);
      showNotice("success", "Gambar diunggah. Klik Simpan untuk apply.");
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Upload gagal",
      );
    }
  };

  const handleSavePage = async () => {
    setSaving(true);
    try {
      if (tab === "navfooter") {
        const navFields = fields
          .filter((f) => f.page === "navbar")
          .map((f) => ({
            section: f.section,
            key: f.key,
            type: f.type,
            value: f.value,
          }));
        const footFields = fields
          .filter((f) => f.page === "footer")
          .map((f) => ({
            section: f.section,
            key: f.key,
            type: f.type,
            value: f.value,
          }));
        await adminSaveCmsPage("navbar", navFields);
        await adminSaveCmsPage("footer", footFields);
      } else {
        const page = pageForTab(tab);
        if (!page) return;
        await adminSaveCmsPage(
          page,
          fields.map((f) => ({
            section: f.section,
            key: f.key,
            type: f.type,
            value: f.value,
          })),
        );
      }
      showNotice("success", "Konten berhasil disimpan.");
      await load();
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal menyimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (faq: FaqItem) => {
    try {
      await adminUpdateFaq(faq.id, {
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order,
        is_active: faq.is_active,
      });
      showNotice("success", "FAQ diperbarui.");
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal update FAQ",
      );
    }
  };

  const handleAddFaq = async () => {
    try {
      await adminCreateFaq({
        category: "Umum",
        question: "Pertanyaan baru",
        answer: "Jawaban baru",
        sort_order: faqs.length + 1,
        is_active: true,
      });
      showNotice("success", "FAQ ditambahkan.");
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal menambah FAQ",
      );
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      await adminDeleteFaq(id);
      showNotice("success", "FAQ dihapus.");
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal hapus FAQ",
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border ${
            notice.type === "success"
              ? "bg-white border-emerald-100 text-emerald-800"
              : "bg-white border-rose-100 text-rose-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <X className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-sm font-medium">{notice.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            CMS Konten
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit teks & gambar Beranda, FAQ, Kontak, Navbar, dan Footer. Layout
            tetap sama.
          </p>
        </div>
        {tab !== "faq" && (
          <button
            type="button"
            onClick={handleSavePage}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : tab === "faq" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" /> Tambah FAQ
            </button>
          </div>
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  FAQ #{faq.id}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  value={faq.category}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) =>
                        i === idx ? { ...f, category: e.target.value } : f,
                      ),
                    )
                  }
                  placeholder="Kategori"
                />
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  value={faq.sort_order}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) =>
                        i === idx
                          ? { ...f, sort_order: Number(e.target.value) || 0 }
                          : f,
                      ),
                    )
                  }
                  placeholder="Urutan"
                />
              </div>
              <input
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, question: e.target.value } : f,
                    ),
                  )
                }
                placeholder="Pertanyaan"
              />
              <textarea
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                value={faq.answer}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, answer: e.target.value } : f,
                    ),
                  )
                }
                placeholder="Jawaban"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={faq.is_active}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, i) =>
                          i === idx
                            ? { ...f, is_active: e.target.checked }
                            : f,
                        ),
                      )
                    }
                  />
                  Aktif
                </label>
                <button
                  type="button"
                  onClick={() => handleSaveFaq(faq)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold"
                >
                  Simpan FAQ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
          {Object.entries(grouped).map(([gKey, sectionFields]) => {
            const [page, section] = gKey.split("::");
            return (
              <div
                key={gKey}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  {page !== "beranda" && page !== "kontak"
                    ? `${page} · `
                    : ""}
                  {SECTION_LABELS[section] || section}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionFields.map((field) => {
                    const globalIndex = fields.findIndex(
                      (f) =>
                        f.page === field.page &&
                        f.section === field.section &&
                        f.key === field.key,
                    );
                    return (
                      <div
                        key={`${field.section}-${field.key}`}
                        className={
                          field.type === "text" || field.type === "image"
                            ? "md:col-span-2 space-y-1.5"
                            : "space-y-1.5"
                        }
                      >
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {field.key.replace(/_/g, " ")}
                        </label>
                        {field.type === "image" ? (
                          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                            <div className="h-16 w-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                              {resolveCmsImage(field.value) ? (
                                <img
                                  src={resolveCmsImage(field.value)!}
                                  alt={field.key}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(
                                  globalIndex,
                                  e.target.files?.[0] ?? null,
                                )
                              }
                              className="flex-1 text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white"
                            />
                          </div>
                        ) : field.type === "text" ? (
                          <textarea
                            rows={3}
                            value={field.value || ""}
                            onChange={(e) =>
                              updateFieldValue(globalIndex, e.target.value)
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        ) : (
                          <input
                            type="text"
                            value={field.value || ""}
                            onChange={(e) =>
                              updateFieldValue(globalIndex, e.target.value)
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  Locale,
  adminGetCmsPage,
  adminSaveCmsPage,
  adminGetFaqs,
  adminCreateFaq,
  adminUpdateFaq,
  adminDeleteFaq,
  uploadCmsImage,
  resolveCmsImage,
} from "@/lib/cms";
import { useAdminI18n } from "@/hooks/useAdminI18n";

type TabKey = "beranda" | "faq" | "kontak" | "navfooter" | "ui" | "admin";

const TAB_DEFS: { key: TabKey; id: string; en: string }[] = [
  { key: "beranda", id: "Beranda", en: "Home" },
  { key: "faq", id: "FAQ", en: "FAQ" },
  { key: "kontak", id: "Kontak", en: "Contact" },
  { key: "navfooter", id: "Navbar / Footer", en: "Navbar / Footer" },
  { key: "ui", id: "UI Website", en: "Website UI" },
  { key: "admin", id: "UI Admin", en: "Admin UI" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  second: "Section 2 — Karakter",
  third: "Section 3 — Brand Values",
  fourth: "Section 4 — Thanks Card",
  fifth: "Section 5 — Produk",
  sixth: "Section 6 — Packaging",
  seventh: "Section 7 — CTA Kuis",
  header: "Header",
  info: "Info Kontak",
  menu: "Menu",
  site: "Browser Tab",
  bulletin: "Buletin",
  help: "Bantuan",
  social: "Sosial",
  legal: "Legal",
  common: "Umum",
  nav: "Navbar Extra",
  auth: "Auth",
  belanja: "Belanja",
  faq: "FAQ UI",
  kontak: "Kontak Form",
  profile: "Profile",
  kuis: "Kuis",
  checkout: "Checkout",
  sidebar: "Sidebar",
  products: "Products",
  cms: "CMS",
};

/** Urutan section di tab Beranda: Hero → 2 → 3 → 4 → 5 → 6 → 7 */
const BERANDA_SECTION_ORDER = [
  "hero",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
];

const PAGE_ORDER = ["beranda", "kontak", "navbar", "footer", "ui", "admin"];

/** Prefer Browser Tab settings first inside Nav & Footer */
const NAVFOOTER_SECTION_ORDER = ["site", "menu", "bulletin", "help", "social", "legal"];

/** Urutan field di Hero Section CMS */
const HERO_FIELD_ORDER = [
  // Headline content + style
  "headline_1",
  "headline_1_color",
  "headline_1_fs_mobile",
  "headline_1_fs_desktop",
  "headline_2",
  "headline_2_color",
  "headline_2_fs_mobile",
  "headline_2_fs_desktop",
  "headline_3",
  "headline_3_color",
  "headline_3_fs_mobile",
  "headline_3_fs_desktop",
  "headline_4",
  "headline_4_color",
  "headline_4_fs_mobile",
  "headline_4_fs_desktop",
  "headline_pos_top_mobile",
  "headline_pos_top_desktop",
  "headline_pos_left_mobile",
  "headline_pos_left_desktop",
  // Badge left
  "badge_left",
  "badge_left_icon",
  "badge_left_fs_mobile",
  "badge_left_fs_desktop",
  "badge_left_icon_size_mobile",
  "badge_left_icon_size_desktop",
  "badge_left_left_mobile",
  "badge_left_left_desktop",
  "badge_left_top_mobile",
  "badge_left_top_desktop",
  // Badge right
  "badge_right",
  "badge_right_icon",
  "badge_right_fs_mobile",
  "badge_right_fs_desktop",
  "badge_right_icon_size_mobile",
  "badge_right_icon_size_desktop",
  "badge_right_right_mobile",
  "badge_right_right_desktop",
  "badge_right_bottom_mobile",
  "badge_right_bottom_desktop",
  // Products
  "product1_badge_label",
  "product1_badge_icon",
  "product1_image",
  "product1_size_mobile",
  "product1_size_desktop",
  "product1_left_mobile",
  "product1_left_desktop",
  "product1_top_mobile",
  "product1_top_desktop",
  "product1_right_mobile",
  "product1_right_desktop",
  "product1_rotate_mobile",
  "product1_rotate_desktop",
  "product2_badge_label",
  "product2_badge_icon",
  "product2_image",
  "product2_size_mobile",
  "product2_size_desktop",
  "product2_left_mobile",
  "product2_left_desktop",
  "product2_top_mobile",
  "product2_top_desktop",
  "product2_right_mobile",
  "product2_right_desktop",
  "product2_rotate_mobile",
  "product2_rotate_desktop",
  "product3_badge_label",
  "product3_badge_icon",
  "product3_image",
  "product3_size_mobile",
  "product3_size_desktop",
  "product3_left_mobile",
  "product3_left_desktop",
  "product3_top_mobile",
  "product3_top_desktop",
  "product3_right_mobile",
  "product3_right_desktop",
  "product3_rotate_mobile",
  "product3_rotate_desktop",
  "product4_badge_label",
  "product4_badge_icon",
  "product4_image",
  "product4_size_mobile",
  "product4_size_desktop",
  "product4_left_mobile",
  "product4_left_desktop",
  "product4_top_mobile",
  "product4_top_desktop",
  "product4_right_mobile",
  "product4_right_desktop",
  "product4_rotate_mobile",
  "product4_rotate_desktop",
  // Divider
  "marquee_text",
  "marquee_fs_mobile",
  "marquee_fs_desktop",
  "divider_icon_1",
  "divider_icon_1_size_mobile",
  "divider_icon_1_size_desktop",
  "divider_icon_2",
  "divider_icon_2_size_mobile",
  "divider_icon_2_size_desktop",
  "divider_icon_3",
  "divider_icon_3_size_mobile",
  "divider_icon_3_size_desktop",
  "divider_icon_4",
  "divider_icon_4_size_mobile",
  "divider_icon_4_size_desktop",
  "divider_bottom_mobile",
  "divider_bottom_desktop",
];

const FIELD_LABELS: Record<string, string> = {
  browser_title: "Judul Tab Browser",
  favicon: "Favicon (Icon Tab)",
  headline_1: "Headline 1",
  headline_1_color: "Warna Headline 1",
  headline_1_fs_mobile: "Headline 1 — Font Size Mobile",
  headline_1_fs_desktop: "Headline 1 — Font Size Desktop",
  headline_2: "Headline 2",
  headline_2_color: "Warna Headline 2",
  headline_2_fs_mobile: "Headline 2 — Font Size Mobile",
  headline_2_fs_desktop: "Headline 2 — Font Size Desktop",
  headline_3: "Headline 3",
  headline_3_color: "Warna Headline 3",
  headline_3_fs_mobile: "Headline 3 — Font Size Mobile",
  headline_3_fs_desktop: "Headline 3 — Font Size Desktop",
  headline_4: "Headline 4",
  headline_4_color: "Warna Headline 4",
  headline_4_fs_mobile: "Headline 4 — Font Size Mobile",
  headline_4_fs_desktop: "Headline 4 — Font Size Desktop",
  headline_pos_top_mobile: "Posisi Headline — Top Mobile",
  headline_pos_top_desktop: "Posisi Headline — Top Desktop",
  headline_pos_left_mobile: "Posisi Headline — Left Mobile",
  headline_pos_left_desktop: "Posisi Headline — Left Desktop",

  badge_left: "Teks Badge Kiri",
  badge_left_icon: "Icon Badge Kiri",
  badge_left_fs_mobile: "Badge Kiri — Font Size Mobile",
  badge_left_fs_desktop: "Badge Kiri — Font Size Desktop",
  badge_left_icon_size_mobile: "Badge Kiri — Size Icon Mobile",
  badge_left_icon_size_desktop: "Badge Kiri — Size Icon Desktop",
  badge_left_left_mobile: "Badge Kiri — Posisi Left Mobile",
  badge_left_left_desktop: "Badge Kiri — Posisi Left Desktop",
  badge_left_top_mobile: "Badge Kiri — Posisi Top Mobile",
  badge_left_top_desktop: "Badge Kiri — Posisi Top Desktop",

  badge_right: "Teks Badge Kanan",
  badge_right_icon: "Icon Badge Kanan",
  badge_right_fs_mobile: "Badge Kanan — Font Size Mobile",
  badge_right_fs_desktop: "Badge Kanan — Font Size Desktop",
  badge_right_icon_size_mobile: "Badge Kanan — Size Icon Mobile",
  badge_right_icon_size_desktop: "Badge Kanan — Size Icon Desktop",
  badge_right_right_mobile: "Badge Kanan — Posisi Right Mobile",
  badge_right_right_desktop: "Badge Kanan — Posisi Right Desktop",
  badge_right_bottom_mobile: "Badge Kanan — Posisi Bottom Mobile",
  badge_right_bottom_desktop: "Badge Kanan — Posisi Bottom Desktop",

  product1_badge_label: "Produk 1 — Teks Badge Label",
  product1_badge_icon: "Produk 1 — Icon Badge",
  product1_image: "Produk 1 — Gambar Botol",
  product1_size_mobile: "Produk 1 — Size Mobile (%)",
  product1_size_desktop: "Produk 1 — Size Desktop (%)",
  product1_left_mobile: "Produk 1 — Left Mobile",
  product1_left_desktop: "Produk 1 — Left Desktop",
  product1_top_mobile: "Produk 1 — Top Mobile",
  product1_top_desktop: "Produk 1 — Top Desktop",
  product1_right_mobile: "Produk 1 — Right Mobile",
  product1_right_desktop: "Produk 1 — Right Desktop",
  product1_rotate_mobile: "Produk 1 — Rotate Mobile (deg)",
  product1_rotate_desktop: "Produk 1 — Rotate Desktop (deg)",

  product2_badge_label: "Produk 2 — Teks Badge Label",
  product2_badge_icon: "Produk 2 — Icon Badge",
  product2_image: "Produk 2 — Gambar Botol",
  product2_size_mobile: "Produk 2 — Size Mobile (%)",
  product2_size_desktop: "Produk 2 — Size Desktop (%)",
  product2_left_mobile: "Produk 2 — Left Mobile",
  product2_left_desktop: "Produk 2 — Left Desktop",
  product2_top_mobile: "Produk 2 — Top Mobile",
  product2_top_desktop: "Produk 2 — Top Desktop",
  product2_right_mobile: "Produk 2 — Right Mobile",
  product2_right_desktop: "Produk 2 — Right Desktop",
  product2_rotate_mobile: "Produk 2 — Rotate Mobile (deg)",
  product2_rotate_desktop: "Produk 2 — Rotate Desktop (deg)",

  product3_badge_label: "Produk 3 — Teks Badge Label",
  product3_badge_icon: "Produk 3 — Icon Badge",
  product3_image: "Produk 3 — Gambar Botol",
  product3_size_mobile: "Produk 3 — Size Mobile (%)",
  product3_size_desktop: "Produk 3 — Size Desktop (%)",
  product3_left_mobile: "Produk 3 — Left Mobile",
  product3_left_desktop: "Produk 3 — Left Desktop",
  product3_top_mobile: "Produk 3 — Top Mobile",
  product3_top_desktop: "Produk 3 — Top Desktop",
  product3_right_mobile: "Produk 3 — Right Mobile",
  product3_right_desktop: "Produk 3 — Right Desktop",
  product3_rotate_mobile: "Produk 3 — Rotate Mobile (deg)",
  product3_rotate_desktop: "Produk 3 — Rotate Desktop (deg)",

  product4_badge_label: "Produk 4 — Teks Badge Label",
  product4_badge_icon: "Produk 4 — Icon Badge",
  product4_image: "Produk 4 — Gambar Botol",
  product4_size_mobile: "Produk 4 — Size Mobile (%)",
  product4_size_desktop: "Produk 4 — Size Desktop (%)",
  product4_left_mobile: "Produk 4 — Left Mobile",
  product4_left_desktop: "Produk 4 — Left Desktop",
  product4_top_mobile: "Produk 4 — Top Mobile",
  product4_top_desktop: "Produk 4 — Top Desktop",
  product4_right_mobile: "Produk 4 — Right Mobile",
  product4_right_desktop: "Produk 4 — Right Desktop",
  product4_rotate_mobile: "Produk 4 — Rotate Mobile (deg)",
  product4_rotate_desktop: "Produk 4 — Rotate Desktop (deg)",

  marquee_text: "Teks Divider Marquee",
  marquee_fs_mobile: "Marquee — Font Size Mobile",
  marquee_fs_desktop: "Marquee — Font Size Desktop",
  divider_icon_1: "Icon Divider 1",
  divider_icon_1_size_mobile: "Icon Divider 1 — Size Mobile",
  divider_icon_1_size_desktop: "Icon Divider 1 — Size Desktop",
  divider_icon_2: "Icon Divider 2",
  divider_icon_2_size_mobile: "Icon Divider 2 — Size Mobile",
  divider_icon_2_size_desktop: "Icon Divider 2 — Size Desktop",
  divider_icon_3: "Icon Divider 3",
  divider_icon_3_size_mobile: "Icon Divider 3 — Size Mobile",
  divider_icon_3_size_desktop: "Icon Divider 3 — Size Desktop",
  divider_icon_4: "Icon Divider 4",
  divider_icon_4_size_mobile: "Icon Divider 4 — Size Mobile",
  divider_icon_4_size_desktop: "Icon Divider 4 — Size Desktop",
  divider_bottom_mobile: "Divider — Posisi Bottom Mobile",
  divider_bottom_desktop: "Divider — Posisi Bottom Desktop",
};

function fieldLabel(key: string) {
  return FIELD_LABELS[key] || key.replace(/_/g, " ");
}

function sortSectionFields(section: string, sectionFields: CmsField[]) {
  if (section !== "hero") return sectionFields;
  return [...sectionFields].sort((a, b) => {
    const ai = HERO_FIELD_ORDER.indexOf(a.key);
    const bi = HERO_FIELD_ORDER.indexOf(b.key);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export default function CmsDashboardPage() {
  const { t, common } = useAdminI18n();
  const [tab, setTab] = useState<TabKey>("beranda");
  const [editLocale, setEditLocale] = useState<Locale>("id");
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
    if (t === "ui") return "ui";
    if (t === "admin") return "admin";
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
          adminGetCmsPage("navbar", editLocale),
          adminGetCmsPage("footer", editLocale),
        ]);
        setFields([...nav, ...foot]);
      } else {
        const page = pageForTab(tab);
        if (page) setFields(await adminGetCmsPage(page, editLocale));
      }
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "load_error", "Gagal memuat data CMS", "Failed to load CMS data"),
      );
    } finally {
      setLoading(false);
    }
  }, [tab, editLocale, t]);

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

  const sortedGroups = useMemo(() => {
    const sectionRank = (page: string, section: string) => {
      if (page === "beranda") {
        const idx = BERANDA_SECTION_ORDER.indexOf(section);
        return idx === -1 ? 999 : idx;
      }
      if (page === "navbar" || page === "footer") {
        const idx = NAVFOOTER_SECTION_ORDER.indexOf(section);
        return idx === -1 ? 999 : idx;
      }
      return 0;
    };

    return Object.entries(grouped).sort(([a], [b]) => {
      const [pageA, sectionA] = a.split("::");
      const [pageB, sectionB] = b.split("::");
      const pageDiff =
        (PAGE_ORDER.indexOf(pageA) === -1 ? 99 : PAGE_ORDER.indexOf(pageA)) -
        (PAGE_ORDER.indexOf(pageB) === -1 ? 99 : PAGE_ORDER.indexOf(pageB));
      if (pageDiff !== 0) return pageDiff;
      return sectionRank(pageA, sectionA) - sectionRank(pageB, sectionB);
    });
  }, [grouped]);

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
      showNotice(
        "success",
        t(
          "cms",
          "image_uploaded",
          "Gambar diunggah. Klik Simpan untuk apply.",
          "Image uploaded. Click Save to apply.",
        ),
      );
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "upload_error", "Upload gagal", "Upload failed"),
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
        await adminSaveCmsPage("navbar", navFields, editLocale);
        await adminSaveCmsPage("footer", footFields, editLocale);
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
          editLocale,
        );
      }
      showNotice(
        "success",
        t("cms", "content_saved", "Konten berhasil disimpan.", "Content saved successfully."),
      );
      await load();
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "save_error", "Gagal menyimpan", "Failed to save"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (faq: FaqItem) => {
    try {
      await adminUpdateFaq(faq.id, {
        category: faq.category,
        category_en: faq.category_en,
        question: faq.question,
        question_en: faq.question_en,
        answer: faq.answer,
        answer_en: faq.answer_en,
        sort_order: faq.sort_order,
        is_active: faq.is_active,
      });
      showNotice(
        "success",
        t("cms", "faq_updated", "FAQ diperbarui.", "FAQ updated."),
      );
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "faq_update_error", "Gagal update FAQ", "Failed to update FAQ"),
      );
    }
  };

  const handleAddFaq = async () => {
    try {
      await adminCreateFaq({
        category: "Umum",
        category_en: "General",
        question: "Pertanyaan baru",
        question_en: "New question",
        answer: "Jawaban baru",
        answer_en: "New answer",
        sort_order: faqs.length + 1,
        is_active: true,
      });
      showNotice(
        "success",
        t("cms", "faq_added", "FAQ ditambahkan.", "FAQ added."),
      );
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "faq_add_error", "Gagal menambah FAQ", "Failed to add FAQ"),
      );
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (
      !confirm(
        t("cms", "confirm_delete_faq", "Hapus FAQ ini?", "Delete this FAQ?"),
      )
    )
      return;
    try {
      await adminDeleteFaq(id);
      showNotice(
        "success",
        t("cms", "faq_deleted", "FAQ dihapus.", "FAQ deleted."),
      );
      setFaqs(await adminGetFaqs());
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error
          ? e.message
          : t("cms", "faq_delete_error", "Gagal hapus FAQ", "Failed to delete FAQ"),
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
            {t("cms", "title", "CMS Konten", "Content CMS")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "cms",
              "subtitle",
              "Edit teks & gambar (ID/EN). Layout tetap sama.",
              "Edit text & images (ID/EN). Layout stays the same.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tab !== "faq" && (
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-gray-100">
              {(["id", "en"] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setEditLocale(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    editLocale === loc
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          )}
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
            {common.save_changes}
          </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {TAB_DEFS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === tabItem.key
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t("cms", "tab_" + tabItem.key, tabItem.id, tabItem.en)}
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
              <Plus className="w-4 h-4" />{" "}
              {t("cms", "add_faq", "Tambah FAQ", "Add FAQ")}
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
                  placeholder={t("cms", "faq_category_id", "Kategori (ID)", "Category (ID)")}
                />
                <input
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  value={faq.category_en || ""}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) =>
                        i === idx ? { ...f, category_en: e.target.value } : f,
                      ),
                    )
                  }
                  placeholder={t("cms", "faq_category_en", "Category (EN)", "Category (EN)")}
                />
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm md:col-span-2"
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
                  placeholder={t("cms", "faq_sort_order", "Urutan", "Order")}
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
                placeholder={t("cms", "faq_question_id", "Pertanyaan (ID)", "Question (ID)")}
              />
              <input
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
                value={faq.question_en || ""}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, question_en: e.target.value } : f,
                    ),
                  )
                }
                placeholder={t("cms", "faq_question_en", "Question (EN)", "Question (EN)")}
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
                placeholder={t("cms", "faq_answer_id", "Jawaban (ID)", "Answer (ID)")}
              />
              <textarea
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                value={faq.answer_en || ""}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, answer_en: e.target.value } : f,
                    ),
                  )
                }
                placeholder={t("cms", "faq_answer_en", "Answer (EN)", "Answer (EN)")}
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
                  {t("cms", "faq_active", "Aktif", "Active")}
                </label>
                <button
                  type="button"
                  onClick={() => handleSaveFaq(faq)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold"
                >
                  {t("cms", "save_faq", "Simpan FAQ", "Save FAQ")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
          {sortedGroups.map(([gKey, sectionFields]) => {
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
                  {sortSectionFields(section, sectionFields).map((field) => {
                    const globalIndex = fields.findIndex(
                      (f) =>
                        f.page === field.page &&
                        f.section === field.section &&
                        f.key === field.key,
                    );
                    const isColorField = field.key.endsWith("_color");
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
                          {fieldLabel(field.key)}
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
                        ) : isColorField ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={
                                /^#[0-9A-Fa-f]{6}$/.test(field.value || "")
                                  ? field.value!
                                  : "#FFFFFF"
                              }
                              onChange={(e) =>
                                updateFieldValue(globalIndex, e.target.value)
                              }
                              className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer bg-white p-0.5"
                            />
                            <input
                              type="text"
                              value={field.value || ""}
                              onChange={(e) =>
                                updateFieldValue(globalIndex, e.target.value)
                              }
                              placeholder="#FFFFFF"
                              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 font-mono uppercase"
                            />
                          </div>
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

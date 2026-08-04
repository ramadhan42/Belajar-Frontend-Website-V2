"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Newspaper,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import {
  getAdminHeaders,
  getArticleImageUrl,
  type Article,
} from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import AdminModal from "@/components/admin/AdminModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import AdminSelect from "@/components/admin/AdminSelect";
import AdminTablePagination from "@/components/admin/AdminTablePagination";
import {
  CMS_FONT_FAMILY_OPTIONS,
  CMS_FONT_SIZE_OPTIONS,
  CMS_FONT_STYLE_OPTIONS,
  CMS_FONT_WEIGHT_OPTIONS,
  articleFontStyle,
  resolveCmsFontFamily,
} from "@/lib/cmsFonts";

type FormState = {
  title: string;
  title_en: string;
  slug: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string;
  title_font_family: string;
  title_font_weight: string;
  title_font_style: string;
  title_font_size: string;
  excerpt_font_family: string;
  excerpt_font_weight: string;
  excerpt_font_style: string;
  excerpt_font_size: string;
  content_font_family: string;
  content_font_weight: string;
  content_font_style: string;
  content_font_size: string;
};

const emptyForm: FormState = {
  title: "",
  title_en: "",
  slug: "",
  excerpt: "",
  excerpt_en: "",
  content: "",
  content_en: "",
  category: "parfum",
  author: "Evomi Editorial",
  is_published: true,
  published_at: "",
  title_font_family: "nohemi",
  title_font_weight: "700",
  title_font_style: "normal",
  title_font_size: "40",
  excerpt_font_family: "parkinsans",
  excerpt_font_weight: "400",
  excerpt_font_style: "normal",
  excerpt_font_size: "18",
  content_font_family: "parkinsans",
  content_font_weight: "400",
  content_font_style: "normal",
  content_font_size: "17",
};

function toInputDate(value?: string | null): string {
  if (!value) return "";
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

function articleToForm(article: Article): FormState {
  return {
    title: article.title || "",
    title_en: article.title_en || "",
    slug: article.slug || "",
    excerpt: article.excerpt || "",
    excerpt_en: article.excerpt_en || "",
    content: article.content || "",
    content_en: article.content_en || "",
    category: article.category || "parfum",
    author: article.author || "",
    is_published: Boolean(article.is_published),
    published_at: toInputDate(article.published_at),
    title_font_family: article.title_font_family || "nohemi",
    title_font_weight: article.title_font_weight || "700",
    title_font_style: article.title_font_style || "normal",
    title_font_size: article.title_font_size || "40",
    excerpt_font_family: article.excerpt_font_family || "parkinsans",
    excerpt_font_weight: article.excerpt_font_weight || "400",
    excerpt_font_style: article.excerpt_font_style || "normal",
    excerpt_font_size: article.excerpt_font_size || "18",
    content_font_family: article.content_font_family || "parkinsans",
    content_font_weight: article.content_font_weight || "400",
    content_font_style: article.content_font_style || "normal",
    content_font_size: article.content_font_size || "17",
  };
}

export default function ArticlesAdminPage() {
  const { t, locale, common } = useAdminI18n();
  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const patchForm = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/articles`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat artikel");
      }
      setArticles(data.data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t(
              "articles",
              "load_error",
              "Gagal memuat data artikel.",
              "Failed to load articles.",
            );
      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      [a.title, a.title_en, a.slug, a.category, a.author]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [articles, searchTerm]);

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
    setForm({
      ...emptyForm,
      published_at: new Date().toISOString().slice(0, 10),
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (article: Article) => {
    setModalMode("edit");
    setSelected(article);
    setForm(articleToForm(article));
    setImageFile(null);
    setImagePreview(getArticleImageUrl(article.image));
    setIsModalOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setImagePreview(selected ? getArticleImageUrl(selected.image) : null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("title_en", form.title_en);
      if (form.slug) body.append("slug", form.slug);
      body.append("excerpt", form.excerpt);
      body.append("excerpt_en", form.excerpt_en);
      body.append("content", form.content);
      body.append("content_en", form.content_en);
      body.append("category", form.category || "parfum");
      body.append("author", form.author);
      body.append("is_published", form.is_published ? "1" : "0");
      if (form.published_at) body.append("published_at", form.published_at);
      body.append("title_font_family", form.title_font_family);
      body.append("title_font_weight", form.title_font_weight);
      body.append("title_font_style", form.title_font_style);
      body.append("title_font_size", form.title_font_size);
      body.append("excerpt_font_family", form.excerpt_font_family);
      body.append("excerpt_font_weight", form.excerpt_font_weight);
      body.append("excerpt_font_style", form.excerpt_font_style);
      body.append("excerpt_font_size", form.excerpt_font_size);
      body.append("content_font_family", form.content_font_family);
      body.append("content_font_weight", form.content_font_weight);
      body.append("content_font_style", form.content_font_style);
      body.append("content_font_size", form.content_font_size);
      if (imageFile) body.append("image", imageFile);

      const url =
        modalMode === "add"
          ? `${baseUrl}/api/admin/articles`
          : `${baseUrl}/api/admin/articles/${selected?.id}`;

      const res = await fetch(url, {
        method: "POST",
        headers: getAdminHeaders(false),
        body,
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
            "Gagal menyimpan artikel",
        );
      }

      showNotification(
        modalMode === "add"
          ? t("articles", "created", "Artikel ditambahkan.", "Article created.")
          : t("articles", "updated", "Artikel diupdate.", "Article updated."),
        "success",
      );
      setIsModalOpen(false);
      await fetchArticles();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menyimpan artikel",
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
        `${baseUrl}/api/admin/articles/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: getAdminHeaders(),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus artikel");
      }
      showNotification(
        t("articles", "deleted", "Artikel dihapus.", "Article deleted."),
        "success",
      );
      setDeleteTarget(null);
      await fetchArticles();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menghapus artikel",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const fontFamilyOptions = CMS_FONT_FAMILY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    group: opt.group,
    style: { fontFamily: resolveCmsFontFamily(opt.value) },
  }));

  const fontWeightOptions = CMS_FONT_WEIGHT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    style: { fontWeight: Number(opt.value) || 400 },
  }));

  const fontStyleOptions = CMS_FONT_STYLE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    style: {
      fontStyle: (opt.value === "italic" ? "italic" : "normal") as
        | "normal"
        | "italic",
    },
  }));

  const renderFontRow = (
    prefix: "title" | "excerpt" | "content",
    label: string,
    previewText: string,
  ) => {
    const familyKey = `${prefix}_font_family` as keyof FormState;
    const weightKey = `${prefix}_font_weight` as keyof FormState;
    const styleKey = `${prefix}_font_style` as keyof FormState;
    const sizeKey = `${prefix}_font_size` as keyof FormState;

    return (
      <div className="rounded-xl border border-gray-200 dark:border-[#2a3344] bg-gray-50/70 dark:bg-white/[0.03] p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Tipografi — {label}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <label className="block text-xs space-y-1 min-w-0">
            <span className="text-gray-500">Font family</span>
            <AdminSelect
              value={String(form[familyKey])}
              onChange={(next) => patchForm({ [familyKey]: next })}
              groupLabels={{
                project: "Font Project (Next.js)",
                system: "Font Sistem",
              }}
              options={fontFamilyOptions}
            />
          </label>
          <label className="block text-xs space-y-1 min-w-0">
            <span className="text-gray-500">Weight</span>
            <AdminSelect
              value={String(form[weightKey])}
              onChange={(next) => patchForm({ [weightKey]: next })}
              options={fontWeightOptions}
            />
          </label>
          <label className="block text-xs space-y-1 min-w-0">
            <span className="text-gray-500">Style</span>
            <AdminSelect
              value={String(form[styleKey])}
              onChange={(next) => patchForm({ [styleKey]: next })}
              options={fontStyleOptions}
            />
          </label>
          <label className="block text-xs space-y-1 min-w-0">
            <span className="text-gray-500">Font size</span>
            <AdminSelect
              value={String(form[sizeKey])}
              onChange={(next) => patchForm({ [sizeKey]: next })}
              options={CMS_FONT_SIZE_OPTIONS}
            />
          </label>
        </div>
        <div
          className="rounded-lg border border-dashed border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2.5 text-gray-800 dark:text-gray-100 line-clamp-3"
          style={articleFontStyle(form, prefix)}
        >
          {previewText || "—"}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {notification ? (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            {t("articles", "title", "Artikel", "Articles")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t(
              "articles",
              "subtitle",
              "Kelola artikel parfum untuk beranda & halaman publik.",
              "Manage perfume articles for home and public pages.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("articles", "add", "Tambah Artikel", "Add Article")}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("articles", "search", "Cari artikel...", "Search articles...")}
          className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#141820] pl-10 pr-3 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-[#2a3344] bg-white dark:bg-[#141820] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Artikel</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    {common.loading}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    {t("articles", "empty", "Belum ada artikel.", "No articles yet.")}
                  </td>
                </tr>
              ) : (
                paginated.map((article) => (
                  <tr
                    key={article.id}
                    className="border-t border-gray-100 dark:border-[#2a3344]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0 border border-gray-200 dark:border-[#2a3344] flex items-center justify-center p-1">
                          {getArticleImageUrl(article.image) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getArticleImageUrl(article.image)!}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">
                      {article.category || "parfum"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          article.is_published
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        }`}
                      >
                        {article.is_published
                          ? t("articles", "published", "Publish", "Published")
                          : t("articles", "draft", "Draft", "Draft")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDisplayDate(article.published_at, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(article)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(article)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <AdminTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemLabel={t("articles", "items", "artikel", "articles")}
            onPageChange={setCurrentPage}
          />
        ) : null}
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        panelClassName="max-w-3xl"
      >
        <div className="bg-white dark:bg-[#141820] w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[#2a3344]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3344]">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {modalMode === "add"
                ? t("articles", "add", "Tambah Artikel", "Add Article")
                : t("articles", "edit", "Edit Artikel", "Edit Article")}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Judul (ID)</span>
                <input
                  required
                  value={form.title}
                  onChange={(e) => patchForm({ title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Title (EN)</span>
                <input
                  value={form.title_en}
                  onChange={(e) => patchForm({ title_en: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
            </div>

            {renderFontRow("title", "Judul", form.title || form.title_en)}

            <div className="grid md:grid-cols-3 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => patchForm({ slug: e.target.value })}
                  placeholder="otomatis dari judul"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Kategori</span>
                <input
                  value={form.category}
                  onChange={(e) => patchForm({ category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Penulis</span>
                <input
                  value={form.author}
                  onChange={(e) => patchForm({ author: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Ringkasan (ID)</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => patchForm({ excerpt: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Excerpt (EN)</span>
              <textarea
                rows={2}
                value={form.excerpt_en}
                onChange={(e) => patchForm({ excerpt_en: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
              />
            </label>

            {renderFontRow("excerpt", "Ringkasan", form.excerpt || form.excerpt_en)}

            <label className="block text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Konten (ID)</span>
              <textarea
                required
                rows={6}
                value={form.content}
                onChange={(e) => patchForm({ content: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Content (EN)</span>
              <textarea
                rows={5}
                value={form.content_en}
                onChange={(e) => patchForm({ content_en: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
              />
            </label>

            {renderFontRow(
              "content",
              "Konten",
              (form.content || form.content_en).slice(0, 160),
            )}

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Tanggal publish</span>
                <input
                  type="date"
                  value={form.published_at}
                  onChange={(e) => patchForm({ published_at: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a3344] bg-white dark:bg-[#0b0d12] px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm mt-7">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => patchForm({ is_published: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-700 dark:text-gray-200">Publish</span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">Gambar artikel</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-gray-200 dark:border-[#2a3344] bg-gray-50/60 dark:bg-white/[0.03] p-3">
                <div className="h-44 sm:h-40 sm:w-56 w-full rounded-lg bg-white dark:bg-[#0b0d12] border border-gray-200 dark:border-[#2a3344] overflow-hidden flex items-center justify-center shrink-0 p-2">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Preview artikel"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-[11px]">Belum ada gambar</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white dark:file:bg-white dark:file:text-gray-950"
                  />
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Preview menampilkan seluruh gambar (object-contain). JPG/PNG/WebP, max 10MB.
                  </p>
                  {imagePreview && imageFile ? (
                    <button
                      type="button"
                      onClick={() => handleImageChange(null)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline"
                    >
                      Batalkan ganti gambar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition"
              >
                {common.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-sm font-semibold disabled:opacity-60"
              >
                {saving ? common.saving : common.save}
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
        title={t("articles", "delete_title", "Hapus artikel?", "Delete article?")}
        message={
          deleteTarget
            ? t(
                "articles",
                "delete_message",
                `Artikel "${deleteTarget.title}" akan dihapus permanen.`,
                `Article "${deleteTarget.title}" will be permanently deleted.`,
              )
            : ""
        }
      />
    </div>
  );
}

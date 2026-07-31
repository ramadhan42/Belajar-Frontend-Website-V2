"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  X,
} from "lucide-react";
import {
  getArticleImageUrl,
  getArticles,
  type Article,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import ArtikelHeroBackdrop from "@/components/artikel/ArtikelHeroBackdrop";

const PER_PAGE = 6;

function pick(article: Article, locale: string) {
  const en = locale === "en";
  return {
    title: en && article.title_en ? article.title_en : article.title,
    excerpt:
      en && article.excerpt_en ? article.excerpt_en : article.excerpt || "",
  };
}

function formatDate(value?: string | null, locale = "id") {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArtikelPage() {
  const { locale } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getArticles({ category: "parfum" });
        if (alive) setArticles(data);
      } catch {
        if (alive) setArticles([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => {
      const text = pick(a, locale);
      return (
        text.title.toLowerCase().includes(q) ||
        text.excerpt.toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q)
      );
    });
  }, [articles, query, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const goPrev = () => {
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col font-nohemi">
      <section className="relative overflow-hidden text-white pt-28 md:pt-32 pb-16 md:pb-20 px-5 md:px-8">
        <ArtikelHeroBackdrop />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="uppercase tracking-[0.22em] text-white/75 text-xs md:text-sm mb-3"
          >
            {L(locale, "Jurnal Evomi", "Evomi Journal")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-nohemi text-4xl md:text-6xl leading-none tracking-tight"
          >
            {L(locale, "Artikel Parfum", "Perfume Articles")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 max-w-2xl text-white/90 text-sm md:text-base leading-relaxed"
          >
            {L(
              locale,
              "Baca panduan aroma, tips perawatan parfum, dan cerita di balik karakter wewangian Evomi.",
              "Read scent guides, perfume care tips, and stories behind Evomi fragrance characters.",
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className={`mt-8 relative max-w-md transition-transform duration-300 ${
              searchFocused ? "scale-[1.02]" : "scale-100"
            }`}
          >
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                searchFocused ? "text-[#1172BA]" : "text-[#1172BA]/70"
              }`}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={L(locale, "Cari artikel...", "Search articles...")}
              className={`w-full rounded-full bg-white text-gray-900 pl-11 pr-11 py-3.5 text-sm outline-none shadow-[0_12px_40px_-18px_rgba(17,114,186,0.55)] transition-shadow duration-300 ${
                searchFocused
                  ? "ring-2 ring-[#9CD6FF] shadow-[0_16px_44px_-14px_rgba(17,114,186,0.65)]"
                  : "ring-0"
              }`}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label={L(locale, "Hapus pencarian", "Clear search")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </motion.div>

          {!loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="mt-4 text-xs text-white/70"
            >
              {query.trim()
                ? L(
                    locale,
                    `${filtered.length} hasil untuk “${query.trim()}”`,
                    `${filtered.length} results for “${query.trim()}”`,
                  )
                : L(
                    locale,
                    `${articles.length} artikel tersedia`,
                    `${articles.length} articles available`,
                  )}
            </motion.p>
          ) : null}
        </div>
      </section>

      <section className="flex-1 bg-white px-5 md:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[28px] border border-gray-100 bg-white"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#E8F4FC] to-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-4/5 rounded-lg bg-gray-100 animate-pulse" />
                    <div className="h-4 w-full rounded-lg bg-gray-50 animate-pulse" />
                    <div className="h-4 w-2/3 rounded-lg bg-gray-50 animate-pulse" />
                    <div className="h-3 w-1/3 rounded-lg bg-gray-100 animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[#1172BA]/25 bg-[#F7FBFE] px-6 py-16 text-center"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4FC] text-[#1172BA]">
                <FileText className="w-6 h-6" />
              </span>
              <h2 className="mt-5 text-xl text-gray-900">
                {L(locale, "Artikel tidak ditemukan", "No articles found")}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {query.trim()
                  ? L(
                      locale,
                      "Coba kata kunci lain, atau hapus pencarian untuk melihat semua artikel.",
                      "Try another keyword, or clear search to see all articles.",
                    )
                  : L(
                      locale,
                      "Belum ada artikel parfum yang dipublikasikan.",
                      "No perfume articles have been published yet.",
                    )}
              </p>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1172BA] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d5f9c]"
                >
                  {L(locale, "Hapus pencarian", "Clear search")}
                </button>
              ) : null}
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((article, index) => {
                  const text = pick(article, locale);
                  const image = getArticleImageUrl(article.image);
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(index * 0.05, 0.25),
                        ease: "easeOut",
                      }}
                    >
                      <Link
                        href={`/artikel/${article.slug}`}
                        className="group block h-full overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_1px_0_rgba(17,114,186,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1172BA]/20 hover:shadow-[0_22px_44px_-28px_rgba(17,114,186,0.45)]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F4FC]">
                          {image ? (
                            <Image
                              src={image}
                              alt={text.title}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              sizes="(max-width:768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#1172BA]/35">
                              <FileText className="w-10 h-10" />
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1172BA]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          {article.category ? (
                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1172BA] backdrop-blur-sm">
                              {article.category}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col p-5">
                          <h3 className="font-semibold text-lg leading-snug text-gray-900 transition-colors group-hover:text-[#1172BA]">
                            {text.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                            {text.excerpt}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-xs text-gray-400">
                              {formatDate(article.published_at, locale)}
                            </p>
                            <span className="text-xs font-medium text-[#1172BA] opacity-0 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                              {L(locale, "Baca →", "Read →")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {filtered.length > PER_PAGE ? (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[24px] border border-gray-100 bg-[#F7FBFE] px-5 py-5 md:px-6">
                  <p className="text-sm text-gray-500">
                    {L(
                      locale,
                      `Halaman ${page} dari ${totalPages}`,
                      `Page ${page} of ${totalPages}`,
                    )}
                    <span className="text-gray-300 mx-2">·</span>
                    {L(
                      locale,
                      `${filtered.length} artikel`,
                      `${filtered.length} articles`,
                    )}
                  </p>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={page <= 1}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#1172BA]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#1172BA] transition-all hover:bg-[#1172BA] hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1172BA] disabled:hover:shadow-none"
                      aria-label={L(locale, "Sebelumnya", "Previous")}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {L(locale, "Sebelumnya", "Prev")}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => {
                              setPage(n);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`h-9 min-w-9 px-2 rounded-full text-sm font-medium transition-all ${
                              n === page
                                ? "bg-[#1172BA] text-white shadow-[0_10px_24px_-12px_rgba(17,114,186,0.8)] scale-105"
                                : "bg-white text-[#1172BA] border border-[#1172BA]/15 hover:bg-[#1172BA]/10"
                            }`}
                            aria-label={L(locale, `Halaman ${n}`, `Page ${n}`)}
                            aria-current={n === page ? "page" : undefined}
                          >
                            {n}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={page >= totalPages}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#1172BA]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#1172BA] transition-all hover:bg-[#1172BA] hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1172BA] disabled:hover:shadow-none"
                      aria-label={L(locale, "Berikutnya", "Next")}
                    >
                      {L(locale, "Berikutnya", "Next")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

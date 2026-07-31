"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy, Share2 } from "lucide-react";
import {
  getArticleBySlug,
  getArticleImageUrl,
  getArticles,
  type Article,
} from "@/lib/api";
import { articleFontStyle } from "@/lib/cmsFonts";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import ArtikelHeroBackdrop from "@/components/artikel/ArtikelHeroBackdrop";

function pick(article: Article, locale: string) {
  const en = locale === "en";
  return {
    title: en && article.title_en ? article.title_en : article.title,
    excerpt:
      en && article.excerpt_en ? article.excerpt_en : article.excerpt || "",
    content: en && article.content_en ? article.content_en : article.content,
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

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export default function ArtikelDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale } = useLocale();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [data, list] = await Promise.all([
          getArticleBySlug(slug),
          getArticles({ category: "parfum" }),
        ]);
        if (!alive) return;
        setArticle(data);
        setRelated(
          list
            .filter((item) => item.slug !== slug)
            .slice(0, 3),
        );
      } catch (err) {
        if (alive) {
          setArticle(null);
          setRelated([]);
          setError(
            err instanceof Error
              ? err.message
              : L(locale, "Artikel tidak ditemukan", "Article not found"),
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, locale]);

  const text = article ? pick(article, locale) : null;
  const image = article ? getArticleImageUrl(article.image) : null;
  const paragraphs = useMemo(
    () =>
      text?.content
        ? text.content
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
        : [],
    [text?.content],
  );
  const readMinutes = text ? estimateReadMinutes(text.content) : 1;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = text?.title || "Evomi";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await handleCopyLink();
  };

  return (
    <div className="min-h-screen flex flex-col font-nohemi">
      <section className="relative overflow-hidden text-white pt-28 md:pt-32 pb-14 md:pb-16 px-5 md:px-8">
        <ArtikelHeroBackdrop />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Link
              href="/artikel"
              className="group inline-flex items-center gap-2 text-sm text-white/85 hover:text-white mb-7 transition-colors"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 transition-all group-hover:-translate-x-0.5 group-hover:bg-white/25 group-hover:ring-white/35">
                <ArrowLeft className="w-4 h-4" />
              </span>
              {L(locale, "Kembali ke artikel", "Back to articles")}
            </Link>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-24 rounded-full bg-white/20 animate-pulse" />
              <div className="h-10 w-4/5 rounded-xl bg-white/20 animate-pulse" />
              <div className="h-5 w-2/5 rounded-lg bg-white/15 animate-pulse" />
            </div>
          ) : error || !article || !text ? (
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-semibold"
            >
              {L(locale, "Artikel tidak ditemukan", "Article not found")}
            </motion.h1>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#E8F4FC] font-semibold ring-1 ring-white/20 backdrop-blur-sm">
                {article.category || "parfum"}
              </span>
              <h1
                className="mt-5 leading-[1.12] tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.05)]"
                style={articleFontStyle(article, "title")}
              >
                {text.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80">
                <span>{formatDate(article.published_at, locale)}</span>
                {article.author ? (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{article.author}</span>
                  </>
                ) : null}
                <span className="text-white/40">·</span>
                <span>
                  {L(
                    locale,
                    `${readMinutes} menit baca`,
                    `${readMinutes} min read`,
                  )}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="flex-1 bg-white px-5 md:px-8 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-5">
              <div className="aspect-[16/9] rounded-[28px] bg-gradient-to-br from-[#E8F4FC] to-gray-100 animate-pulse" />
              <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-40 rounded-2xl bg-gray-50 animate-pulse" />
            </div>
          ) : error || !article || !text ? (
            <div className="rounded-3xl border border-gray-100 bg-[#F7FBFE] p-8">
              <p className="text-gray-600 text-sm">{error}</p>
              <Link
                href="/artikel"
                className="mt-5 inline-flex rounded-full bg-[#1172BA] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d5f9c]"
              >
                {L(locale, "Lihat semua artikel", "Browse all articles")}
              </Link>
            </div>
          ) : (
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            >
              {text.excerpt ? (
                <p
                  className="text-gray-700 leading-relaxed"
                  style={articleFontStyle(article, "excerpt")}
                >
                  {text.excerpt}
                </p>
              ) : null}

              {image ? (
                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[28px] border border-[#1172BA]/10 bg-[#E8F4FC] shadow-[0_18px_40px_-28px_rgba(17,114,186,0.45)]">
                  <Image
                    src={image}
                    alt={text.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 768px"
                    priority
                  />
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1172BA]/20 bg-[#E8F4FC] px-4 py-2 text-sm font-medium text-[#1172BA] transition-all hover:bg-[#1172BA] hover:text-white hover:shadow-md active:scale-[0.98]"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied
                    ? L(locale, "Tersalin", "Copied")
                    : L(locale, "Salin tautan", "Copy link")}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-[#1172BA]/30 hover:text-[#1172BA] hover:shadow-sm active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4" />
                  {L(locale, "Bagikan", "Share")}
                </button>
              </div>

              <div className="my-9 h-px bg-gradient-to-r from-transparent via-[#1172BA]/25 to-transparent" />

              <div
                className="space-y-5 text-gray-700 leading-[1.8]"
                style={articleFontStyle(article, "content")}
              >
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {related.length > 0 ? (
                <div className="mt-14 pt-10 border-t border-gray-100">
                  <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#1172BA]/70 font-semibold">
                        {L(locale, "Jurnal Evomi", "Evomi Journal")}
                      </p>
                      <h2 className="mt-2 text-2xl md:text-3xl text-gray-900">
                        {L(locale, "Artikel terkait", "Related articles")}
                      </h2>
                    </div>
                    <Link
                      href="/artikel"
                      className="hidden sm:inline text-sm font-medium text-[#1172BA] hover:underline"
                    >
                      {L(locale, "Lihat semua", "View all")}
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map((item, index) => {
                      const relatedText = pick(item, locale);
                      const relatedImage = getArticleImageUrl(item.image);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.35, delay: index * 0.06 }}
                        >
                          <Link
                            href={`/artikel/${item.slug}`}
                            className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1172BA]/20 hover:shadow-[0_18px_36px_-24px_rgba(17,114,186,0.4)]"
                          >
                            <div className="relative aspect-[16/10] bg-[#E8F4FC]">
                              {relatedImage ? (
                                <Image
                                  src={relatedImage}
                                  alt={relatedText.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="(max-width:768px) 100vw, 33vw"
                                />
                              ) : null}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-base leading-snug text-gray-900 group-hover:text-[#1172BA] transition-colors line-clamp-2">
                                {relatedText.title}
                              </h3>
                              <p className="mt-2 text-xs text-gray-400">
                                {formatDate(item.published_at, locale)}
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </motion.article>
          )}
        </div>
      </section>
    </div>
  );
}

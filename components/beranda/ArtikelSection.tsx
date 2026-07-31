"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Newspaper } from "lucide-react";
import {
  getArticleImageUrl,
  getArticles,
  type Article,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";

function pick(article: Article, locale: string) {
  const en = locale === "en";
  return {
    title: en && article.title_en ? article.title_en : article.title,
    excerpt:
      en && article.excerpt_en ? article.excerpt_en : article.excerpt || "",
  };
}

export default function ArtikelSection() {
  const { locale } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getArticles({ category: "parfum", limit: 3 });
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

  return (
    <section className="relative w-full bg-[#0d5f9c] py-16 md:py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#9CD6FF_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#FFB4D9_0%,transparent_35%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-white/80 text-sm tracking-wide uppercase mb-3">
              <Newspaper className="w-4 h-4" />
              {L(locale, "Jurnal Aroma", "Scent Journal")}
            </p>
            <h2 className="font-nohemi text-white text-3xl md:text-5xl leading-tight">
              {L(locale, "Artikel Parfum", "Perfume Articles")}
            </h2>
            <p className="mt-3 text-white/75 max-w-xl text-sm md:text-base">
              {L(
                locale,
                "Tips, panduan, dan cerita wewangian untuk membantu kamu menemukan karakter aroma yang tepat.",
                "Tips, guides, and fragrance stories to help you find the right scent character.",
              )}
            </p>
          </div>
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 self-start md:self-auto rounded-full bg-white text-[#1172BA] px-5 py-2.5 text-sm font-semibold hover:bg-[#9CD6FF] transition-colors"
          >
            {L(locale, "Lihat semua", "View all")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-white/70 text-sm">
            {L(locale, "Belum ada artikel.", "No articles yet.")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((article, index) => {
              const text = pick(article, locale);
              const image = getArticleImageUrl(article.image);
              return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="group block h-full rounded-3xl overflow-hidden bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={text.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1172BA]" />
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 text-[#1172BA] text-[11px] font-semibold px-3 py-1 uppercase tracking-wide">
                        {article.category || "parfum"}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-[#9CD6FF] transition-colors">
                        {text.title}
                      </h3>
                      {text.excerpt ? (
                        <p className="mt-2 text-white/70 text-sm line-clamp-3">
                          {text.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

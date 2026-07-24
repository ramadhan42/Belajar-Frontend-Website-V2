"use client";

import { FormEvent, useState } from "react";
import { ASSETS, COLORS, COPY } from "./content";

export default function SampleEvomiLanding() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  const marqueeItems = [...COPY.marquee, ...COPY.marquee, ...COPY.marquee];

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-parkinsans overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 flex flex-col items-center text-center max-w-3xl mx-auto">
        <img
          src={ASSETS.brand}
          alt="evomi"
          className="h-10 sm:h-12 w-auto object-contain mb-8"
        />

        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 flex-wrap">
          <div className="flex -space-x-2">
            {ASSETS.counters.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-white"
              />
            ))}
          </div>
          <span
            className="font-nohemi text-5xl sm:text-6xl font-bold leading-none"
            style={{ color: COLORS.blue }}
          >
            {COPY.waitlistCount}
          </span>
          <div className="flex flex-col items-start text-left gap-1">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: COLORS.red,
                backgroundColor: "rgba(227,61,53,0.12)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.red }}
              />
              LIVE
            </span>
            <span className="text-xs sm:text-sm text-slate-500 max-w-[140px] leading-snug">
              {COPY.liveLabel}
            </span>
          </div>
        </div>

        <h1 className="font-nohemi text-[clamp(2rem,6vw,3.4rem)] font-bold tracking-tight mb-4">
          {COPY.heroTitle}
        </h1>

        <p className="font-nohemi text-[clamp(1.15rem,3.5vw,1.75rem)] font-semibold leading-snug mb-2">
          {COPY.heroLeadBefore}
          <span style={{ color: COLORS.green }}>{COPY.heroLeadAccent}</span>
          {COPY.heroLeadAfter}
        </p>
        <p className="font-nohemi text-[clamp(1.05rem,3vw,1.5rem)] font-semibold leading-snug mb-5">
          {COPY.heroLead2Before}
          <span style={{ color: COLORS.pink }}>{COPY.heroLead2Accent}</span>
        </p>

        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mb-10">
          {COPY.heroBody}
        </p>

        <div className="grid grid-cols-4 gap-3 sm:gap-8 w-full max-w-lg mb-10">
          {ASSETS.mascots.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <img
                src={m.src}
                alt={m.label.replace("\n", " ")}
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
              <span
                className="font-nohemi text-[10px] sm:text-xs font-bold whitespace-pre-line leading-tight"
                style={{ color: m.color }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <a
          href="#waitlist"
          className="inline-flex items-center gap-2 text-white font-nohemi font-semibold text-base sm:text-lg px-8 py-3.5 rounded-full shadow-md hover:opacity-90 active:scale-[0.98] transition"
          style={{ backgroundColor: COLORS.blue }}
        >
          {COPY.cta}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* ===== STORY / HIGHLIGHT ===== */}
      <section className="px-4 pb-10">
        <div className="max-w-5xl mx-auto rounded-[24px] overflow-hidden shadow-lg bg-slate-50">
          <img
            src={ASSETS.heroHighlight}
            alt="Evomi recycle highlight"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div
        className="overflow-hidden py-3 border-y"
        style={{ backgroundColor: COLORS.blueDeep, borderColor: COLORS.blueDeep }}
      >
        <div
          className="flex whitespace-nowrap gap-6 text-white font-nohemi font-bold text-sm sm:text-base tracking-wide"
          style={{
            width: "max-content",
            animation: "sampleEvomiMarquee 28s linear infinite",
          }}
        >
          {marqueeItems.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-6">
              <span
                style={{
                  color:
                    i % 4 === 1
                      ? COLORS.yellow
                      : i % 4 === 2
                        ? COLORS.softPink
                        : "#fff",
                }}
              >
                {item}
              </span>
              <span className="opacity-60">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== VALUES ===== */}
      <section
        className="px-4 py-16 sm:py-20 text-center text-white"
        style={{ backgroundColor: COLORS.blueSection }}
      >
        <h2 className="font-nohemi text-[clamp(1.5rem,4vw,2.4rem)] font-bold max-w-3xl mx-auto leading-tight mb-10">
          {COPY.storyTitleBefore}
          <span style={{ color: COLORS.softPink }}>{COPY.storyTitleAccent1}</span>
          {COPY.storyTitleMid}
          <span style={{ color: COLORS.softPink }}>{COPY.storyTitleAccent2}</span>
          {COPY.storyTitleAfter}
        </h2>

        <div className="max-w-5xl mx-auto mb-12">
          <img
            src={ASSETS.story}
            alt="Empat karakter Evomi"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-left sm:text-center">
          {COPY.values.map((v) => (
            <div key={v.title}>
              <h3 className="font-nohemi text-lg font-bold mb-2">{v.title}</h3>
              <p className="text-white/85 text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SCENTS ===== */}
      <section className="px-4 py-16 sm:py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <img
            src={ASSETS.scentTitle}
            alt=""
            className="mx-auto h-8 w-auto mb-4 opacity-80"
          />
          <h2 className="font-nohemi text-[clamp(1.6rem,4vw,2.6rem)] font-bold whitespace-pre-line leading-tight mb-3">
            {COPY.scentHeading}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{COPY.scentSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {ASSETS.scents.map((s) => (
            <article
              key={s.name}
              className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-slate-50">
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <img
                  src={s.sticker}
                  alt=""
                  className="absolute top-4 right-4 w-16 h-16 object-contain drop-shadow"
                />
              </div>
              <div className="p-5 text-left">
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: s.color }}
                >
                  {s.no}
                </p>
                <h3
                  className="font-nohemi text-xl font-bold mb-1"
                  style={{ color: s.color }}
                >
                  {s.name}
                </h3>
                <p className="font-semibold text-slate-700 text-sm mb-2">
                  {s.traits}
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== WAITLIST FORM ===== */}
      <section
        id="waitlist"
        className="px-4 py-16 sm:py-20 text-white"
        style={{ backgroundColor: COLORS.blueSection }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="inline-block bg-white text-[#0B5A96] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              🔥 {COPY.waitlistBadge}
            </span>
            <h2 className="font-nohemi text-[clamp(1.8rem,4.5vw,2.8rem)] font-bold leading-[1.15] mb-4">
              {COPY.waitlistTitle}{" "}
              <span className="text-[#7DFFB3] text-[1.15em]">
                {COPY.waitlistDiscount}
              </span>
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              {COPY.waitlistBody}
            </p>
            <div className="inline-flex flex-col bg-white text-[#1172BA] rounded-2xl px-5 py-4 shadow-lg">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ORANG NGANTRI · LIVE
              </span>
              <span className="font-nohemi text-4xl font-bold leading-none">
                {COPY.waitlistCount}
              </span>
            </div>
          </div>

          <div
            className="rounded-[20px] p-6 sm:p-8 shadow-xl"
            style={{ backgroundColor: COLORS.blueDeep }}
          >
            <h3
              className="font-nohemi text-2xl font-bold mb-1"
              style={{ color: "#7DFFB3" }}
            >
              {COPY.formTitle}
            </h3>
            <p className="text-white/60 text-sm mb-6">{COPY.formSub}</p>

            {submitted ? (
              <div className="rounded-xl bg-white/10 border border-white/20 p-5 text-center">
                <p className="font-nohemi font-bold text-lg mb-1">
                  Terima kasih, {name}! ✨
                </p>
                <p className="text-white/75 text-sm">
                  (Sample page — data tidak dikirim ke server evomi.id)
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs text-white/60">nama kamu</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="contoh: Naya"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#7DFFB3]"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs text-white/60">nomor whatsapp</span>
                  <div className="flex gap-2">
                    <span className="rounded-xl bg-white/10 border border-white/20 px-3 py-3 text-white/80 shrink-0">
                      +62
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="812 3456 7890"
                      className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#7DFFB3]"
                      required
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl py-3.5 font-nohemi font-bold text-lg hover:opacity-90 transition"
                  style={{ backgroundColor: "#0A4A7C", color: "#7DFFB3" }}
                >
                  daftarkan aku ✨
                </button>
                <p className="text-[11px] text-white/45 leading-relaxed">
                  {COPY.formDisclaimer}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-nohemi text-2xl sm:text-3xl font-bold mb-8">
            {COPY.testimonialsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COPY.testimonials.map((t) => (
              <blockquote
                key={t.handle}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: COLORS.blue }}
                  >
                    {t.initial}
                  </span>
                  <span className="font-semibold text-sm text-slate-700">
                    {t.handle}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{t.quote}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 py-12 bg-[#0B5A96] text-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-8 justify-between">
          <div>
            <img
              src={ASSETS.footerBrand}
              alt="evomi"
              className="h-10 w-auto mb-3 object-contain"
            />
            <p className="text-white/70 text-sm">{COPY.footerTagline}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
              Terhubung
            </p>
            <ul className="space-y-1 text-sm text-white/85">
              {COPY.footerSocial.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
              Legal
            </p>
            <ul className="space-y-1 text-sm text-white/85">
              {COPY.footerLegal.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/15 text-xs text-white/50">
          {COPY.footerBottom}
          <span className="block sm:inline sm:before:content-['·'] sm:before:mx-2 mt-1 sm:mt-0">
            Sample scrap dari {COPY.source}
          </span>
        </p>
      </footer>

      <style>{`
        @keyframes sampleEvomiMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

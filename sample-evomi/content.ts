/** Scraped content snapshot from https://evomi.id/ (waitlist landing) */

export const COLORS = {
  blue: "#1172BA",
  green: "#5EA14A",
  pink: "#DD74A5",
  softPink: "#F899C6",
  red: "#E33D35",
  rebel: "#E24B3C",
  yellow: "#FFD521",
  dark: "#0F172A",
  muted: "#64748B",
  blueDeep: "#0B5A96",
  blueSection: "#1172BA",
} as const;

const A = "/sample-evomi";

export const ASSETS = {
  brand: `${A}/brand-1780305277862.png`,
  footerBrand: `${A}/footer-brand-1780761373718.png`,
  heroHighlight: `${A}/hero-highlight-1780305420490.png`,
  story: `${A}/story-1780374770460.png`,
  scentTitle: `${A}/scent-title-1780760093467.svg`,
  counters: [
    `${A}/counter-icon-1780760315995.svg`,
    `${A}/counter-icon-1780760320623.svg`,
    `${A}/counter-icon-1780760324833.svg`,
  ],
  mascots: [
    {
      src: `${A}/mascot-1780310600723.svg`,
      label: "Purpose\nPrestige",
      color: COLORS.blue,
    },
    {
      src: `${A}/mascot-1780310614272.svg`,
      label: "Rebel\nBrave",
      color: COLORS.rebel,
    },
    {
      src: `${A}/mascot-1780310620903.svg`,
      label: "Peaceful\nCalm",
      color: COLORS.green,
    },
    {
      src: `${A}/mascot-1780310631459.svg`,
      label: "Sweet\nShy",
      color: COLORS.pink,
    },
  ],
  scents: [
    {
      no: "No. 01",
      name: "Purpose Prestige",
      traits: "Tenang. Percaya diri. Fokus.",
      desc: "Buat momen jadi tokoh utama. Ketenangan & kepercayaan diri dalam satu botol.",
      image: `${A}/scent-1783484704942.png`,
      sticker: `${A}/scent-sticker-1780310718360.png`,
      color: COLORS.blue,
    },
    {
      no: "No. 02",
      name: "Rebel Brave",
      traits: "Lantang. Berani. Tanpa Ragu.",
      desc: "Buat kamu yang nggak takut tampil beda. Energi & semangat yang nge-pop.",
      image: `${A}/scent-1783484726908.png`,
      sticker: `${A}/scent-sticker-1780310725868.png`,
      color: COLORS.rebel,
    },
    {
      no: "No. 03",
      name: "Peaceful Calm",
      traits: "Lembut. Membumi. Seimbang.",
      desc: "Vibes hutan pagi. Menenangkan, seimbang, dan menyatu dengan diri.",
      image: `${A}/scent-1783484749899.png`,
      sticker: `${A}/scent-sticker-1780310734222.png`,
      color: COLORS.green,
    },
    {
      no: "No. 04",
      name: "Sweet Shy",
      traits: "Hangat. Lembut. Bikin Meleleh.",
      desc: "Manis tapi tetap berkelas. sisi lembut & penuh empati versi terbaik kamu.",
      image: `${A}/scent-1783484756766.png`,
      sticker: `${A}/scent-sticker-1780310741584.png`,
      color: COLORS.pink,
    },
  ],
} as const;

export const COPY = {
  source: "https://evomi.id/",
  waitlistCount: 8,
  heroTitle: "Join the waiting list.",
  heroLeadBefore: 'Something that smells like "',
  heroLeadAccent: "you",
  heroLeadAfter: '" is coming.',
  heroLead2Before: "mau jadi one of the first to ",
  heroLead2Accent: "smell it?",
  heroBody:
    "Dengan aroma yang dibuat untuk lebih dari sekadar wangi, dan cerita yang mungkin terasa “kok ini gue banget?”, sekarang waktunya kamu jadi bagian dari awal perjalanannya.",
  cta: "Amankan Tempatmu",
  liveLabel: "orang sudah masuk waitlist",
  marquee: [
    "✦ SETIAP VERSI DARI AKU",
    "SOFT LAUNCH 2026",
    "4 AROMA, 4 KARAKTER",
    "RAMAH LINGKUNGAN",
  ],
  storyTitleBefore: "Untuk ",
  storyTitleAccent1: "every version of you",
  storyTitleMid: ", karena setiap fase punya ",
  storyTitleAccent2: "aromanya",
  storyTitleAfter: " sendiri.",
  values: [
    {
      title: "Sadar Diri",
      body: "Setiap aroma dirancang untuk merepresentasikan versi diri, emosi, dan karakter manusia yang berbeda.",
    },
    {
      title: "Ramah Lingkungan",
      body: "Tutup botol dari plastik daur ulang. langkah kecil, dampak besar 🌱",
    },
    {
      title: "Desain Playful",
      body: "Visual yang ekspresif & dekat sama Gen Z. pengalaman pakai parfum yang menyenangkan.",
    },
  ],
  scentHeading: "Kenalan Dulu,\nJatuh Cinta Belakangan.",
  scentSub:
    "Pilih yang paling kena di hati, atau koleksi semuanya, kita nggak gatekeep kok.",
  waitlistBadge: "limited drop · 1000 botol pertama",
  waitlistTitle: "Join sekarang & dapetin early access voucher diskon 👀",
  waitlistDiscount: "20%",
  waitlistBody:
    "tinggalkan nomor WA kamu, kita kabarin pas EVOMI launch + diskon early bird 20% khusus waitlist 💌",
  formTitle: "yuk daftar",
  formSub: "isi formnya, 30 detik aja kok.",
  formDisclaimer:
    "dengan gabung, kamu setuju menerima update via WA dari EVOMI. bisa berhenti kapan aja.",
  testimonialsTitle: "kata komunitas:",
  testimonials: [
    {
      handle: "@nayskee",
      initial: "N",
      quote:
        "“first impression dari botolnya aja udah aesthetic banget. nggak sabar coba Rebel Brave 🔥”",
    },
    {
      handle: "@bagasdpr",
      initial: "B",
      quote:
        "“konsep 'setiap versi dari aku' relate parah. akhirnya parfum yang ngerti mood swing aku 😭”",
    },
    {
      handle: "@kikyrn_",
      initial: "K",
      quote:
        "“tutup botol dari plastik daur ulang? sustainable + cute = ambil duitku 💸”",
    },
  ],
  footerTagline: "wangi diri untuk bumi",
  footerSocial: ["@evomi.id di instagram", "@evomi di tiktok", "halo@evomi.id"],
  footerLegal: ["kebijakan privasi", "syarat & ketentuan"],
  footerBottom: "© 2026 evomi.id · DIBUAT DENGAN 💛 DI INDONESIA",
} as const;

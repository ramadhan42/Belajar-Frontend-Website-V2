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
import { useAdminI18n } from "@/hooks/useAdminI18n";
import CmsNumberInput from "@/components/admin/CmsNumberInput";
import AdminSelect from "@/components/admin/AdminSelect";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import {
  CMS_FONT_FAMILY_OPTIONS,
  CMS_FONT_STYLE_OPTIONS,
  CMS_FONT_WEIGHT_OPTIONS,
  isCmsFontFamilyField,
  isCmsFontField,
  isCmsFontStyleField,
  isCmsFontWeightField,
  resolveCmsFontFamily,
  withFontFieldOrder,
} from "@/lib/cmsFonts";

type TabKey =
  | "beranda"
  | "faq"
  | "kontak"
  | "navfooter"
  | "ui"
  | "admin"
  | "belanja"
  | "belanja_details"
  | "checkout";

const TAB_DEFS: { key: TabKey; id: string; en: string }[] = [
  { key: "beranda", id: "Beranda", en: "Home" },
  { key: "belanja", id: "Belanja", en: "Shop" },
  { key: "belanja_details", id: "Belanja Details", en: "Shop Details" },
  { key: "checkout", id: "Checkout", en: "Checkout" },
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
  site: "Judul Tab Browser",
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
  list: "Daftar Produk",
  badges: "Badge Karakter",
  labels: "Label UI",
  guarantee: "Jaminan Produk",
  chat: "Chat",
  content: "Konten",
  disclaimer: "Disclaimer COMPLAIN",
  images: "Gambar",
  sections: "Section",
  messages: "Pesan",
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

const PAGE_ORDER = [
  "beranda",
  "belanja",
  "belanja_details",
  "checkout",
  "kontak",
  "navbar",
  "footer",
  "ui",
  "admin",
];

const SHOP_SECTION_ORDER: Record<string, string[]> = {
  belanja: ["hero", "list", "badges"],
  belanja_details: [
    "labels",
    "disclaimer",
    "guarantee",
    "chat",
    "content",
    "images",
    "badges",
  ],
  checkout: ["header", "sections", "labels", "messages", "images"],
};

/** Prefer Browser Tab settings first inside Nav & Footer */
const NAVFOOTER_SECTION_ORDER = ["site", "menu", "bulletin", "help", "social", "legal"];

/** Urutan field di Hero Section CMS */
const HERO_FIELD_ORDER = [
  // Headline content + style
  "headline_1",
  "headline_1_color",
  "headline_1_font_family",
  "headline_1_font_weight",
  "headline_1_font_style",
  "headline_1_fs_mobile",
  "headline_1_fs_desktop",
  "headline_2",
  "headline_2_color",
  "headline_2_font_family",
  "headline_2_font_weight",
  "headline_2_font_style",
  "headline_2_fs_mobile",
  "headline_2_fs_desktop",
  "headline_3",
  "headline_3_color",
  "headline_3_font_family",
  "headline_3_font_weight",
  "headline_3_font_style",
  "headline_3_fs_mobile",
  "headline_3_fs_desktop",
  "headline_4",
  "headline_4_color",
  "headline_4_font_family",
  "headline_4_font_weight",
  "headline_4_font_style",
  "headline_4_fs_mobile",
  "headline_4_fs_desktop",
  "headline_pos_top_mobile",
  "headline_pos_top_desktop",
  "headline_pos_left_mobile",
  "headline_pos_left_desktop",
  // Badge left
  "badge_left",
  "badge_left_icon",
  "badge_left_font_family",
  "badge_left_font_weight",
  "badge_left_font_style",
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
  "badge_right_font_family",
  "badge_right_font_weight",
  "badge_right_font_style",
  "badge_right_fs_mobile",
  "badge_right_fs_desktop",
  "badge_right_icon_size_mobile",
  "badge_right_icon_size_desktop",
  "badge_right_right_mobile",
  "badge_right_right_desktop",
  "badge_right_bottom_mobile",
  "badge_right_bottom_desktop",
  // Wave SVGs (sayap)
  "wave_left_icon",
  "wave_right_icon",
  "wave_left_left_mobile",
  "wave_left_left_desktop",
  "wave_left_top_mobile",
  "wave_left_top_desktop",
  "wave_right_right_mobile",
  "wave_right_right_desktop",
  "wave_right_top_mobile",
  "wave_right_top_desktop",
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
  "marquee_font_family",
  "marquee_font_weight",
  "marquee_font_style",
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

/** Urutan field di section Browser Tab (Navbar / Footer) */
const SITE_FIELD_ORDER = [
  "browser_title",
  "dashboard_browser_title",
  "favicon",
];

const FIELD_LABELS: Record<string, string> = {
  browser_title: "Judul Tab Frontend",
  dashboard_browser_title: "Judul Tab Dashboard",
  favicon: "Favicon (Icon Tab)",
  headline_1: "Headline 1",
  headline_1_color: "Warna Headline 1",
  headline_1_font_family: "Headline 1 — Font Family",
  headline_1_font_weight: "Headline 1 — Font Weight",
  headline_1_font_style: "Headline 1 — Font Style",
  headline_1_fs_mobile: "Headline 1 — Font Size Mobile",
  headline_1_fs_desktop: "Headline 1 — Font Size Desktop",
  headline_2: "Headline 2",
  headline_2_color: "Warna Headline 2",
  headline_2_font_family: "Headline 2 — Font Family",
  headline_2_font_weight: "Headline 2 — Font Weight",
  headline_2_font_style: "Headline 2 — Font Style",
  headline_2_fs_mobile: "Headline 2 — Font Size Mobile",
  headline_2_fs_desktop: "Headline 2 — Font Size Desktop",
  headline_3: "Headline 3",
  headline_3_color: "Warna Headline 3",
  headline_3_font_family: "Headline 3 — Font Family",
  headline_3_font_weight: "Headline 3 — Font Weight",
  headline_3_font_style: "Headline 3 — Font Style",
  headline_3_fs_mobile: "Headline 3 — Font Size Mobile",
  headline_3_fs_desktop: "Headline 3 — Font Size Desktop",
  headline_4: "Headline 4",
  headline_4_color: "Warna Headline 4",
  headline_4_font_family: "Headline 4 — Font Family",
  headline_4_font_weight: "Headline 4 — Font Weight",
  headline_4_font_style: "Headline 4 — Font Style",
  headline_4_fs_mobile: "Headline 4 — Font Size Mobile",
  headline_4_fs_desktop: "Headline 4 — Font Size Desktop",
  headline_pos_top_mobile: "Posisi Headline — Top Mobile",
  headline_pos_top_desktop: "Posisi Headline — Top Desktop",
  headline_pos_left_mobile: "Posisi Headline — Left Mobile",
  headline_pos_left_desktop: "Posisi Headline — Left Desktop",

  badge_left: "Teks Badge Kiri",
  badge_left_icon: "Icon Badge Kiri",
  badge_left_font_family: "Badge Kiri — Font Family",
  badge_left_font_weight: "Badge Kiri — Font Weight",
  badge_left_font_style: "Badge Kiri — Font Style",
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
  badge_right_font_family: "Badge Kanan — Font Family",
  badge_right_font_weight: "Badge Kanan — Font Weight",
  badge_right_font_style: "Badge Kanan — Font Style",
  badge_right_fs_mobile: "Badge Kanan — Font Size Mobile",
  badge_right_fs_desktop: "Badge Kanan — Font Size Desktop",
  badge_right_icon_size_mobile: "Badge Kanan — Size Icon Mobile",
  badge_right_icon_size_desktop: "Badge Kanan — Size Icon Desktop",
  badge_right_right_mobile: "Badge Kanan — Posisi Right Mobile",
  badge_right_right_desktop: "Badge Kanan — Posisi Right Desktop",
  badge_right_bottom_mobile: "Badge Kanan — Posisi Bottom Mobile",
  badge_right_bottom_desktop: "Badge Kanan — Posisi Bottom Desktop",

  wave_left_icon: "Sayap Kiri (Wave SVG)",
  wave_right_icon: "Sayap Kanan (Wave SVG)",
  wave_left_left_mobile: "Wave Kiri (Sayap) — Left Mobile",
  wave_left_left_desktop: "Wave Kiri (Sayap) — Left Desktop",
  wave_left_top_mobile: "Wave Kiri (Sayap) — Top Mobile",
  wave_left_top_desktop: "Wave Kiri (Sayap) — Top Desktop",
  wave_right_right_mobile: "Wave Kanan (Sayap) — Right Mobile",
  wave_right_right_desktop: "Wave Kanan (Sayap) — Right Desktop",
  wave_right_top_mobile: "Wave Kanan (Sayap) — Top Mobile",
  wave_right_top_desktop: "Wave Kanan (Sayap) — Top Desktop",

  product1_badge_label: "Produk 1 — Teks Badge Label",
  product1_badge_icon: "Produk 1 — Icon Badge",
  product1_image: "Produk 1 — Gambar Botol",
  product1_size_mobile: "Produk 1 — Size Mobile",
  product1_size_desktop: "Produk 1 — Size Desktop",
  product1_left_mobile: "Produk 1 — Left Mobile",
  product1_left_desktop: "Produk 1 — Left Desktop",
  product1_top_mobile: "Produk 1 — Top Mobile",
  product1_top_desktop: "Produk 1 — Top Desktop",
  product1_right_mobile: "Produk 1 — Right Mobile",
  product1_right_desktop: "Produk 1 — Right Desktop",
  product1_rotate_mobile: "Produk 1 — Rotate Mobile",
  product1_rotate_desktop: "Produk 1 — Rotate Desktop",

  product2_badge_label: "Produk 2 — Teks Badge Label",
  product2_badge_icon: "Produk 2 — Icon Badge",
  product2_image: "Produk 2 — Gambar Botol",
  product2_size_mobile: "Produk 2 — Size Mobile",
  product2_size_desktop: "Produk 2 — Size Desktop",
  product2_left_mobile: "Produk 2 — Left Mobile",
  product2_left_desktop: "Produk 2 — Left Desktop",
  product2_top_mobile: "Produk 2 — Top Mobile",
  product2_top_desktop: "Produk 2 — Top Desktop",
  product2_right_mobile: "Produk 2 — Right Mobile",
  product2_right_desktop: "Produk 2 — Right Desktop",
  product2_rotate_mobile: "Produk 2 — Rotate Mobile",
  product2_rotate_desktop: "Produk 2 — Rotate Desktop",

  product3_badge_label: "Produk 3 — Teks Badge Label",
  product3_badge_icon: "Produk 3 — Icon Badge",
  product3_image: "Produk 3 — Gambar Botol",
  product3_size_mobile: "Produk 3 — Size Mobile",
  product3_size_desktop: "Produk 3 — Size Desktop",
  product3_left_mobile: "Produk 3 — Left Mobile",
  product3_left_desktop: "Produk 3 — Left Desktop",
  product3_top_mobile: "Produk 3 — Top Mobile",
  product3_top_desktop: "Produk 3 — Top Desktop",
  product3_right_mobile: "Produk 3 — Right Mobile",
  product3_right_desktop: "Produk 3 — Right Desktop",
  product3_rotate_mobile: "Produk 3 — Rotate Mobile",
  product3_rotate_desktop: "Produk 3 — Rotate Desktop",

  product4_badge_label: "Produk 4 — Teks Badge Label",
  product4_badge_icon: "Produk 4 — Icon Badge",
  product4_image: "Produk 4 — Gambar Botol",
  product4_size_mobile: "Produk 4 — Size Mobile",
  product4_size_desktop: "Produk 4 — Size Desktop",
  product4_left_mobile: "Produk 4 — Left Mobile",
  product4_left_desktop: "Produk 4 — Left Desktop",
  product4_top_mobile: "Produk 4 — Top Mobile",
  product4_top_desktop: "Produk 4 — Top Desktop",
  product4_right_mobile: "Produk 4 — Right Mobile",
  product4_right_desktop: "Produk 4 — Right Desktop",
  product4_rotate_mobile: "Produk 4 — Rotate Mobile",
  product4_rotate_desktop: "Produk 4 — Rotate Desktop",

  marquee_text: "Teks Divider Marquee",
  marquee_font_family: "Marquee — Font Family",
  marquee_font_weight: "Marquee — Font Weight",
  marquee_font_style: "Marquee — Font Style",
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

  label1_text: "Label 1 (Prestige) — Teks",
  label1_title: "Label 1 (Prestige) — Judul Produk",
  label1_color: "Label 1 (Prestige) — Warna Teks",
  label1_fs_mobile: "Label 1 (Prestige) — Font Size Mobile",
  label1_fs_desktop: "Label 1 (Prestige) — Font Size Desktop",
  label1_left_mobile: "Label 1 (Prestige) — Left Mobile",
  label1_left_desktop: "Label 1 (Prestige) — Left Desktop",
  label1_right_mobile: "Label 1 (Prestige) — Right Mobile",
  label1_right_desktop: "Label 1 (Prestige) — Right Desktop",
  label1_top_mobile: "Label 1 (Prestige) — Top Mobile",
  label1_top_desktop: "Label 1 (Prestige) — Top Desktop",
  label1_bottom_mobile: "Label 1 (Prestige) — Bottom Mobile",
  label1_bottom_desktop: "Label 1 (Prestige) — Bottom Desktop",

  label2_text: "Label 2 (Calm) — Teks",
  label2_title: "Label 2 (Calm) — Judul Produk",
  label2_color: "Label 2 (Calm) — Warna Teks",
  label2_fs_mobile: "Label 2 (Calm) — Font Size Mobile",
  label2_fs_desktop: "Label 2 (Calm) — Font Size Desktop",
  label2_left_mobile: "Label 2 (Calm) — Left Mobile",
  label2_left_desktop: "Label 2 (Calm) — Left Desktop",
  label2_right_mobile: "Label 2 (Calm) — Right Mobile",
  label2_right_desktop: "Label 2 (Calm) — Right Desktop",
  label2_top_mobile: "Label 2 (Calm) — Top Mobile",
  label2_top_desktop: "Label 2 (Calm) — Top Desktop",
  label2_bottom_mobile: "Label 2 (Calm) — Bottom Mobile",
  label2_bottom_desktop: "Label 2 (Calm) — Bottom Desktop",

  label3_text: "Label 3 (Rebel) — Teks",
  label3_title: "Label 3 (Rebel) — Judul Produk",
  label3_color: "Label 3 (Rebel) — Warna Teks",
  label3_fs_mobile: "Label 3 (Rebel) — Font Size Mobile",
  label3_fs_desktop: "Label 3 (Rebel) — Font Size Desktop",
  label3_left_mobile: "Label 3 (Rebel) — Left Mobile",
  label3_left_desktop: "Label 3 (Rebel) — Left Desktop",
  label3_right_mobile: "Label 3 (Rebel) — Right Mobile",
  label3_right_desktop: "Label 3 (Rebel) — Right Desktop",
  label3_top_mobile: "Label 3 (Rebel) — Top Mobile",
  label3_top_desktop: "Label 3 (Rebel) — Top Desktop",
  label3_bottom_mobile: "Label 3 (Rebel) — Bottom Mobile",
  label3_bottom_desktop: "Label 3 (Rebel) — Bottom Desktop",

  label4_text: "Label 4 (Sweet) — Teks",
  label4_title: "Label 4 (Sweet) — Judul Produk",
  label4_color: "Label 4 (Sweet) — Warna Teks",
  label4_fs_mobile: "Label 4 (Sweet) — Font Size Mobile",
  label4_fs_desktop: "Label 4 (Sweet) — Font Size Desktop",
  label4_left_mobile: "Label 4 (Sweet) — Left Mobile",
  label4_left_desktop: "Label 4 (Sweet) — Left Desktop",
  label4_right_mobile: "Label 4 (Sweet) — Right Mobile",
  label4_right_desktop: "Label 4 (Sweet) — Right Desktop",
  label4_top_mobile: "Label 4 (Sweet) — Top Mobile",
  label4_top_desktop: "Label 4 (Sweet) — Top Desktop",
  label4_bottom_mobile: "Label 4 (Sweet) — Bottom Mobile",
  label4_bottom_desktop: "Label 4 (Sweet) — Bottom Desktop",

  title_1: "Judul Bagian 1",
  title_2: "Judul Bagian 2",
  subtitle: "Subtitle",
  tagline: "Tagline",
  cta_label: "Teks Tombol CTA",
  card_icon_size_mobile: "Gambar Karakter — Size Mobile",
  card_icon_size_desktop: "Gambar Karakter — Size Desktop",
  card1_name: "Kartu 1 — Nama",
  card2_name: "Kartu 2 — Nama",
  card3_name: "Kartu 3 — Nama",
  card4_name: "Kartu 4 — Nama",
  card1_title: "Kartu 1 — Judul",
  card2_title: "Kartu 2 — Judul",
  card3_title: "Kartu 3 — Judul",
  card4_title: "Kartu 4 — Judul",
  card1_desc: "Kartu 1 — Deskripsi",
  card2_desc: "Kartu 2 — Deskripsi",
  card3_desc: "Kartu 3 — Deskripsi",
  card4_desc: "Kartu 4 — Deskripsi",
  card1_badge: "Kartu 1 — Badge",
  card2_badge: "Kartu 2 — Badge",
  card3_badge: "Kartu 3 — Badge",
  card4_badge: "Kartu 4 — Badge",
  card1_price: "Kartu 1 — Harga",
  card2_price: "Kartu 2 — Harga",
  card3_price: "Kartu 3 — Harga",
  card4_price: "Kartu 4 — Harga",
  label1: "Label 1 — Teks",
  label2: "Label 2 — Teks",
  label3: "Label 3 — Teks",
  label4: "Label 4 — Teks",
  en_l1: "Headline EN 1",
  en_l2: "Headline EN 2",
  en_l3: "Headline EN 3",
  en_l4: "Headline EN 4",
};

function fieldLabel(key: string) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  if (isCmsFontFamilyField(key)) {
    const base = key.replace(/_font_family$/, "");
    return `${FIELD_LABELS[base] || base.replace(/_/g, " ")} — Font Family`;
  }
  if (isCmsFontWeightField(key)) {
    const base = key.replace(/_font_weight$/, "");
    return `${FIELD_LABELS[base] || base.replace(/_/g, " ")} — Font Weight`;
  }
  if (isCmsFontStyleField(key)) {
    const base = key.replace(/_font_style$/, "");
    return `${FIELD_LABELS[base] || base.replace(/_/g, " ")} — Font Style`;
  }
  return key.replace(/_/g, " ");
}

const SECOND_FIELD_ORDER = withFontFieldOrder(
  [
    "headline_1",
    "headline_2",
    "headline_3",
    "card_icon_size_mobile",
    "card_icon_size_desktop",
    "card1_name",
    "card1_title",
    "card1_image",
    "card2_name",
    "card2_title",
    "card2_image",
    "card3_name",
    "card3_title",
    "card3_image",
    "card4_name",
    "card4_title",
    "card4_image",
    "cta_label",
  ],
  [
    "headline_1",
    "headline_2",
    "headline_3",
    "card1_name",
    "card2_name",
    "card3_name",
    "card4_name",
    "cta_label",
  ],
);

const THIRD_FIELD_ORDER = withFontFieldOrder(
  [
    "title_1",
    "title_2",
    "card1_title",
    "card1_desc",
    "card1_icon",
    "card2_title",
    "card2_desc",
    "card2_icon",
    "card3_title",
    "card3_desc",
    "card3_icon",
    "tagline",
  ],
  [
    "title_1",
    "title_2",
    "card1_title",
    "card1_desc",
    "card2_title",
    "card2_desc",
    "card3_title",
    "card3_desc",
    "tagline",
  ],
);

const FIFTH_FIELD_ORDER = withFontFieldOrder(
  [
    "title_1",
    "title_2",
    "subtitle",
    "card1_badge",
    "card1_title",
    "card1_desc",
    "card1_price",
    "card1_image",
    "card2_badge",
    "card2_title",
    "card2_desc",
    "card2_price",
    "card2_image",
    "card3_badge",
    "card3_title",
    "card3_desc",
    "card3_price",
    "card3_image",
    "card4_badge",
    "card4_title",
    "card4_desc",
    "card4_price",
    "card4_image",
    "cta_label",
  ],
  [
    "title_1",
    "title_2",
    "subtitle",
    "card1_badge",
    "card1_title",
    "card1_desc",
    "card1_price",
    "card2_badge",
    "card2_title",
    "card2_desc",
    "card2_price",
    "card3_badge",
    "card3_title",
    "card3_desc",
    "card3_price",
    "card4_badge",
    "card4_title",
    "card4_desc",
    "card4_price",
    "cta_label",
  ],
);

const SIXTH_FIELD_ORDER = withFontFieldOrder(
  [
    "title_1",
    "title_2",
    "label1",
    "label2",
    "label3",
    "label4",
    "marquee_text",
    "image",
  ],
  ["title_1", "title_2", "label1", "label2", "label3", "label4", "marquee_text"],
);

const SEVENTH_FIELD_ORDER_BASE = [
  "headline_1",
  "headline_2",
  "headline_3",
  "headline_4",
  "headline_5",
  "en_l1",
  "en_l2",
  "en_l3",
  "en_l4",
  "cta_label",
  "product_image",
  "label1_text",
  "label1",
  "label1_title",
  "label1_color",
  "label1_fs_mobile",
  "label1_fs_desktop",
  "label1_left_mobile",
  "label1_left_desktop",
  "label1_right_mobile",
  "label1_right_desktop",
  "label1_top_mobile",
  "label1_top_desktop",
  "label1_bottom_mobile",
  "label1_bottom_desktop",
  "label2_text",
  "label2",
  "label2_title",
  "label2_color",
  "label2_fs_mobile",
  "label2_fs_desktop",
  "label2_left_mobile",
  "label2_left_desktop",
  "label2_right_mobile",
  "label2_right_desktop",
  "label2_top_mobile",
  "label2_top_desktop",
  "label2_bottom_mobile",
  "label2_bottom_desktop",
  "label3_text",
  "label3",
  "label3_title",
  "label3_color",
  "label3_fs_mobile",
  "label3_fs_desktop",
  "label3_left_mobile",
  "label3_left_desktop",
  "label3_right_mobile",
  "label3_right_desktop",
  "label3_top_mobile",
  "label3_top_desktop",
  "label3_bottom_mobile",
  "label3_bottom_desktop",
  "label4_text",
  "label4",
  "label4_title",
  "label4_color",
  "label4_fs_mobile",
  "label4_fs_desktop",
  "label4_left_mobile",
  "label4_left_desktop",
  "label4_right_mobile",
  "label4_right_desktop",
  "label4_top_mobile",
  "label4_top_desktop",
  "label4_bottom_mobile",
  "label4_bottom_desktop",
];

const SEVENTH_FIELD_ORDER = withFontFieldOrder(SEVENTH_FIELD_ORDER_BASE, [
  "headline_1",
  "headline_2",
  "headline_3",
  "headline_4",
  "headline_5",
  "en_l1",
  "en_l2",
  "en_l3",
  "en_l4",
  "cta_label",
  "label1",
  "label2",
  "label3",
  "label4",
]);

function sortSectionFields(section: string, sectionFields: CmsField[]) {
  const order =
    section === "hero"
      ? HERO_FIELD_ORDER
      : section === "second"
        ? SECOND_FIELD_ORDER
        : section === "third"
          ? THIRD_FIELD_ORDER
          : section === "fifth"
            ? FIFTH_FIELD_ORDER
            : section === "sixth"
              ? SIXTH_FIELD_ORDER
              : section === "seventh"
                ? SEVENTH_FIELD_ORDER
                : section === "site"
                  ? SITE_FIELD_ORDER
                  : null;
  if (!order) return sectionFields;
  return [...sectionFields].sort((a, b) => {
    const ai = order.indexOf(a.key);
    const bi = order.indexOf(b.key);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

const NUMERIC_STYLE_KEY_RE =
  /(_fs_|_pos_|_left_|_top_|_right_|_bottom_|_size_|_rotate_|_icon_size_|^wave_)/;

function looksLikeCssNumber(value: string | null | undefined) {
  const v = (value ?? "").trim();
  if (!v) return false;
  return /^-?\d+(\.\d+)?\s*(px|%|deg)?$/i.test(v);
}

function isNumericStyleField(key: string, value?: string | null) {
  if (key.endsWith("_color")) return false;
  if (isCmsFontField(key)) return false;
  if (
    key.includes("badge_label") ||
    key.endsWith("_icon") ||
    key.endsWith("_text") ||
    key.endsWith("_title")
  ) {
    return false;
  }
  if (NUMERIC_STYLE_KEY_RE.test(key)) return true;
  return looksLikeCssNumber(value);
}

function parseNumericCmsValue(raw: string | null | undefined): {
  num: string;
  unit: string;
} {
  const value = (raw ?? "").trim();
  if (!value) return { num: "", unit: "" };

  // Allow "28px", "28 px", "7.7%", "-24.5 %"
  const spaced = value.match(/^(-?\d+(?:\.\d+)?)\s*(px|%|deg)$/i);
  if (spaced) {
    return { num: spaced[1], unit: spaced[2].toLowerCase() };
  }

  const unitMatch = value.match(/(px|%|deg)$/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : "";
  const numPart = unit ? value.slice(0, -unit.length).trim() : value;

  if (numPart === "" || /^-?\d*\.?\d*$/.test(numPart)) {
    return { num: numPart, unit };
  }

  const match = value.match(/^(-?\d+(?:\.\d+)?)/);
  if (match) return { num: match[1], unit: unit || "" };
  return { num: value, unit: "" };
}

function inferNumericUnit(key: string): string {
  if (/_rotate_/.test(key) || /product\d+_size_/.test(key)) return "";
  if (
    /_fs_/.test(key) ||
    /_icon_size_/.test(key) ||
    /divider_icon_\d+_size_/.test(key) ||
    /divider_bottom_/.test(key) ||
    /headline_pos_/.test(key)
  ) {
    return "px";
  }
  if (
    /_left_/.test(key) ||
    /_top_/.test(key) ||
    /_right_/.test(key) ||
    /_bottom_/.test(key) ||
    /^wave_/.test(key)
  ) {
    return "%";
  }
  return "";
}

/** Unit shown beside the input (may differ from stored suffix for rotate/size). */
function displayUnitForField(key: string, storageUnit: string) {
  if (storageUnit) return storageUnit;
  if (/_rotate_/.test(key)) return "deg";
  if (/product\d+_size_/.test(key)) return "%";
  return "";
}

function resolveNumericUnit(key: string, raw: string | null | undefined) {
  const parsed = parseNumericCmsValue(raw);
  if (parsed.unit) return parsed.unit;
  return inferNumericUnit(key);
}

function composeNumericCmsValue(num: string, unit: string) {
  const trimmed = num.trim();
  if (!trimmed) return "";
  return `${trimmed}${unit}`;
}

function numericStepForField(key: string, unit: string) {
  if (unit === "%" || /_left_|_top_|_right_|_bottom_|^wave_/.test(key)) {
    return 0.1;
  }
  if (/_rotate_/.test(key)) return 1;
  return 1;
}

export default function CmsDashboardPage() {
  const { t, common, locale } = useAdminI18n();
  const [tab, setTab] = useState<TabKey>("beranda");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<CmsField[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
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
    if (t === "belanja") return "belanja";
    if (t === "belanja_details") return "belanja_details";
    if (t === "checkout") return "checkout";
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
          adminGetCmsPage("navbar", locale),
          adminGetCmsPage("footer", locale),
        ]);
        setFields([...nav, ...foot]);
      } else {
        const page = pageForTab(tab);
        if (page) setFields(await adminGetCmsPage(page, locale));
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
  }, [tab, locale, t]);

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
      const shopOrder = SHOP_SECTION_ORDER[page];
      if (shopOrder) {
        const idx = shopOrder.indexOf(section);
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
        await adminSaveCmsPage("navbar", navFields, locale);
        await adminSaveCmsPage("footer", footFields, locale);
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
          locale,
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
    } finally {
      setFaqToDelete(null);
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

      <AdminConfirmModal
        open={faqToDelete !== null}
        onClose={() => setFaqToDelete(null)}
        onConfirm={() => {
          if (faqToDelete !== null) {
            return handleDeleteFaq(faqToDelete);
          }
        }}
        title={t("cms", "delete_faq_title", "Hapus FAQ?", "Delete FAQ?")}
        message={t(
          "cms",
          "confirm_delete_faq",
          "Hapus FAQ ini?",
          "Delete this FAQ?",
        )}
        confirmLabel={t("cms", "delete_faq", "Hapus FAQ", "Delete FAQ")}
        cancelLabel={common.cancel}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t("cms", "title", "CMS Konten", "Content CMS")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "cms",
              "subtitle",
              "Kelola teks dan gambar per section. Layout halaman tetap sama.",
              "Manage text and images per section. Page layout stays the same.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="relative min-h-[52vh]">
        {loading ? (
          <div className="flex h-[80vh] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
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
                  onClick={() => setFaqToDelete(faq.id)}
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
                  {page !== "beranda" &&
                  page !== "kontak" &&
                  page !== "belanja" &&
                  page !== "belanja_details" &&
                  page !== "checkout"
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
                    const isFontSelectField = isCmsFontField(field.key);
                    const isNumericField =
                      !isFontSelectField &&
                      isNumericStyleField(field.key, field.value);
                    const fontSelectOptions = isCmsFontFamilyField(field.key)
                      ? CMS_FONT_FAMILY_OPTIONS
                      : isCmsFontWeightField(field.key)
                        ? CMS_FONT_WEIGHT_OPTIONS
                        : isCmsFontStyleField(field.key)
                          ? CMS_FONT_STYLE_OPTIONS
                          : [];
                    const numericParsed = isNumericField
                      ? parseNumericCmsValue(field.value)
                      : null;
                    const numericUnit = isNumericField
                      ? resolveNumericUnit(field.key, field.value)
                      : "";
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
                            <div
                              className={
                                field.key === "wave_left_icon" ||
                                field.key === "wave_right_icon"
                                  ? "h-24 w-36 rounded-lg bg-[#0071BC] border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-2"
                                  : "h-16 w-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0"
                              }
                            >
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
                            <div className="flex-1 min-w-0 space-y-1">
                              <input
                                type="file"
                                accept="image/*,.svg,image/svg+xml"
                                onChange={(e) =>
                                  handleImageUpload(
                                    globalIndex,
                                    e.target.files?.[0] ?? null,
                                  )
                                }
                                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white"
                              />
                              {(field.key === "wave_left_icon" ||
                                field.key === "wave_right_icon") && (
                                <div className="flex items-center gap-2">
                                  <p className="text-[11px] text-gray-400">
                                    Upload SVG/PNG. Preview sayap di sebelah
                                    kiri.
                                  </p>
                                  {field.value ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateFieldValue(globalIndex, "")
                                      }
                                      className="shrink-0 text-[11px] font-semibold text-gray-500 hover:text-gray-800 underline"
                                    >
                                      Pakai default
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : isFontSelectField ? (
                          <AdminSelect
                            value={field.value || ""}
                            onChange={(next) =>
                              updateFieldValue(globalIndex, next)
                            }
                            groupLabels={{
                              project: "Font Project (Next.js)",
                              system: "Font Sistem",
                            }}
                            options={
                              isCmsFontFamilyField(field.key)
                                ? CMS_FONT_FAMILY_OPTIONS.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                    group: opt.group,
                                    style: {
                                      fontFamily: resolveCmsFontFamily(
                                        opt.value,
                                      ),
                                    },
                                  }))
                                : fontSelectOptions.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                    style: isCmsFontStyleField(field.key)
                                      ? {
                                          fontStyle:
                                            opt.value === "italic"
                                              ? "italic"
                                              : "normal",
                                        }
                                      : isCmsFontWeightField(field.key)
                                        ? {
                                            fontWeight: Number(opt.value) || 400,
                                          }
                                        : undefined,
                                  }))
                            }
                            placeholder={t(
                              "cms",
                              "select_option",
                              "Pilih opsi…",
                              "Select an option…",
                            )}
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
                        ) : isNumericField ? (
                          <CmsNumberInput
                            value={numericParsed?.num ?? ""}
                            unit={displayUnitForField(field.key, numericUnit)}
                            step={numericStepForField(field.key, numericUnit)}
                            onChange={(num) =>
                              updateFieldValue(
                                globalIndex,
                                composeNumericCmsValue(num, numericUnit),
                              )
                            }
                          />
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
    </div>
  );
}

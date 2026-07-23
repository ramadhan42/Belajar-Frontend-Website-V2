/**
 * Default style values for Hero Section CMS.
 * Keep in sync with current Hero UI unless overridden in CMS.
 */

export const HERO_STYLE_DEFAULTS = {
  // Headline font sizes (shared look today: 28 / 42)
  headline_1_fs_mobile: "28px",
  headline_1_fs_desktop: "42px",
  headline_2_fs_mobile: "28px",
  headline_2_fs_desktop: "42px",
  headline_3_fs_mobile: "28px",
  headline_3_fs_desktop: "42px",
  headline_4_fs_mobile: "28px",
  headline_4_fs_desktop: "42px",
  headline_pos_top_mobile: "0px",
  headline_pos_top_desktop: "0px",
  headline_pos_left_mobile: "0px",
  headline_pos_left_desktop: "0px",

  // Badge left
  badge_left_fs_mobile: "7px",
  badge_left_fs_desktop: "14px",
  badge_left_icon_size_mobile: "8px",
  badge_left_icon_size_desktop: "20px",
  badge_left_left_mobile: "4%",
  badge_left_left_desktop: "9%",
  badge_left_top_mobile: "8%",
  badge_left_top_desktop: "5%",

  // Badge right
  badge_right_fs_mobile: "7px",
  badge_right_fs_desktop: "14px",
  badge_right_icon_size_mobile: "8px",
  badge_right_icon_size_desktop: "16px",
  badge_right_right_mobile: "-1%",
  badge_right_right_desktop: "4.7%",
  badge_right_bottom_mobile: "72%",
  badge_right_bottom_desktop: "80.4%",

  // Hero wave SVGs (sayap kiri / kanan)
  wave_left_left_mobile: "-24%",
  wave_left_left_desktop: "-11%",
  wave_left_top_mobile: "-44%",
  wave_left_top_desktop: "-35%",
  wave_right_right_mobile: "-17%",
  wave_right_right_desktop: "-11%",
  wave_right_top_mobile: "-74%",
  wave_right_top_desktop: "-50%",

  // Product bottles (size = % scale)
  product1_size_mobile: "100",
  product1_size_desktop: "100",
  product1_left_mobile: "7.7%",
  product1_left_desktop: "7.7%",
  product1_top_mobile: "-24.5%",
  product1_top_desktop: "-24.5%",
  product1_right_mobile: "",
  product1_right_desktop: "",
  product1_rotate_mobile: "3",
  product1_rotate_desktop: "3",

  product2_size_mobile: "100",
  product2_size_desktop: "100",
  product2_left_mobile: "-2.3%",
  product2_left_desktop: "-2.3%",
  product2_top_mobile: "-15%",
  product2_top_desktop: "-15%",
  product2_right_mobile: "",
  product2_right_desktop: "",
  product2_rotate_mobile: "-3",
  product2_rotate_desktop: "-3",

  product3_size_mobile: "100",
  product3_size_desktop: "100",
  product3_left_mobile: "",
  product3_left_desktop: "",
  product3_top_mobile: "-24%",
  product3_top_desktop: "-24%",
  product3_right_mobile: "13%",
  product3_right_desktop: "13%",
  product3_rotate_mobile: "4",
  product3_rotate_desktop: "4",

  product4_size_mobile: "100",
  product4_size_desktop: "100",
  product4_left_mobile: "-23.5%",
  product4_left_desktop: "-23.5%",
  product4_top_mobile: "-20%",
  product4_top_desktop: "-20%",
  product4_right_mobile: "",
  product4_right_desktop: "",
  product4_rotate_mobile: "-4",
  product4_rotate_desktop: "-4",

  // Divider marquee
  marquee_fs_mobile: "8px",
  marquee_fs_desktop: "14px",
  divider_icon_1_size_mobile: "14px",
  divider_icon_1_size_desktop: "25px",
  divider_icon_2_size_mobile: "14px",
  divider_icon_2_size_desktop: "25px",
  divider_icon_3_size_mobile: "14px",
  divider_icon_3_size_desktop: "25px",
  divider_icon_4_size_mobile: "14px",
  divider_icon_4_size_desktop: "25px",
  divider_bottom_mobile: "8px",
  divider_bottom_desktop: "0px",
} as const;

export type HeroStyleKey = keyof typeof HERO_STYLE_DEFAULTS;

export const HERO_STYLE_KEYS = Object.keys(
  HERO_STYLE_DEFAULTS,
) as HeroStyleKey[];

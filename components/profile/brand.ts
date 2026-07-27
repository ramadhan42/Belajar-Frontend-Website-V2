/** Warna navbar beranda — dipakai konsisten di area profil. */
export const PROFILE_BRAND_BLUE = "#1172BA";

/** Gradient header yang tetap di keluarga biru beranda (bukan navy tua). */
export function profileBrandGradient(brand: string = PROFILE_BRAND_BLUE) {
  return `linear-gradient(135deg, ${brand} 0%, #1a7fc4 55%, #0e6aad 100%)`;
}

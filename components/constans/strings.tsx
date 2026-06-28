// code_content = """/**
//  * Global Strings Configuration for Next.js Application
//  * * File ini menyimpan semua teks, label, dan pesan statis secara terpusat.
//  * Menggunakan "as const" untuk memastikan type-safety penuh di TypeScript.
//  */

export const SITE_STRINGS = {
  base_url: {
    url_backend_deploy: "https://belajar-be-website-evomi-v2-main-gbcsym.free.laravel.cloud",
    url_backend_local: "http://127.0.0.1:8000",
  },
  meta: {
    title: "Evomi | Premium Fragrance & Perfume",
    description:
      "Temukan keharuman eksklusif dan mewah yang mencerminkan kepribadian Anda. Koleksi parfum premium terbaik dengan kualitas terjamin.",
    tagline: "Elegansi dalam Setiap Semprotan",
  },
  nav: {
    home: "Beranda",
    shop: "Katalog",
    categories: "Kategori",
    about: "Tentang Kami",
    contact: "Kontak",
    dashboard: "Dashboard Admin",
    chat: "Pesan",
  },
  shop: {
    addToCart: "Tambah ke Keranjang",
    buyNow: "Beli Sekarang",
    outOfStock: "Stok Habis",
    searchPlaceholder: "Cari wewangian favorit Anda...",
    filterCategory: "Filter Kategori",
    sortBy: "Urutkan Berdasarkan",
    price: "Harga",
    quantity: "Jumlah",
    total: "Total",
    itemsCount: (count: number) => `${count} Produk`,
  },
  categories: {
    all: "Semua Wewangian",
    edp: "Eau de Parfum",
    edt: "Eau de Toilette",
    cologne: "Cologne",
    oud: "Premium Oud",
    unisex: "Unisex",
  },
  checkout: {
    title: "Proses Pembayaran",
    shippingAddress: "Alamat Pengiriman",
    paymentMethod: "Metode Pembayaran",
    placeOrder: "Selesaikan Pesanan",
    subtotal: "Subtotal",
    shippingCost: "Ongkos Kirim",
    grandTotal: "Total Pembayaran",
  },
  payment: {
    status: {
      pending: "Menunggu Pembayaran",
      success: "Pembayaran Berhasil",
      failed: "Pembayaran Gagal",
      expired: "Sesi Pembayaran Kedaluwarsa",
    },
    midtrans: {
      payNow: "Bayar via Midtrans",
      popupTitle: "Otorisasi Pembayaran",
      securePayment: "Sistem pembayaran aman dan terenkripsi.",
    },
  },
  auth: {
    login: "Masuk",
    register: "Daftar",
    logout: "Keluar",
    welcomeBack: "Selamat Datang Kembali",
    forgotPassword: "Lupa Kata Sandi?",
  },
  chat: {
    adminTitle: "Manajemen Chat Pelanggan",
    userTitle: "Hubungi Admin",
    placeholder: "Ketik pesan Anda di sini...",
    send: "Kirim",
    noMessages: "Belum ada percakapan.",
  },
  messages: {
    cartAdded: "Produk berhasil ditambahkan ke keranjang!",
    cartRemoved: "Produk dihapus dari keranjang.",
    orderSuccess:
      "Pesanan Anda berhasil dibuat. Silakan selesaikan pembayaran.",
    errorGeneric: "Terjadi kesalahan. Silakan coba beberapa saat lagi.",
    loading: "Memuat data...",
  },
} as const;

// Type definition untuk autocompletion dan type-safety di seluruh aplikasi
export type SiteStrings = typeof SITE_STRINGS;
// """

// with open("strings.ts", "w", encoding="utf-8") as f:
//     f.write(code_content)

// print("File strings.ts berhasil dibuat.")

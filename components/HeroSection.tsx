import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    // PERUBAHAN: Menambahkan 'relative' agar background logo absolute bisa diposisikan terhadap section ini
    <section className="hero-section bg-[#0071BC] text-white pt-12 pb-20 px-4 flex flex-col items-center text-center select-none overflow-hidden relative">

      {/* 1. Judul Utama (72px) - Nohemi dengan letter-spacing */}
      <h1 className="text-[72px] font-extrabold leading-[1.1] tracking-tight max-w-5xl mb-5 mt-7 mb-10">
        <span className="text-white">Temukan </span>
        <span className="text-[#5CB2ED]">karakter</span>
        <br />
        <span className="text-[#FFA3CB]">aromamu </span>
        <span className="text-white">di Evomi</span>
      </h1>

      {/* 2. Image Poster Area (3 Gambar Overlap) */}
      <div className="relative mb-10 mt-15 w-full max-w-7xl mx-auto h-[412px] flex items-center justify-center">

        {/* GAMBAR KIRI (Sayap Kiri) */}
        <div className="absolute left-[-180px] top-20 w-[463px] h-[270px] min-w-[463px] min-h-[270px] z-0 rounded-l-2xl overflow-hidden">
          <Image
            src="/src/images/section 1/gambar-sayap-kiri.png"
            alt="Sayap Kiri"
            fill
            className="object-cover object-left"
          />
        </div>

        {/* Purpose Prestige */}
        <div className="absolute left-[170px] top-[-10px] w-[11%] h-[11%] min-w-[11%] min-h-[11%] z-20">
          <Image
            src="/src/images/section 1/purpose-prestige.png"
            alt="Purpose Prestige"
            fill
            className="object-contain"
          />
        </div>

        {/* Rabel Brave */}
        <div className="absolute left-[470px] top-[20px] w-[9%] h-[9%] min-w-[9%] min-h-[9%] z-20">
          <Image
            src="/src/images/section 1/rabel-brave.png"
            alt="Rabel Brave"
            fill
            className="object-contain"
          />
        </div>

        {/* Peaceful Calm */}
        <div className="absolute right-[480px] top-[-50px]  w-[11%] h-[11%] min-w-[11%] min-h-[11%] z-20">
          <Image
            src="/src/images/section 1/peaceful-calm.png"
            alt="Peaceful Calm"
            fill
            className="object-contain"
          />
        </div>

        {/* Sweet Shy */}
        <div className="absolute right-[280px] top-[-10px]  w-[11%] h-[11%] min-w-[11%] min-h-[11%] z-20">
          <Image
            src="/src/images/section 1/sweet-shy.png"
            alt="Sweet Shy"
            fill
            className="object-contain"
          />
        </div>

        {/* Eau de Parfum */}
        <div className="absolute left-[100px] bottom-[-10px] inline-flex items-center justify-center gap-2 bg-white text-[#0071BC] text-[14px] font-bold px-7 py-3 rounded-xl shadow-md rotate-[15deg] select-none whitespace-nowrap">

          {/* Icon SVG diletakkan di sebelum teks */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z" fill="#F899C6" />
          </svg>

          <p className="whitespace-nowrap">Eau de Parfum</p>
        </div>

        {/* Concetration 20% */}
        <div className="absolute right-[150px] bottom-[-35px] inline-flex items-center justify-center gap-2 bg-white text-[#0071BC] text-[14px] font-bold px-7 py-3 rounded-xl shadow-md -rotate-[15deg] select-none whitespace-nowrap">

          {/* Icon SVG diletakkan di sebelum teks */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z" fill="#F899C6" />
          </svg>

          <p className="whitespace-nowrap">Concentration 20%</p>
        </div>

        {/* GAMBAR KANAN (Sayap Kanan) */}
        <div className="absolute right-[-160px] top-[70px] w-[463px] h-[270px] min-w-[463px] min-h-[270px] z-0 rounded-r-2xl overflow-hidden">
          <Image
            src="/src/images/section 1/gambar-sayap-kanan.png"
            alt="Sayap Kanan"
            fill
            className="object-cover object-right"
          />
        </div>

        {/* GAMBAR TENGAH (Utama, Ukuran Terkunci 935x412, Menutupi Sayap) */}
        <div className="relative z-10 w-[975px] h-[452px] min-w-[975px] min-h-[452px] flex-shrink-0 rounded-2xl overflow-hidden bg-transparent">
          <Image
            src="/src/images/produk-varian.png"
            alt="Evomi Poster Utama"
            fill
            className="object-contain"
            priority
          />
        </div>

      </div>

      {/* 3. Teks Deskripsi (20px) - Nohemi dengan letter-spacing kecil */}
      <p className="text-[24px] font-normal leading-relaxed max-w-3xl mb-20 mt-5 opacity-95">
        <b>Every Version of Me</b>
      </p>

      {/* 4. Button Jelajahi Koleksi (18px) */}
      {/* PERUBAHAN: Menambahkan 'relative z-10' supaya tombol naik ke layer atas menimpa background */}
      <Link
        href="/belanja"
        className="bg-white text-[#0071BC] text-[18.3px] font-bold px-9 py-4.5 rounded-full hover:bg-opacity-90 transition-all shadow-md inline-flex items-center gap-2 mb-15 mt-10 relative z-10"
      >
        Jelajahi Koleksi

        {/* Icon SVG */}
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.80933 9.14282H14.476" stroke="#1172BA" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.14282 3.80957L14.4762 9.1429L9.14282 14.4762" stroke="#1172BA" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* --- BARU: IMAGE BACKGROUND LOGO XL DI TENGAH BAWAH (TERTITBAN TOMBOL) --- */}
      <div className="absolute top-[340px] left-1/2 transform -translate-x-1/2 z-0 w-full max-w-full h-full pointer-events-none opacity-80">
        <Image
          src="/src/images/section 1/evomi-logo-xl.png"
          alt="Evomi Logo XL Background"
          fill
          className="object-contain"
        />
      </div>

    </section>
  );
}
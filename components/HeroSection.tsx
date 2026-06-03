import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero-section bg-[#0071BC] text-white pt-10 md:pt-12 pb-16 md:pb-20 px-4 flex flex-col items-center text-center select-none overflow-hidden relative">
      
      {/* --- CSS ANIMASI HOVER EFFECT --- */}
      <style>{`
        /* Efek Hover Gambar Utama (Smooth Rotate & Zoom) */
        .gambar-utama-hover {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translate(-50%, -50%) scale(1) rotate(0deg); 
        }
        
        .gambar-utama-hover:hover {
          transform: translate(-50%, -50%) scale(1.04) rotate(2.5deg);
        }

        /* ANIMASI UNTUK SAYAP */
        @keyframes flashFadeOnce {
          0% { filter: brightness(1); opacity: 1; }
          40% { filter: brightness(1.5); opacity: 0.6; }
          100% { filter: brightness(1); opacity: 1; }
        }
        .sayap-hover-effect:hover {
          animation: flashFadeOnce 0.8s ease-in-out;
        }
      `}</style>

      {/* 1. Judul Utama (Fluid Text) */}
      <h1 className="text-[40px] md:text-[72px] font-extrabold leading-[1.1] tracking-tight max-w-5xl mb-6 mt-5 md:mt-7 md:mb-10">
        <span className="text-white">Temukan </span>
        <span className="text-[#5CB2ED]">karakter</span>
        <br />
        <span className="text-[#FFA3CB]">aromamu </span>
        <span className="text-white">di Evomi</span>
      </h1>

      {/* 2. Image Poster Area (Container Responsive Aspect Ratio) */}
      <div className="relative mb-10 mt-10 md:mt-15 w-[100%] sm:w-[120%] lg:w-full max-w-7xl mx-auto aspect-[1280/412]">

        {/* GAMBAR KIRI (Sayap Kiri) */}
        <div className="absolute left-[-14%] top-[19.4%] w-[36.1%] h-[65.5%] z-0 rounded-l-2xl overflow-hidden sayap-hover-effect cursor-pointer">
          <Image
            src="/src/images/section 1/gambar-sayap-kiri.png"
            alt="Sayap Kiri"
            fill
            className="object-cover object-left"
          />
        </div>

        {/* Purpose Prestige */}
        <div className="absolute left-[13.2%] top-[-2.4%] w-[11%] h-[11%] z-20">
          <Image
            src="/src/images/section 1/purpose-prestige.png"
            alt="Purpose Prestige"
            fill
            className="object-contain"
          />
        </div>

        {/* Rabel Brave */}
        <div className="absolute left-[36.7%] top-[4.8%] w-[9%] h-[9%] z-20">
          <Image
            src="/src/images/section 1/rabel-brave.png"
            alt="Rabel Brave"
            fill
            className="object-contain"
          />
        </div>

        {/* Peaceful Calm */}
        <div className="absolute right-[37.5%] top-[-12%] w-[11%] h-[11%] z-20">
          <Image
            src="/src/images/section 1/peaceful-calm.png"
            alt="Peaceful Calm"
            fill
            className="object-contain"
          />
        </div>

        {/* Sweet Shy */}
        <div className="absolute right-[21.8%] top-[-2.4%] w-[11%] h-[11%] z-20">
          <Image
            src="/src/images/section 1/sweet-shy.png"
            alt="Sweet Shy"
            fill
            className="object-contain"
          />
        </div>

        {/* Eau de Parfum */}
        <div className="absolute left-[7.8%] bottom-[-2.4%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[9px] sm:text-[11px] md:text-[14px] font-bold px-3 md:px-7 py-1.5 md:py-3 rounded-md md:rounded-xl shadow-md rotate-[15deg] select-none whitespace-nowrap z-30">
          <svg className="w-3 h-3 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z" fill="#F899C6" />
          </svg>
          <p className="whitespace-nowrap">Eau de Parfum</p>
        </div>

        {/* Concentration 20% */}
        <div className="absolute right-[11.7%] bottom-[-8.5%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[9px] sm:text-[11px] md:text-[14px] font-bold px-3 md:px-7 py-1.5 md:py-3 rounded-md md:rounded-xl shadow-md -rotate-[15deg] select-none whitespace-nowrap z-30">
          <svg className="w-3 h-3 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z" fill="#F899C6" />
          </svg>
          <p className="whitespace-nowrap">Concentration 20%</p>
        </div>

        {/* GAMBAR KANAN (Sayap Kanan) */}
        <div className="absolute right-[-12.5%] top-[17%] w-[36.1%] h-[65.5%] z-0 rounded-r-2xl overflow-hidden sayap-hover-effect cursor-pointer">
          <Image
            src="/src/images/section 1/gambar-sayap-kanan.png"
            alt="Sayap Kanan"
            fill
            className="object-cover object-right"
          />
        </div>

        {/* GAMBAR UTAMA */}
        <div className="absolute top-1/2 left-1/2 z-10 w-[76.1%] h-[109.7%] flex-shrink-0 rounded-2xl overflow-hidden bg-transparent gambar-utama-hover cursor-pointer">
          <Image
            src="/src/images/produk-varian.png"
            alt="Evomi Poster Utama"
            fill
            className="object-contain"
            priority
          />
        </div>

      </div>

      {/* 3. Teks Deskripsi (Fluid Text) */}
      <p className="text-[18px] md:text-[24px] font-normal leading-relaxed max-w-3xl mb-12 md:mb-20 mt-5 opacity-95">
        <b>Every Version of Me</b>
      </p>

      {/* 4. Button Jelajahi Koleksi (PERUBAHAN EFEK DI SINI) */}
      {/* Menambahkan: shadow-lg, transition-all duration-200, hover:scale-95 hover:translate-y-1 hover:shadow-sm */}
      <Link
        href="/belanja"
        className="bg-white text-[#0071BC] text-[15px] md:text-[18.3px] font-bold px-6 md:px-9 py-3 md:py-4 rounded-full shadow-lg inline-flex items-center gap-2 mb-10 md:mb-15 relative z-10 transform transition-all duration-200 ease-out hover:scale-95 hover:translate-y-1 hover:shadow-sm"
      >
        Jelajahi Koleksi
        <svg className="w-4 h-4 md:w-[19px] md:h-[19px]" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.80933 9.14282H14.476" stroke="#1172BA" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.14282 3.80957L14.4762 9.1429L9.14282 14.4762" stroke="#1172BA" strokeWidth="1.52381" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* --- IMAGE BACKGROUND LOGO XL --- */}
      <div className="absolute top-[60%] md:top-[340px] left-1/2 transform -translate-x-1/2 z-0 w-full max-w-full h-full pointer-events-none opacity-80">
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
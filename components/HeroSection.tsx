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

        /* ANIMASI ROTATE UNTUK BADGE (Ditambah 2 derajat dari posisi aslinya) */
        .badge-kiri-rotate {
          transform: rotate(15deg);
          transition: transform 0.3s ease-out;
        }
        .badge-kiri-rotate:hover {
          /* Rotate 2 derajat ke kanan: 15deg + 5deg = 17deg */
          transform: rotate(17deg);
        }

        .badge-kanan-rotate {
          transform: rotate(-15deg);
          transition: transform 0.3s ease-out;
        }
        .badge-kanan-rotate:hover {
          /* Rotate 2 derajat ke kiri: -15deg - 5deg = -17deg */
          transform: rotate(-17deg);
        }
      `}</style>

      {/* 1. Judul Utama (Fluid Text) */}
      <h1 className="font-nohemi font-semibold text-[40px] md:text-[72px] leading-[1.1] tracking-tight max-w-5xl mb-6 mt-5 md:mt-7 md:mb-10 transition-transform duration-300 hover:rotate-[5deg] cursor-pointer origin-center">
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
        {/* Diubah: hover:-rotate-[5deg] (ke kiri) */}
        <div className="absolute left-[14%] top-[-2%] w-[11%] h-[11%] z-20 transition-transform duration-300 ease-out hover:-rotate-[5deg] cursor-pointer">
          <Image
            src="/src/images/section 1/purpose-prestige.png"
            alt="Purpose Prestige"
            fill
            className="object-contain"
          />
        </div>

        {/* Rabel Brave */}
        {/* Diubah: hover:-rotate-[5deg] (ke kiri) */}
        <div className="absolute left-[38%] top-[4.8%] w-[9%] h-[9%] z-20 transition-transform duration-300 ease-out hover:-rotate-[5deg] cursor-pointer">
          <Image
            src="/src/images/section 1/rabel-brave.png"
            alt="Rabel Brave"
            fill
            className="object-contain"
          />
        </div>

        {/* Peaceful Calm */}
        {/* Diubah: hover:rotate-[5deg] (ke kanan) */}
        <div className="absolute right-[36%] top-[-13%] w-[11%] h-[11%] z-20 transition-transform duration-300 ease-out hover:rotate-[5deg] cursor-pointer">
          <Image
            src="/src/images/section 1/peaceful-calm.png"
            alt="Peaceful Calm"
            fill
            className="object-contain"
          />
        </div>

        {/* Sweet Shy */}
        {/* Diubah: hover:rotate-[5deg] (ke kanan) */}
        <div className="absolute right-[15%] top-[-2.4%] w-[11%] h-[11%] z-20 transition-transform duration-300 ease-out hover:rotate-[5deg] cursor-pointer">
          <Image
            src="/src/images/section 1/sweet-shy.png"
            alt="Sweet Shy"
            fill
            className="object-contain"
          />
        </div>

        {/* Eau de Parfum */}
        {/* Diubah: class CSS menjadi badge-kiri-rotate */}
        <div className="badge-kiri-rotate cursor-pointer absolute left-[7.8%] bottom-[-2.4%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[9px] sm:text-[11px] md:text-[14px] font-bold px-3 md:px-7 py-1.5 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30">
          <svg className="w-3 h-3 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.44444 4.15153L-3.61099e-05 5.78063L1.83007 10.1457L0.332174 14.6364L4.88613 15.9286L7.46318 19.9L11.3117 17.1448L16.0236 17.6062L16.2697 12.8784L19.5674 9.48231L16.0249 6.34218L15.4258 1.64729L10.7622 2.4587L6.71773 4.00083e-06L4.44444 4.15153Z" fill="#F899C6" />
          </svg>
          <p className="whitespace-nowrap">Eau de Parfum</p>
        </div>

        {/* Concentration 20% */}
        {/* Diubah: class CSS menjadi badge-kanan-rotate */}
        <div className="badge-kanan-rotate cursor-pointer absolute right-[11.7%] bottom-[-18%] inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-[#0071BC] text-[9px] sm:text-[11px] md:text-[14px] font-bold px-3 md:px-7 py-1.5 md:py-3 rounded-md md:rounded-xl shadow-md select-none whitespace-nowrap z-30">
          
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
        {/* GAMBAR UTAMA (Diganti menjadi 4 gambar horizontal) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/15 z-10 w-[76.1%] h-[100%] flex items-center justify-between gap-2 md:gap-4 bg-transparent cursor-pointer">

          {/* Gambar 1 */}
          <div className="relative w-full h-full left-[5.7%] top-[2.5%]">
            <Image
              src="/src/images/section 1/botol-purpose-prestige.png"
              alt="Botol Purpose Prestige"
              fill
              className="object-contain gambar-utama-hover"
              priority
            />
          </div>

          {/* Gambar 2 */}
          <div className="relative w-full h-full left-[2.7%] top-[18%] z-30">
            <Image
              src="/src/images/section 1/botol-rabel-brave.png"
              alt="Botol Rabel Brave"
              fill
              className="object-contain gambar-utama-hover"
              priority
            />
          </div>

          {/* Gambar 3 */}
          <div className="relative w-full h-full right-[2%]">
            <Image
              src="/src/images/section 1/botol-peaceful-calm.png"
              alt="Botol Peaceful Calm"
              fill
              className="object-contain gambar-utama-hover"
              priority
            />
          </div>

          {/* Gambar 4 */}
          <div className="relative w-full h-full right-[4.5%] top-[14%] z-30">
            <Image
              src="/src/images/section 1/botol-sweet-shy.png"
              alt="Botol Sweet Shy"
              fill
              className="object-contain gambar-utama-hover"
              priority
            />
          </div>

        </div>

      </div>

  
    </section>
  );
}
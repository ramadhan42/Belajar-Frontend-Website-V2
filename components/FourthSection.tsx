import Image from 'next/image';

export default function FourthSection() {
  return (
    // Penyesuaian min-h dari 350px (untuk HP kecil) hingga 800px (Desktop)
    <section className="relative w-full min-h-[350px] sm:min-h-[500px] md:min-h-[800px] flex justify-center items-center pt-10 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-40 overflow-hidden">

      {/* 1. Background Image (z-0) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/src/images/section 4/tutup-botol.png"
          alt="Background Tutup Botol"
          fill
          className="object-cover object-center"
          quality={90}
        />
      </div>

      {/* Kontainer batas untuk menahan posisi elemen melayang (z-10) */}
      <div className="relative z-10 w-full max-w-6xl min-h-[300px] sm:min-h-[400px] md:min-h-[650px] px-4 md:px-6">

        {/* --- GROUP ATAS KANAN --- */}
        {/* Gap diperkecil jadi gap-2 di HP layar sempit */}
        <div className="absolute top-2 sm:top-0 right-4 md:right-2 flex flex-col md:flex-row items-end md:items-center gap-2 sm:gap-3 md:gap-6">

          {/* Teks di sebelah Icon Recycle */}
          {/* Font diperkecil hingga 12px di HP kecil, leading (spasi antar baris) dipersempit */}
          <p className="font-['Nohemi'] text-[12px] sm:text-[16px] md:text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line text-right md:text-left z-10 md:mr-25 leading-tight md:leading-normal">
            Tidak ada yang kita buang{'\n'}benar-benar pergi,
          </p>

          {/* Icon Recycle & Teks Deskripsi */}
          <div className="flex flex-col items-center z-10">
            {/* Ukuran ikon mengecil jadi 32px di layar mobile yang sangat kecil */}
            <div className="relative w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] md:w-[64px] md:h-[64px] cursor-pointer transition-transform duration-1500 ease-in-out hover:rotate-[180deg]">
              <Image
                src="/src/images/section 4/recycle.png"
                alt="Recycle Icon"
                fill
                className="object-contain"
              />
            </div>
            {/* Ukuran font teks label mengecil di HP (10px) */}
            <div className="group perspective inline-block cursor-pointer">
              {/* Container untuk memberikan efek 3D */}
              <div className="transition-transform duration-500 transform-style-3d group-hover:rotate-y-360">
                <p className="font-['Nohemi'] text-[10px] sm:text-[14px] md:text-[22.8px] text-[#1172BA] font-semibold text-center whitespace-pre-line mt-1 md:mt-2 leading-tight md:leading-normal backface-hidden">
                  Recycle{'\n'}Plastic Cap
                </p>
              </div>

              {/* Tambahkan style ini di file CSS global Anda atau di dalam tag <style> di komponen */}
              <style>{`
                .perspective { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .group-hover\\:rotate-y-360:hover { transform: rotateY(360deg); }
              `}</style>
            </div>
          </div>

        </div>

        {/* --- GROUP BAWAH KIRI --- */}
        {/* Teks disusun dengan gap yang sangat tipis di HP (gap-2) */}
        <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-4 md:left-12 flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-3 md:gap-6 lg:gap-8 z-10">

          {/* Teks 1 */}
          {/* Ukuran font disesuaikan turun ke 12px */}
          <p className="font-['Nohemi'] text-[12px] sm:text-[16px] md:text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line leading-tight md:leading-normal">
            Apa yang kita buang{'\n'}bisa melilit Bumi
          </p>

          {/* Teks 2 (25x putaran) */}
          {/* Angka "25x" mengecil jadi 18px di layar HP ekstrem */}
          <p className="font-['Nohemi'] text-[14px] sm:text-[18px] md:text-[28px] font-semibold text-[#1172BA] whitespace-pre-line md:ml-10 lg:ml-40 leading-tight md:leading-normal">
            <span className="text-[18px] sm:text-[24px] md:text-[35px]">25x</span>{'\n'} putaran
          </p>

          {/* Teks 3 */}
          {/* Ukuran font 12px untuk mobile kecil */}
          <p className="font-['Nohemi'] text-[12px] sm:text-[16px] md:text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line md:ml-10 lg:ml-40 leading-tight md:leading-normal">
            dia akan{'\n'}kembali dalam{'\n'} bentuk yang{'\n'} berbeda
          </p>
        </div>
      </div>

      {/* --- DIVIDER ANIMASI BAWAH (WAVE) --- */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] overflow-hidden z-20">
        <style>{`
          @keyframes wave-divider-fast {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes wave-divider-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-wave-div-fast {
            animation: wave-divider-fast 7s linear infinite;
          }
          .animate-wave-div-slow {
            animation: wave-divider-slow 11s linear infinite;
          }
        `}</style>

        {/* Layer Belakang (Lebih Lambat & Transparan) */}
        {/* Tinggi ombak diturunkan jadi 30px di layar mobile */}
        <svg
          className="animate-wave-div-slow absolute bottom-0 block w-[200%] h-[30px] sm:h-[50px] md:h-[80px] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 0 500 50 T 1000 50 T 1500 50 T 2000 50 V 100 H 0 Z"
            fill="#60BBFF"
          />
        </svg>

        {/* Layer Depan (Lebih Cepat & Solid Putih) */}
        {/* Tinggi ombak diturunkan jadi 20px di layar mobile */}
        <svg
          className="animate-wave-div-fast relative block w-[200%] h-[20px] sm:h-[40px] md:h-[65px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 100 500 50 T 1000 50 T 1500 50 T 2000 50 V 100 H 0 Z"
            fill="#60BBFF"
          />
        </svg>
      </div>

    </section>
  );
}
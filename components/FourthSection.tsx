import Image from 'next/image';

export default function FourthSection() {
  return (
    // Mengubah py-20 menjadi pt-20 pb-32 md:pb-40 untuk memberi ruang ombak di bawah
    <section className="relative w-full min-h-[600px] md:min-h-[800px] flex justify-center items-center pt-20 pb-32 md:pb-40 overflow-hidden">

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
      <div className="relative z-10 w-full max-w-6xl min-h-[500px] md:min-h-[650px] px-6">

        {/* --- GROUP ATAS KANAN --- */}
        <div className="absolute top-0 right-2 md:right-2 flex flex-col md:flex-row items-end md:items-center gap-6">

          {/* Teks di sebelah Icon Recycle */}
          <p className="font-['Nohemi'] text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line text-right md:text-left z-10 md:mr-25">
            Tidak ada yang kita buang{'\n'}benar-benar pergi,
          </p>

          {/* Icon Recycle & Teks Deskripsi */}
          <div className="flex flex-col items-center z-10">
            <Image
              src="/src/images/section 4/recycle.png"
              alt="Recycle Icon"
              width={64}
              height={64}
              className="object-contain"
            />
            <p className="font-['Nohemi'] text-[22.8px] text-[#1172BA] font-semibold text-center whitespace-pre-line mt-2">
              Recycle{'\n'}Plastic Cap
            </p>
          </div>

        </div>

        {/* --- GROUP BAWAH KIRI --- */}
        {/* Supaya teks tidak tertutup ombak, kamu bisa menaikkan bottom-10 ke bottom-16 atau bottom-20 jika diperlukan */}
        <div className="absolute bottom-16 md:bottom-12 left-4 md:left-12 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 lg:gap-8 z-10">

          {/* Teks 1 */}
          <p className="font-['Nohemi'] text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line">
            Apa yang kita buang{'\n'}bisa melilit Bumi
          </p>

          {/* Teks 2 (25x putaran) */}
          <p className="font-['Nohemi'] text-[28px] font-semibold text-[#1172BA] whitespace-pre-line md:ml-40">
            <span className="text-[35px]">25x</span>{'\n'} putaran
          </p>

          {/* Teks 3 */}
          <p className="font-['Nohemi'] text-[25.2px] text-[#5D5D5D] font-semibold whitespace-pre-line md:ml-40">
            dia akan{'\n'}kembali dalam{'\n'} bentuk yang{'\n'} berbeda
          </p>

        </div>

      </div>

      {/* --- DIVIDER ANIMASI BAWAH (WAVE) --- */}
      {/* z-20 memastikan gelombang berada di atas background gambar */}
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
        <svg
          className="animate-wave-div-slow absolute bottom-0 block w-[200%] h-[50px] md:h-[80px] opacity-50"
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
        <svg
          className="animate-wave-div-fast relative block w-[200%] h-[40px] md:h-[65px]"
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
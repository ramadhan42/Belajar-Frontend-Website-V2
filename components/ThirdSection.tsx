import Image from 'next/image';

export default function ThirdSection() {
  const brandValues = [
    {
      title: "Self\nAwareness",
      description: "Setiap aroma dirancang untuk merepresentasikan versi diri, emosi, dan karakter manusia yang berbeda, sehingga parfum menjadi medium ekspresi personal, bukan sekadar wewangian.",
      icon: "/src/images/section 3/star-medium.png",
      hoverClass: "hover:rotate-[15deg]",
    },
    {
      title: "Environment\nFriendly",
      description: "Mengusung kepedulian terhadap lingkungan melalui pemanfaatan daur ulang tutup botol plastik menjadi bagian dari identitas produk, sebagai bentuk kontribusi kecil dalam mengurangi limbah plastik sekaligus menghadirkan nilai sustainability.",
      icon: "/src/images/section 3/peaceful-calm.png",
      hoverClass: "hover:-rotate-[15deg]",
    },
    {
      title: "Playful Design\nConcept",
      description: "Dikemas dengan pendekatan visual yang playful, ekspresif, dan dekat dengan generasi muda agar pengalaman menggunakan parfum terasa lebih personal dan menyenangkan.",
      icon: "/src/images/section 3/triangle.png",
      hoverClass: "hover:rotate-[15deg]",
    }
  ];

  return (
    // Tambahan relative, overflow-hidden, dan pb-24/md:pb-32 untuk memberi ruang pada gelombang di bagian bawah
    <section className="relative bg-[#0071BC] flex flex-col items-center text-center w-full px-4 overflow-hidden pb-32 md:pb-40">

      {/* 1. Teks Atas & Gambar di Sisi Kanan */}
      <div className="flex items-center justify-center gap-4 mt-15 mb-[30px]">
        <h2 className="text-[48px] font-bold">
          <span className="text-white">Brand </span>
          <span className="text-[#90EE90]">Value</span>
        </h2>
        <Image
          src="/src/images/section 3/star-medium.png"
          alt="Icon Frame 5"
          width={32}
          height={32}
          className="object-contain brightness-0 invert"
        />
      </div>

      {/* 2. Card Section */}
      <div className="flex justify-center w-full max-w-6xl mt-4 mb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 w-full px-4 pt-10 pb-10">

          {brandValues.map((card, index) => (
            <div key={index} className="flex flex-col">
              
              <h3 className="text-white text-[26px] font-bold mb-6 text-left px-2 whitespace-pre-line">
                {card.title}
              </h3>

              <div
                className={`relative bg-white rounded-3xl p-8 shadow-xl flex flex-col cursor-pointer transition-transform duration-300 ease-out hover:z-10 flex-grow ${card.hoverClass}`}
              >
                <div className="absolute -top-5 -right-6 md:-right-15 w-[90px] h-[90px] z-20 transition-transform duration-300">
                  <Image
                    src={card.icon}
                    alt={card.title.replace('\n', ' ')}
                    width={58}
                    height={58}
                    className="object-contain drop-shadow-md"
                  />
                </div>

                <p className="text-left text-[#0071BC] text-[18px] leading-relaxed">
                  {card.description}
                </p>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 3. Teks Bawah */}
      {/* Tambahan z-10 agar teks tetap berada di atas animasi gelombang */}
      <p className="text-white text-[32px] font-bold mt-[15px] mb-5 relative z-10">
        Every Version of Me
      </p>

      {/* 4. Animasi Gelombang (Wave Section) */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] overflow-hidden rotate-180">
        {/* Style lokal untuk keyframes Tailwind, tidak perlu setting tailwind.config.ts */}
        <style>{`
          @keyframes wave-fast {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes wave-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-wave-fast {
            animation: wave-fast 7s linear infinite;
          }
          .animate-wave-slow {
            animation: wave-slow 11s linear infinite;
          }
        `}</style>
        
        {/* Layer Belakang (Lebih Lambat & Semi-Transparan) */}
        <svg
          className="animate-wave-slow absolute bottom-0 block w-[200%] h-[70px] md:h-[110px] opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 0 500 50 T 1000 50 T 1500 50 T 2000 50 V 120 H 0 Z"
            fill="#60BBFF"
          />
        </svg>

        {/* Layer Depan (Lebih Cepat) */}
        <svg
          className="animate-wave-fast relative block w-[200%] h-[50px] md:h-[90px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2000 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 250 100 500 50 T 1000 50 T 1500 50 T 2000 50 V 120 H 0 Z"
            fill="#60BBFF"
          />
        </svg>
      </div>

    </section>
  );
}
import Image from 'next/image';

export default function ThirdSection() {
  const brandValues = [
    {
      title: "Self\nAwareness",
      description: "Setiap aroma dirancang untuk merepresentasikan versi diri, emosi, dan karakter manusia yang berbeda, sehingga parfum menjadi medium ekspresi personal, bukan sekadar wewangian.",
      icon: "/src/images/section 3/star-medium.png",
      // Rotasi sedikit diperkecil di mobile agar kartu tidak melebar keluar layar
      hoverClass: "hover:rotate-[5deg] md:hover:rotate-[5deg]",
    },
    {
      title: "Environment\nFriendly",
      description: "Mengusung kepedulian terhadap lingkungan melalui pemanfaatan daur ulang tutup botol plastik menjadi bagian dari identitas produk, sebagai bentuk kontribusi kecil dalam mengurangi limbah plastik sekaligus menghadirkan nilai sustainability.",
      icon: "/src/images/section 3/peaceful-calm.png",
      hoverClass: "hover:-rotate-[5deg] md:hover:-rotate-[5deg]",
    },
    {
      title: "Playful Design\nConcept",
      description: "Dikemas dengan pendekatan visual yang playful, ekspresif, dan dekat dengan generasi muda agar pengalaman menggunakan parfum terasa lebih personal dan menyenangkan.",
      icon: "/src/images/section 3/triangle.png",
      hoverClass: "hover:rotate-[5deg] md:hover:rotate-[5deg]",
    }
  ];

  return (
    <section className="relative bg-[#0071BC] flex flex-col items-center text-center w-full px-2 md:px-2 overflow-hidden pb-10 md:pb-10">

      {/* 1. Teks Atas & Gambar di Sisi Kanan */}
      {/* Diperbarui: Margin dan gap diperkecil di layar mobile */}
      <div className="group flex items-center justify-center gap-3 md:gap-4 mt-10 md:mt-15 mb-6 md:mb-[30px] cursor-pointer">
        {/* 'group' pada parent memungkinkan elemen di dalamnya bereaksi 
        ketika parent tersebut di-hover.
        */}
        <h2 className="text-[32px] md:text-[48px] font-bold leading-tight transition-transform duration-300 ease-in-out group-hover:rotate-[4deg]">
          <span className="text-white">Brand </span>
          <span className="text-[#90EE90]">Value</span>
        </h2>

        {/* Ikon juga akan ikut berotasi karena berada di dalam 'group' */}
        <div className="w-[24px] md:w-[32px] h-[24px] md:h-[32px] relative flex justify-center items-center transition-transform duration-300 ease-in-out group-hover:-rotate-[4deg]">
          <Image
            src="/src/images/section 3/star-medium.png"
            alt="Icon Frame 5"
            width={32}
            height={32}
            className="w-full h-full object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* 2. Card Section */}
      <div className="flex justify-center w-full max-w-6xl mt-2 md:mt-4 mb-8 relative z-10">
        {/* Diperbarui: Gap vertikal di mobile sedikit diperbesar (gap-12) agar ikon card di bawahnya tidak menabrak card di atasnya */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full px-20 md:px-10 pt-6 md:pt-10 pb-6 md:pb-10">

          {brandValues.map((card, index) => (
            <div key={index} className="flex flex-col">

              {/* Diperbarui: Font size judul card disesuaikan */}
              <h3 className="text-white text-[22px] md:text-[26px] font-bold mb-4 md:mb-6 text-left px-2 whitespace-pre-line">
                {card.title}
              </h3>

              <div
                className={`relative bg-white rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-xl flex flex-col cursor-pointer transition-transform duration-300 ease-out hover:z-10 flex-grow ${card.hoverClass}`}
              >
                {/* Diperbarui: Posisi absolut (-right) dikecilkan di mobile agar ikon tidak tumpah/terpotong di luar batas layar HP */}
                <div className="absolute -top-6 -right-2 md:-top-12 md:-right-10 lg:-right-9 w-[60px] md:w-[90px] h-[60px] md:h-[90px] z-20 transition-transform duration-300 flex justify-center items-center">
                  <Image
                    src={card.icon}
                    alt={card.title.replace('\n', ' ')}
                    width={70}
                    height={70}
                    className="object-contain drop-shadow-md"
                  />
                </div>

                {/* Diperbarui: Ukuran font deskripsi menyesuaikan untuk keterbacaan di mobile */}
                <p className="text-left text-[#0071BC] text-[15px] md:text-[18px] leading-relaxed">
                  {card.description}
                </p>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 3. Teks Bawah */}
      {/* Diperbarui: Font size text bawah disesuaikan */}
      <p className="text-white text-[24px] md:text-[32px] font-bold mt-4 md:mt-[15px] mb-8 md:mb-5 relative z-10 transition-transform duration-300 ease-in-out hover:-rotate-[3deg] cursor-pointer">
        Every Version of Me
      </p>

    </section>
  );
}
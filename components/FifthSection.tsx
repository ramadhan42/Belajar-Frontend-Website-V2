import Image from 'next/image';
import Link from 'next/link';

export default function FifthSection() {
  const products = [
    {
      id: 1,
      path: "/src/images/section 5/purpose-prestige.png",
      imgBg: "bg-[#1172BA]",
      cardBg: "bg-[#9CD6FF]", 
      textColor: "text-[#1172BA]",
      badge: "Optimis",
      title: "Purpose Prestige",
      desc: "Aroma yang merefleksikan ketenangan dan kejelasan tujuan.",
      descColor: "text-[#1172BAB2]", 
      price: "Rp189.000",
      btnBg: "bg-[#1172BA]",
      hoverClass: "hover:-rotate-[5deg]", 
    },
    {
      id: 2,
      path: "/src/images/section 5/peaceful-calm.png",
      imgBg: "bg-[#5EA14A]",
      cardBg: "bg-[#C6F5B8]", 
      textColor: "text-[#5EA14A]",
      badge: "Damai",
      title: "Peaceful Calm",
      desc: "Keberanian dan semangat untuk mengekspresikan diri.",
      descColor: "text-[#5EA14A]",
      price: "Rp199.000",
      btnBg: "bg-[#5EA14A]",
      hoverClass: "hover:rotate-[5deg]", 
    },
    {
      id: 3,
      path: "/src/images/section 5/rabel-brave.png",
      imgBg: "bg-[#E33D35]",
      cardBg: "bg-[#FFBBB5]", 
      textColor: "text-[#E33D35]",
      badge: "Berani",
      title: "Rabel Brave",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#E33D35]",
      price: "Rp179.000",
      btnBg: "bg-[#E33D35]",
      hoverClass: "hover:-rotate-[5deg]", 
    },
    {
      id: 4,
      path: "/src/images/section 5/sweet-shy.png",
      imgBg: "bg-[#DD74A5]",
      cardBg: "bg-[#F5D7E7]", 
      textColor: "text-[#DD74A5]",
      badge: "Manis",
      title: "Sweet Shy",
      desc: "Aroma menenangkan yang menyatu dengan diri.",
      descColor: "text-[#DD74A5]",
      price: "Rp189.000",
      btnBg: "bg-[#DD74A5]",
      hoverClass: "hover:rotate-[5deg]", 
    }
  ];

  return (
    // Penyesuaian padding luar agar pas di mobile
    <section className="bg-white flex flex-col items-center text-center w-full pt-12 md:pt-20 pb-32 md:pb-40 px-2 md:px-4 relative overflow-hidden">
      
      {/* 1. Tulisan Tengah Atas */}
      <h2 className="font-['Nohemi'] relative z-10 text-[32px] md:text-[48px] font-bold mb-2 md:mb-3 leading-tight">
        <span className="text-[#1172BA]">Khas </span>
        <span className="text-[#FF8A84]">Evomi</span>
      </h2>

      <p className="font-['Nohemi'] relative z-10 text-[14px] md:text-[20px] text-[#5D5D5D] max-w-2xl mb-10 md:mb-16 px-4">
        <b>Empat karakter aroma yang mewakili sisi berbeda dari dirimu.</b>
      </p>

      {/* 2. Grid Card Produk */}
      {/* Mengubah menjadi grid-cols-2 di mobile agar card menyusut/mengecil dan sejajar */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-7 md:gap-8 mb-12 md:mb-16 px-5 py-5 md:px-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`font-['Nohemi'] relative rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col border border-gray-100 hover:z-20 cursor-pointer ${product.hoverClass}`}
          >
            {/* Bagian Atas: Gambar & Badge */}
            {/* Padding diperkecil (p-3) di mobile */}
            <div className={`relative w-full aspect-square flex justify-center items-center p-3 md:p-6 ${product.imgBg}`}>
              <span className={`absolute top-2 left-2 md:top-5 md:left-5 bg-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[14px] font-bold ${product.textColor}`}>
                {product.badge}
              </span>
              
              <Image 
                src={product.path} 
                alt={product.title} 
                width={340} 
                height={340} 
                className="object-contain drop-shadow-xl w-[85%] md:w-full"
              />
            </div>

            {/* Bagian Bawah: Teks & Info Produk */}
            {/* Teks dan padding menyusut di mobile */}
            <div className={`p-3 md:p-6 flex flex-col flex-grow text-left ${product.cardBg}`}>
              <h3 className={`text-[13px] md:text-[20px] font-bold mb-1 md:mb-2 ${product.textColor}`}>
                {product.title}
              </h3>
              
              <p className={`text-[9px] md:text-[12px] font-medium mb-3 md:mb-6 leading-tight md:leading-relaxed flex-grow ${product.descColor}`}>
                {product.desc}
              </p>
              
              {/* Harga & Tombol Panah (Sejajar) */}
              <div className="flex justify-between items-center mt-auto">
                <span className={`text-[10px] md:text-[14px] font-bold ${product.textColor}`}>
                  {product.price}
                </span>
                
                {/* Tombol diperkecil jadi w-6 h-6 di mobile */}
                <button className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex justify-center items-center text-white transition-transform hover:scale-105 active:scale-95 ${product.btnBg}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* 3. Tombol Lihat Koleksi */}
      {/* Tombol CTA juga sedikit disesuaikan untuk mobile */}
      <Link 
        href="/koleksi" 
        className="relative z-10 font-['Nohemi'] group flex items-center justify-center gap-2 md:gap-4 bg-[#1172BA] text-white text-[14px] md:text-[18px] font-bold px-6 py-3 md:px-10 md:py-4 rounded-full transition-transform duration-200 hover:scale-95 active:scale-90 shadow-md hover:shadow-inner"
      >
        <div className="relative w-[18px] h-[18px] md:w-[24px] md:h-[24px]">
          <Image 
            src="/src/images/section 5/star-medium.png" 
            alt="Star Icon" 
            fill
            className="object-contain brightness-0 invert"
          />
        </div>
        Lihat Koleksi &rarr;
      </Link>

      {/* 4. Animated Wave Background (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full z-0 leading-[0]">
        <svg
          className="block w-full h-[60px] md:h-[130px]"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g>
            <use href="#gentle-wave" x="48" y="0" fill="#60BBFF" fillOpacity="0.3">
              <animate attributeName="x" from="-90" to="85" dur="10s" repeatCount="indefinite" />
            </use>
            <use href="#gentle-wave" x="48" y="3" fill="#60BBFF" fillOpacity="0.6">
              <animate attributeName="x" from="-90" to="85" dur="14s" repeatCount="indefinite" />
            </use>
            <use href="#gentle-wave" x="48" y="5" fill="#60BBFF" fillOpacity="1">
              <animate attributeName="x" from="-90" to="85" dur="20s" repeatCount="indefinite" />
            </use>
          </g>
        </svg>
      </div>

    </section>
  );
}
import Image from 'next/image';
import Link from 'next/link';

export default function FifthSection() {
  // Data gambar produk untuk looping (.map)
  const products = [
    { src: "/src/images/purpose prestige - produk.png", alt: "Purpose Prestige" },
    { src: "/src/images/peaceful calm - produk.png", alt: "Peaceful Calm" },
    { src: "/src/images/rabel brave - produk.png", alt: "Rabel Brave" },
    { src: "/src/images/sweet shy - produk.png", alt: "Sweet Shy" },
  ];

  return (
    <section className="bg-white flex flex-col items-center text-center w-full py-16 px-4">
      
      {/* 1. Tulisan Tengah Atas */}
      {/* Jarak bawah dikurangi (mb-3) agar pas dengan sub-judul di bawahnya */}
      <h2 className="text-[48px] font-bold mb-3 leading-tight">
        <span className="text-[#1172BA]">Khas </span>
        <span className="text-[#FF8A84]">Evomi</span>
      </h2>

      {/* Teks Baru di bawah Khas Evomi (Font size 20px) */}
      <p className="text-[20px] text-gray-600 font-medium mb-12 max-w-2xl mb-10">
        Empat karakter aroma yang mewakili sisi berbeda dari dirimu.
      </p>

      {/* 2. Empat Gambar Posisi Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mb-12 items-center justify-center">
        {products.map((product, index) => (
          <div key={index} className="flex justify-center w-full">
            <Image
              src={product.src}
              alt={product.alt}
              width={267} // GANTI: Sesuaikan lebar asli gambar produk kamu
              height={500} // GANTI: Sesuaikan tinggi asli gambar produk kamu
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* 3. Button Link Berupa Image */}
      <div className="flex justify-center mt-5 mb-5">
        <Link 
          href="/belanja" 
          className="hover:opacity-90 active:scale-95 transition-all inline-block"
        >
          <Image
            src="/src/images/lihat koleksi.png"
            alt="Tombol Lihat Koleksi"
            width={220} 
            height={55}  
            className="w-auto h-auto object-contain"
          />
        </Link>
      </div>

    </section>
  );
}
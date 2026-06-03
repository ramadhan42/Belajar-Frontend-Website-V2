import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-[#0071BC] text-white pt-12 pb-20 px-4 flex flex-col items-center text-center select-none">
      
      {/* 1. Judul Utama (72px) - menggunakan Nohemi font dari globals.css */}
      <h1 className="text-[72px] font-extrabold leading-[1.1] tracking-tight max-w-5xl mb-1 mt-7">
        <span className="text-white">Temukan </span>
        <span className="text-[#5CB2ED]">karakter</span>
        <br />
        <span className="text-[#FFA3CB]">aromamu </span>
        <span className="text-white">di Evomi</span>
      </h1>

      {/* 2. Image Poster (935 x 412 px) */}
      <div className="mb-10 mt-15 rounded-2xl overflow-hidden flex justify-center">
        <Image
          src="/src/images/produk-varian.png" // <-- Ganti dengan path/nama file foto kamu di folder public
          alt="Evomi Poster"
          width={935}
          height={412}
          className="object-cover"
          priority
        />
      </div>

      {/* 3. Teks Deskripsi (20px) */}
      <p className="text-[20px] font-normal leading-relaxed max-w-3xl mb-15 opacity-95">
        <b>Evomi</b> hadir untuk mendukung keunikan dan rasa <br />
        percaya dirimu. Bukan cuma parfum, ini adalah <br />
        bentuk ekspresi jati diri yang berani dan autentik.
      </p>

      {/* 4. Button Jelajahi Koleksi (18px) */}
      <Link
        href="/belanja"
        className="bg-white text-[#0071BC] text-[18px] font-bold px-8 py-3.5 rounded-full hover:bg-opacity-90 transition-all shadow-md inline-flex items-center gap-2 mb-10"
      >
        Jelajahi Koleksi &rarr;
      </Link>

    </section>
  );
}

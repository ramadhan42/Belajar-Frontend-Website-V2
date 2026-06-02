import Image from 'next/image';
import Link from 'next/link';

export default function SecondSection() {
  return (
    <section className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full">
      
      {/* 1. Teks Judul */}
      {/* mt-10 untuk margin atas */}
      <h2 className="mt-15 mb-10 text-[48px] font-extrabold leading-tight">
        <span className="text-[#0071BC]">Kenalan sama</span>
        <br />
        <span className="text-[#F7B497]">karakter </span>
        <span className="text-[#0071BC]">kita yuk!</span>
      </h2>

      {/* 2. Gambar Karakter */}
      {/* mt-10 untuk margin atas, mb-10 untuk margin bawah */}
      <div className="mt-10 mb-10 w-full max-w-5xl flex justify-center">
        {/* Catatan: Di Next.js, folder 'public' tidak perlu ditulis di path */}
        <Image
          src="/src/images/Frame 1.png"
          alt="Karakter Evomi"
          width={1000} // Sesuaikan nilai width dengan ukuran asli gambarmu
          height={500} // Sesuaikan nilai height dengan ukuran asli gambarmu
          className="w-auto h-auto max-w-full object-contain"
        />
      </div>

      {/* 3. Button Lihat Semua Karakter */}
      {/* mb-10 untuk margin bawah */}
      <Link
        href="/karakter" // Sesuaikan rute ini ke halaman yang tepat
        className="mt-10 mb-15 bg-[#0071BC] text-white text-[16px] font-semibold px-8 py-3.5 rounded-full hover:bg-opacity-90 transition-all inline-flex items-center"
      >
        Lihat semua karakter &rarr;
      </Link>

    </section>
  );
}
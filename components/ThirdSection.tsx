import Image from 'next/image';

export default function ThirdSection() {
  return (
    <section className="bg-[#0071BC] flex flex-col items-center text-center w-full px-4">
      
      {/* 1. Teks Atas & Gambar di Sisi Kanan */}
      {/* mt-[60px] dan mb-[60px] digunakan untuk mencapai margin 15 */}
      <div className="flex items-center justify-center gap-4 mt-20 mb-[60px]">
        <h2 className="text-[48px] font-bold">
          <span className="text-white">Brand </span>
          {/* Menggunakan hex code hijau muda, bisa kamu ubah jika ingin tone hijau yang berbeda */}
          <span className="text-[#90EE90]">Value</span>
        </h2>
        <Image
          src="/src/images/Frame 5.png"
          alt="Icon Frame 5"
          width={64} // Sesuaikan angka ini dengan lebar asli Frame 5.png
          height={64} // Sesuaikan angka ini dengan tinggi asli Frame 5.png
          className="object-contain"
        />
      </div>

      {/* 2. Gambar Tengah (Group 34) */}
      <div className="flex justify-center w-full">
        <Image
          src="/src/images/Group 34.png"
          alt="Brand Value Illustration"
          width={1128} // Sesuaikan angka ini dengan lebar asli Group 34.png
          height={343} // Sesuaikan angka ini dengan tinggi asli Group 34.png
          className="object-contain"
        />
      </div>

      {/* 3. Teks Bawah */}
      {/* Warna teks diset putih agar terlihat jelas di atas background biru */}
      <p className="text-white text-[32px] font-bold mt-[60px] mb-20">
        Every Version of Me
      </p>

    </section>
  );
}
import Image from 'next/image';

export default function FourthSection() {
  return (
    // 'relative' digunakan agar gambar di dalamnya (yang absolute) tetap tertahan di dalam area section ini
    // 'min-h-[600px]' (bisa disesuaikan) memastikan section punya tinggi yang cukup jika gambarnya melayang
    // 'overflow-hidden' agar gambar yang keluar batas layar tidak menyebabkan scroll menyamping
    <section className="bg-white relative w-full min-h-[600px] flex justify-center items-center py-20 overflow-hidden">
      
      {/* 1. Gambar Background Center */}
      {/* Gambar ini menjadi pondasi tengah dengan z-index rendah agar bisa ditumpuk jika ukurannya besar */}
      <div className="relative z-10 flex justify-center w-full">
        <Image
          src="/src/images/section 3 image.png"
          alt="Center Background"
          width={1930} // Sesuaikan dengan ukuran asli gambar
          height={1096} // Sesuaikan dengan ukuran asli gambar
          className="object-contain"
        />
      </div>

      {/* 2. Gambar Background Start Top Left */}
      {/* top-10 = margin atas 10 | left-[60px] = setara margin kiri 15 */}
      <div className="absolute left-[150px] top-55 z-20">
        <Image
          src="/src/images/Group 37.png"
          alt="Top Left Decoration"
          width={968} // Sesuaikan
          height={565} // Sesuaikan
          className="object-contain"
        />
      </div>

      {/* 3. Gambar Background Start Top Right */}
      {/* top-[60px] = setara margin atas 15 | right-10 = margin kanan 10 */}
      <div className="absolute top-[120px] right-25 z-20">
        <Image
          src="/src/images/Group 36.png"
          alt="Top Right Decoration"
          width={129} // Sesuaikan
          height={129} // Sesuaikan
          className="object-contain"
        />
      </div>

    </section>
  );
}
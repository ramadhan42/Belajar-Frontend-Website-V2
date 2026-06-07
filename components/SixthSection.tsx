import React from 'react';

export default function SixthSection() {
  return (
    <section
      // PERUBAHAN: Menghapus gap-y-2 md:gap-y-4 agar tidak ada jeda otomatis antar 3 bagian
      className="bg-[#1172BA] flex flex-col items-center justify-center py-4 md:py-6 overflow-hidden select-none"
      style={{ fontFamily: "'Nohemi', sans-serif" }}
    >

      {/* 1. Atas: Header "Packaging Reveal" + Icon Star */}
      <div className="relative z-30 flex items-center justify-center gap-3 text-center px-4 py-2 top-2 md:top-15 md:mb-10">
        <h2 className="text-[24px] md:text-[48px] font-bold">
          <span className="text-white">Packaging</span>{' '}
          <span className="text-[#A5E194]">Reveal</span>
        </h2>
        {/* Menggunakan filter brightness-0 invert agar gambar otomatis menjadi warna putih murni */}
        <img
          src="src/images/section 6/star-medium.png"
          alt="Star Icon"
          className="w-[17px] h-[17px] md:w-[30px] md:h-[30px] object-contain brightness-0 invert"
        />
      </div>

      {/* 2. Tengah: Area Konten Gambar & Tulisan Melayang */}
      {/* PERUBAHAN: my-1 dan py-4 dihilangkan (menjadi my-0 py-0) agar gambar dan teks tengah benar-benar menempel ke atas & bawah */}
      <div className="relative w-full flex flex-col items-center justify-center my-0 px-2 py-2">

        {/* Background Frame Kiri (z-0, posisi kiri responsive melayang) */}
        <img
          src="src/images/section 6/frame-kiri.png"
          alt="Frame Kiri"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1/5 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* Background Frame Kanan (z-0, posisi kanan responsive melayang) */}
        <img
          src="src/images/section 6/frame-kanan.png"
          alt="Frame Kanan"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/5 md:w-auto max-w-[200px] md:max-w-none object-contain z-0 pointer-events-none"
        />

        {/* --- TULISAN MELAYANG ATAS --- */}
        <div className="absolute top-5 md:top-20 left-0 md:left-2 w-full px-4 md:px-60 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium">

          {/* Purpose Prestige (Kiri Atas) */}
          <div className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent md:left-10 p-2 rounded-full md:p-0 whitespace-pre-line text-left">
            <span className="text-[12px] md:text-[22px] font-medium">
              Purpose{'\n'}Prestige
            </span>
            <img
              src="/src/images/section 6/purpose.png"
              alt="Purpose"
              className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain"
            />
          </div>

          {/* Rabel Brave (Kanan Atas) */}
          <div className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left mr-38 md:mr-80">
            <span className="text-[12px] md:text-[22px] font-medium">Rabel{'\n'}Brave</span>
            <img
              src="/src/images/section 6/rabel.png"
              alt="Rabel"
              className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain"
            />
          </div>

        </div>

        {/* Gambar Utama: Packaging (z-20) */}
        <div className="relative z-20 w-full max-w-[400px] sm:max-w-[1206px] md:max-w-[400px] lg:max-w-[1206px] flex justify-center">
          <img
            src="src/images/section 6/packaging.png"
            alt="Packaging Main"
            // PERUBAHAN: Menambahkan class transisi dan rotasi hover di bawah ini
            className="object-contain drop-shadow-xl transition-transform duration-300 ease-in-out hover:rotate-2 cursor-pointer"
          />
        </div>

        {/* --- TULISAN MELAYANG BAWAH --- */}
        <div className="absolute bottom-4 md:bottom-18 left-5 md:left-20 w-full px-25 md:px-100 z-30 flex justify-between items-center text-white text-sm md:text-lg font-medium">

          {/* Peaceful Calm (Kiri Bawah) */}
          <div className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left">
            <span className="text-[12px] md:text-[22px] font-medium">Peaceful{'\n'}Calm</span>
            <img
              src="/src/images/section 6/peaceful.png"
              alt="Peaceful"
              className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain"
            />
          </div>

          {/* Sweet Shy (Kanan Bawah) */}
          <div className="flex items-center gap-2 bg-[#1172BA]/40 md:bg-transparent p-2 rounded-full md:p-0 whitespace-pre-line text-left">
            <span className="text-[12px] md:text-[22px] font-medium">Sweet{'\n'}Shy</span>
            <img
              src="/src/images/section 6/sweetshy.png"
              alt="Sweet"
              className="w-[17px] md:w-[30px] h-[17px] md:h-[30px] object-contain"
            />
          </div>

        </div>

      </div>

      {/* 3. Paling Bawah: Footer Text "Every Version of Me" */}
      {/* PERUBAHAN: Jika ingin lebih mepet ke gambar, kita bisa memakai margin-top negatif seperti -mt-4 jika dirasa masih kurang rapat */}
      <div className="relative z-30 text-center px-4 py-5 mb-0 md:mt-10 md:bottom-12">
        <p className="font-['Nohemi'] text-white text-[17px] md:text-[32px] tracking-wide font-semibold">
          Every Version of Me
        </p>
      </div>

    </section>
  );
}
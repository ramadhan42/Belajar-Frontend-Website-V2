import Image from "next/image";
import Link from "next/link";

export default function SecondSection() {
  // Menambahkan properti 'colorClass' pada masing-masing karakter
  const characters = [
    {
      name: "Purpose\nPrestige",
      path: "/src/images/section 2/purpose-prestige.png",
      colorClass: "text-[#0D71BA]",
    },
    {
      name: "Sweet\nShy",
      path: "/src/images/section 2/sweet-shy.png",
      colorClass: "text-[#DD74A5]",
    },
    {
      name: "Peaceful\nCalm",
      path: "/src/images/section 2/peaceful-calm.png",
      colorClass: "text-[#5EA14A]",
    },
    {
      name: "Rabel\nBrave",
      path: "/src/images/section 2/rabel-brave.png",
      colorClass: "text-[#E33D35]",
    },
  ];

  return (
    // DIUBAH: Menambahkan 'pb-[30px]' agar tombol paling bawah tidak menempel dengan divider baru
    <section className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full overflow-hidden relative pb-[30px]">
     
      {/* ================= STICKY LINGKARAN DIVIDER (BARU) ================= */}
      {/* Wrapper ini dipasang absolute dari pojok kiri ke kanan, memotong setengah tinggi lingkaran */}
      <div className="absolute top-0 left-0 w-full flex justify-center overflow-hidden gap-[15px] h-[23px] pointer-events-none">
        {/* Membuat loop sebanyak 80 item agar deretan lingkaran aman menutup monitor yang sangat lebar (Ultra-wide) */}
        {Array.from({ length: 80 }).map((_, index) => (
          <div
            key={index}
            // Size diatur tetap 46x46px, ditarik ke atas setengah ukuran (-mt-[23px]) untuk menciptakan efek setengah lingkaran melengkung ke bawah
            className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[23px]"
          />
        ))}
      </div>
      {/* =================================================================== */}

      {/* 1. Teks Judul */}
      {/* Mengembalikan mt-14 karena divider atas sudah dipindahkan ke bawah */}
      <h2 className="mt-14 md:mt-20 mb-8 md:mb-10 text-[32px] md:text-[48px] font-extrabold leading-tight">
        <span className="text-[#0071BC]">Kenalan sama</span>
        <br />
        <span className="text-[#F7B497]">karakter </span>
        <span className="text-[#0071BC]">kita yuk!</span>
      </h2>

      {/* 2. Grid 4 Gambar Karakter */}
      <div className="mt-6 md:mt-10 mb-8 md:mb-10 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 justify-items-center">
        {characters.map((char, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out"
          >
            <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] relative flex justify-center items-center">
              <Image
                src={char.path}
                alt={`Karakter ${char.name.replace("\n", " ")}`}
                width={220}
                height={220}
                className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
              />
            </div>

            <p
              className={`mt-4 md:mt-10 text-[18px] sm:text-[22px] md:text-[28.5px] font-bold font-['8-Heavy'] transition-colors duration-300 whitespace-pre-line text-center ${char.colorClass}`}
            >
              {char.name}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Button Lihat Semua Karakter */}
      <Link
        href="/belanja"
        className="bg-[#0071BC] text-white text-[15px] md:text-[18.3px] font-bold px-6 md:px-9 py-3 md:py-4 rounded-full shadow-lg inline-flex items-center gap-2 mb-10 md:mb-15 md:mt-7 relative z-10 transform transition-all duration-200 ease-out hover:scale-95 hover:translate-y-1 hover:shadow-sm"
      >
        Lihat Semua Karakter
        <svg
          className="w-4 h-4 md:w-[19px] md:h-[19px]"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.80933 9.14282H14.476"
            stroke="#ffffff"
            strokeWidth="1.52381"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.14282 3.80957L14.4762 9.1429L9.14282 14.4762"
            stroke="#ffffff"
            strokeWidth="1.52381"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* ================= STICKY LINGKARAN DIVIDER BAWAH (BARU) ================= */}
      {/* Kontainer dipasang di 'bottom-0' dengan tinggi setengah lingkaran 'h-[23px]' */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center overflow-hidden gap-[15px] h-[23px] pointer-events-none">
        {/* Loop sebanyak 80 item agar berderet penuh dari ujung kiri ke ujung kanan layar */}
        {Array.from({ length: 80 }).map((_, index) => (
          <div
            key={index}
            // Lingkaran utuh 46x46px. Karena tinggi wrapper hanya 23px + overflow hidden,
            // otomatis bagian bawah lingkaran terpotong dan lengkungan atasnya menonjol sempurna.
            className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0"
          />
        ))}
      </div>
      {/* ========================================================================= */}
    </section>
  );
}

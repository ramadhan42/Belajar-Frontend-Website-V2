import React from "react";

export default function SeventhSection() {
  return (
    <section className="relative w-full min-h-screen bg-white flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:pl-24 md:pr-0 py-16 md:py-24 overflow-hidden select-none">
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

      {/* ================= SISI KIRI: KONTEN TEKS & TOMBOL ================= */}
      <div className="relative z-10 flex flex-col justify-between items-start h-full max-w-xl gap-12 md:gap-24 mb-20 md:mb-0 md:mt-25 md:left-15">
        {/* Disisi Kiri Atas: Judul Utama */}
        <h2 className="font-nohemi font-semibold md:text-[67px] leading-[1.1] tracking-tighter whitespace-pre-line text-left transition-all duration-300 ease-out hover:rotate-[3deg] cursor-pointer origin-left">
          <span className="text-[#1172BA]">Temukan</span>
          {"\n"}
          <span className="text-[#DD74A5]">aromamu</span>
          {"\n"}
          <span className="text-[#1172BA]">dengan</span>
          {"\n"}
          <span className="text-[#1172BA]">bermain </span>
          <span className="text-[#5EA14A]">kuis</span>
        </h2>

        {/* Disisi Kiri Bawah: Tombol Mulai Kuis */}
        <button className="font-['Nohemi'] text-[18px] sm:text-[22px] md:text-[27px] text-white bg-[#1172BA] px-8 sm:px-12 md:px-14 py-2.5 sm:py-3 md:py-4 rounded-full flex items-center gap-4 shadow-md transition-all duration-200 ease-in-out hover:scale-95 hover:translate-y-1 hover:shadow-inner hover:brightness-95 cursor-pointer origin-center">
          <span>Mulai Kuis</span>
          {/* Simbol Panah Kanan */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 h-6 md:w-7 md:h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>

      {/* ================= SISI KANAN: RECTANGLE & GAMBAR MENTOK KANAN ================= */}
      <div className="relative z-10 md:absolute md:bottom-20 md:right-0 flex justify-end items-end w-full md:w-[750px] h-[400px] md:h-[550px] mt-12 md:mt-0">
        {/* Rectangle Biru (Background) - Mentok Kanan */}
        <div className="absolute bottom-0 right-0 w-full md:w-[780px] h-full md:h-[550px] bg-[#1172BA] rounded-tl-[40px] rounded-bl-[40px] rounded-tr-[40px] md:rounded-tr-none md:rounded-br-none shadow-lg"></div>

        {/* Gambar ditaruh DI LUAR div Rectangle biru agar bebas menembus batas */}
        <img
          src="src/images/section 7/produk.png"
          alt="Produk Evomi"
          className="absolute z-20 bottom-0 top-20 right-0 md:-right-8 w-[100%] md:w-[100%] h-auto max-h-[100%] object-contain object-bottom drop-shadow-2xl transition-all duration-300 ease-out hover:-rotate-[3deg] cursor-pointer origin-top-right"
        />
      </div>

      {/* 4. Animated Wave Background (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full z-0 leading-[0]">
        <svg
          className="block w-full h-[80px] md:h-[130px]"
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
            {/* Gelombang Lapis 1 (Terbelakang - Transparan) */}
            <use
              href="#gentle-wave"
              x="48"
              y="0"
              fill="#60BBFF"
              fillOpacity="0.3"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="10s"
                repeatCount="indefinite"
              />
            </use>
            {/* Gelombang Lapis 2 (Tengah - Semi Transparan) */}
            <use
              href="#gentle-wave"
              x="48"
              y="3"
              fill="#60BBFF"
              fillOpacity="0.6"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="14s"
                repeatCount="indefinite"
              />
            </use>
            {/* Gelombang Lapis 3 (Terdepan - Solid) */}
            <use
              href="#gentle-wave"
              x="48"
              y="5"
              fill="#60BBFF"
              fillOpacity="1"
            >
              <animate
                attributeName="x"
                from="-90"
                to="85"
                dur="20s"
                repeatCount="indefinite"
              />
            </use>
          </g>
        </svg>
      </div>
    </section>
  );
}

import React from "react";

export default function SeventhSection() {
  return (
    // Mengurangi padding vertical di mobile (py-12) dan kembali normal di desktop (md:py-24)
    <section className="relative w-full min-h-screen bg-white flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:pl-24 md:pr-0 py-12 md:py-24 overflow-hidden select-none">
      
      {/* ================= STICKY LINGKARAN DIVIDER ================= */}
      <div className="absolute top-0 left-0 w-full flex justify-center overflow-hidden gap-[15px] h-[23px] pointer-events-none">
        {Array.from({ length: 80 }).map((_, index) => (
          <div
            key={index}
            className="w-[46px] h-[46px] bg-[#1172BA] rounded-full flex-shrink-0 -mt-[23px]"
          />
        ))}
      </div>

      {/* ================= SISI KIRI: KONTEN TEKS & TOMBOL ================= */}
      {/* PERUBAHAN: Ditambahkan items-center md:items-start agar rata tengah di mobile */}
      <div className="relative z-10 flex flex-col justify-center md:justify-between items-center md:items-start w-full md:w-auto h-full max-w-xl gap-8 md:gap-24 mb-12 md:mb-0 mt-8 md:mt-45 md:left-5 text-center md:text-left">
        
        {/* Disisi Kiri Atas: Judul Utama */}
        {/* PERUBAHAN: Ditambahkan text-center md:text-left dan origin-center md:origin-left */}
        <h2 className="font-nohemi font-semibold text-[36px] sm:text-[42px] md:text-[55px] leading-[1.1] whitespace-pre-line text-center md:text-left transition-all duration-300 ease-out hover:rotate-[3deg] cursor-pointer origin-center md:origin-left">
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
        <button className="font-['Nohemi'] mt-5 text-[18px] sm:text-[22px] md:text-[27px] text-white bg-[#1172BA] px-11 sm:px-12 md:px-14 py-3 sm:py-3 md:py-4 rounded-full flex items-center justify-center gap-3 md:gap-4 shadow-md transition-all duration-200 ease-in-out hover:scale-95 hover:translate-y-1 hover:shadow-inner hover:brightness-95 cursor-pointer z-20">
          <span>Mulai Kuis</span>
          {/* Simbol Panah Kanan */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>

      {/* ================= SISI KANAN: RECTANGLE & GAMBAR ================= */}
      {/* Ketinggian container dikurangi di mobile (h-[320px]) agar gambar tidak terlalu makan tempat */}
      <div className="relative z-10 md:absolute md:bottom-20 md:right-0 flex justify-end items-end w-full md:w-[750px] h-[320px] sm:h-[400px] md:h-[550px] mt-0 md:mt-0">
        
        {/* Rectangle Biru (Background) - Mentok Kanan */}
        <div className="absolute bottom-0 right-0 w-full md:w-[780px] h-[290px] md:h-[550px] bg-[#1172BA] rounded-[24px] md:rounded-tl-[40px] md:rounded-bl-[40px] md:rounded-tr-none md:rounded-br-none shadow-lg"></div>

        {/* Gambar Produk: Diperbesar melebihi kotaknya di mobile agar terkesan pop-out */}
        <img
          src="src/images/section 7/produk.png"
          alt="Produk Evomi"
          className="absolute z-20 bottom-0 top-20 right-0 md:-right-8 w-[95%] sm:w-[90%] md:w-[100%] h-auto max-h-[120%] md:max-h-[100%] object-contain object-bottom drop-shadow-2xl transition-all duration-300 ease-out hover:-rotate-[3deg] cursor-pointer origin-top-right"
        />
      </div>

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
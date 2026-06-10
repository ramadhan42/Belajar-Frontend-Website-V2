import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Latar belakang luar putih murni dengan font Nohemi
    <div className="bg-[#2B92DE] min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-nohemi">
      
      {/* Efek gradasi lingkaran halus untuk estetika background putih */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-50 rounded-full blur-[120px]" />

      {/* --- 4 KARAKTER EVOMI (Berada di atas background putih) --- */}
      
       {/* 1. Kiri Atas (Agak Tengah, Miring Kiri) */}
      <div className="absolute top-[8%] left-[5%] md:top-[12%] md:left-[15%] -rotate-12 w-24 h-24 md:w-36 md:h-36 opacity-90 z-0 drop-shadow-2xl hover:rotate-0 transition-transform duration-300">
        <img 
          src="src\images\section 2\purpose-prestige.png" 
          alt="Evomi Char 1" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* 2. Kanan Atas (Agak Tengah, Miring Kanan) */}
      <div className="absolute top-[12%] right-[5%] md:top-[15%] md:right-[15%] rotate-12 w-24 h-24 md:w-36 md:h-36 opacity-90 z-0 drop-shadow-2xl hover:rotate-0 transition-transform duration-300">
        <img 
          src="..\src\images\section 2\peaceful-calm.png" 
          alt="Evomi Char 2" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* 3. Kiri Bawah (Agak Tengah, Miring Kanan) */}
      <div className="absolute bottom-[12%] left-[8%] md:bottom-[15%] md:left-[15%] rotate-6 w-24 h-24 md:w-36 md:h-36 opacity-90 z-0 drop-shadow-2xl hover:-rotate-12 transition-transform duration-300">
        <img 
          src="..\src\images\section 2\sweet-shy.png" 
          alt="Evomi Char 3" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* 4. Kanan Bawah (Agak Tengah, Miring Kiri) */}
      <div className="absolute bottom-[12%] right-[8%] md:bottom-[12%] md:right-[15%] -rotate-[15deg] w-24 h-24 md:w-36 md:h-36 opacity-90 z-0 drop-shadow-2xl hover:rotate-6 transition-transform duration-300">
        <img 
          src="..\src\images\section 2\rabel-brave.png" 
          alt="Evomi Char 4" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* --- Container Card Utama Warna #1172ba --- */}
      <div className="w-full max-w-[480px] bg-[#1172ba] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-blue-950/20 border border-blue-600/20 relative z-10">
        {children}
      </div>
    </div>
  );
}
import Image from 'next/image';
import Link from 'next/link';

export default function SecondSection() {
  // Menambahkan properti 'colorClass' pada masing-masing karakter
  const characters = [
    { 
      name: 'Purpose\nPrestige', 
      path: '/src/images/section 2/purpose-prestige.png',
      colorClass: 'text-[#0D71BA]' 
    },
    { 
      name: 'Sweet\nShy', 
      path: '/src/images/section 2/sweet-shy.png',
      colorClass: 'text-[#DD74A5]' 
    },
    { 
      name: 'Peaceful\nCalm', 
      path: '/src/images/section 2/peaceful-calm.png',
      colorClass: 'text-[#5EA14A]' 
    },
    { 
      name: 'Rabel\nBrave', 
      path: '/src/images/section 2/rabel-brave.png',
      colorClass: 'text-[#E33D35]' 
    },
  ];

  return (
    <section className="bg-[#ffffff] flex flex-col items-center text-center px-4 w-full">

      {/* 1. Teks Judul */}
      <h2 className="mt-15 mb-10 text-[48px] font-extrabold leading-tight">
        <span className="text-[#0071BC]">Kenalan sama</span>
        <br />
        <span className="text-[#F7B497]">karakter </span>
        <span className="text-[#0071BC]">kita yuk!</span>
      </h2>

      {/* 2. Grid 4 Gambar Karakter */}
      <div className="mt-10 mb-10 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
        {characters.map((char, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out"
          >
            <div className="w-[220px] h-[220px] relative flex justify-center items-center">
              <Image
                src={char.path}
                alt={`Karakter ${char.name.replace('\n', ' ')}`}
                width={220}
                height={220}
                className="object-contain drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
              />
            </div>
            
            {/* Teks Deskripsi */}
            {/* Mengganti text-[#1172BA] statis dengan ${char.colorClass} dinamis dari array */}
            <p className={`mt-10 text-[28.5px] font-bold font-['8-Heavy'] transition-colors duration-300 whitespace-pre-line text-center ${char.colorClass}`}>
              {char.name}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Button Lihat Semua Karakter */}
      <Link
        href="/karakter"
        className="mt-10 mb-15 bg-[#0071BC] text-white text-[16px] font-semibold px-8 py-3.5 rounded-full hover:bg-opacity-90 hover:scale-95 active:scale-90 transition-all duration-200 inline-flex items-center shadow-md hover:shadow-inner"
      >
        Lihat semua karakter &rarr;
      </Link>

    </section>
  );
}
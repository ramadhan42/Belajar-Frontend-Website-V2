import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="w-full bg-[#1172BA] py-16 px-6 md:px-24" style={{ fontFamily: "'Nohemi', sans-serif" }}>

            {/* BARIS PERTAMA: GRID 4 KOLOM */}
            {/* BARIS PERTAMA: GRID 4 KOLOM DENGAN JUSITFY-AROUND */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center gap-y-12 mb-16 px-4">

                {/* Kolom 1: Buletin */}
                <div className="flex flex-col gap-4 w-full max-w-[380px]">
                    <h3 className="text-[36px] text-white font-bold leading-tight">Buletin Evomi</h3>
                    <p className="text-[16px] text-white opacity-90">
                        Daftar untuk menerima koleksi terbaru, penawaran eksklusif, dan cerita tentang setiap karakter aroma.
                    </p>
                    <div className="flex items-center bg-white rounded-full p-1 w-full h-[48px] mt-2">
                        <input
                            type="email"
                            placeholder="email@kamu.com"
                            className="flex-grow bg-transparent outline-none px-4 text-[14px] text-gray-500 placeholder-gray-300"
                        />
                        <button className="bg-[#1172BA] text-white w-[97px] h-[40px] rounded-full text-[14px] font-bold hover:bg-[#0e5d99] transition-colors">
                            Daftar
                        </button>
                    </div>
                </div>

                {/* Kolom 2: Menu */}
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                    <span className="text-[14px] text-white/70">Menu</span>
                    <ul className="flex flex-col gap-3 text-white">
                        <li className="text-[16px] cursor-pointer hover:underline">Beranda</li>
                        <li className="text-[16px] cursor-pointer hover:underline">Belanja</li>
                        <li className="text-[16px] cursor-pointer hover:underline">Kuis</li>
                    </ul>
                </div>

                {/* Kolom 3: Bantuan */}
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                    <span className="text-[14px] text-white/70">Bantuan</span>
                    <ul className="flex flex-col gap-3 text-white">
                        <li className="text-[16px] cursor-pointer hover:underline">FAQ</li>
                        <li className="text-[16px] cursor-pointer hover:underline">Pengiriman</li>
                        <li className="text-[16px] cursor-pointer hover:underline">Kontak</li>
                    </ul>
                </div>

                {/* Kolom 4: Social */}
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                    <span className="text-[14px] text-white/70">Social</span>
                    <div className="flex gap-4 text-white">
                        <FaInstagram size={20} className="cursor-pointer hover:scale-110 transition-transform" />
                        <FaTwitter size={20} className="cursor-pointer hover:scale-110 transition-transform" />
                        <FaFacebookF size={20} className="cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[16px] text-white mt-1">evomi.id</span>
                </div>

            </div>

            {/* DIVIDER */}
            <div className="w-[90%] h-[1px] bg-white rounded-full mx-auto mb-10 opacity-30"></div>

            {/* BARIS KEDUA: COPYRIGHT */}
            <div className="flex flex-col md:flex-row justify-between items-center text-white text-[14px] opacity-90 px-4 md:px-10">
                <p>© 2026 evomi.id — Every Version of Me</p>
                <p className="mt-4 md:mt-0">Discover the scent of every personality</p>
            </div>

        </footer>
    );
}
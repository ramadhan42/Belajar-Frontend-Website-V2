"use client";

import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { motion, Variants } from "framer-motion";
import { useNavbarColor } from "@/context/NavbarColorContext"; // 1. Import Context


export default function Footer() {
    const { navbarColor } = useNavbarColor(); // 2. Ambil nilai warna dari Context
    const { footerColor } = useNavbarColor(); // Ambil footerColor

    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <footer
            className="w-full py-12 md:py-16 px-6 md:px-24 transition-colors duration-0"
            style={{
                fontFamily: "'Nohemi', sans-serif",
                backgroundColor: footerColor // Menggunakan warna footer spesifik
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
            >
                {/* BARIS PERTAMA: BAGIAN UTAMA */}
                <div className="flex flex-col lg:flex-row justify-between gap-y-12 lg:gap-y-0 mb-12 md:mb-16 px-0 md:px-4">

                    {/* 1. Buletin Evomi */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-3 md:gap-4 w-full lg:w-[40%] max-w-[380px] mx-auto lg:mx-0 text-center lg:text-left items-center lg:items-start">
                        <h3 className="text-[28px] md:text-[36px] text-white font-bold leading-tight">Buletin Evomi</h3>
                        <p className="text-[14px] md:text-[16px] text-white opacity-90">
                            Daftar untuk menerima koleksi terbaru, penawaran eksklusif, dan cerita tentang setiap karakter aroma.
                        </p>
                        <div className="flex items-center bg-white rounded-full p-1 w-full h-[44px] md:h-[48px] mt-2">
                            <input type="email" placeholder="email@kamu.com" className="flex-grow bg-transparent outline-none px-4 text-[12px] md:text-[14px] text-gray-500 placeholder-gray-300" />
                            <button className="text-white w-[85px] md:w-[97px] h-[36px] md:h-[40px] rounded-full text-[12px] md:text-[14px] font-bold hover:bg-[#0e5d99] transition-colors" style={{

                                backgroundColor: footerColor // 3. Gunakan warna dari Context
                            }}>Daftar</button>
                        </div>
                    </motion.div>

                    {/* Grup Kanan: Menu, Bantuan, Social */}
                    <div className="flex flex-row justify-between items-start w-full lg:w-[50%] gap-2 sm:gap-8 mt-4 lg:mt-0">

                        {/* 2. Menu */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2 md:gap-4 w-1/3">
                            <span className="text-[12px] md:text-[14px] text-white/70">Menu</span>
                            <ul className="flex flex-col gap-2 md:gap-3 text-white">
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">Beranda</li>
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">Belanja</li>
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">Kuis</li>
                            </ul>
                        </motion.div>

                        {/* 3. Bantuan */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2 md:gap-4 w-1/3">
                            <span className="text-[12px] md:text-[14px] text-white/70">Bantuan</span>
                            <ul className="flex flex-col gap-2 md:gap-3 text-white">
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">FAQ</li>
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">Pengiriman</li>
                                <li className="text-[13px] md:text-[16px] cursor-pointer hover:underline">Kontak</li>
                            </ul>
                        </motion.div>

                        {/* 4. Social */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2 md:gap-4 w-1/3">
                            <span className="text-[12px] md:text-[14px] text-white/70">Social</span>
                            <div className="flex gap-3 md:gap-4 text-white">
                                <FaInstagram className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                                <FaTwitter className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                                <FaFacebookF className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] cursor-pointer hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[13px] md:text-[16px] text-white mt-1">evomi.id</span>
                        </motion.div>
                    </div>
                </div>

                {/* DIVIDER & COPYRIGHT */}
                <motion.div variants={itemVariants}>
                    <div className="w-[90%] md:w-full max-w-7xl h-[1px] bg-white rounded-full mx-auto mb-6 md:mb-10 opacity-30"></div>
                    <div className="flex flex-col md:flex-row justify-between items-center text-white text-[12px] md:text-[14px] opacity-90 px-0 md:px-4 text-center">
                        <p>© 2026 evomi.id — Every Version of Me</p>
                        <p className="mt-2 md:mt-0">Discover the scent of every personality</p>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
}
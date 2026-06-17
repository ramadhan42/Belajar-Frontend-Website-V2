"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Mail, HelpCircle } from "lucide-react";

// Force dynamic rendering as discussed to prevent caching issues
export const dynamic = "force-dynamic";

const faqData = {
  "Pesanan & Pembayaran": [
    { q: "Bagaimana cara melacak pesanan saya?", a: "Setelah pesanan diproses, Anda akan menerima email konfirmasi dengan nomor pelacakan yang dapat dipantau di halaman 'Status Pesanan'." },
    { q: "Metode pembayaran apa yang tersedia?", a: "Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet (GoPay, OVO, Dana), dan kartu kredit." },
  ],
  "Pengiriman & Retur": [
    { q: "Berapa lama estimasi pengiriman?", a: "Pengiriman reguler memakan waktu 2-4 hari kerja. Kami juga menyediakan opsi pengiriman instan untuk wilayah Jabodetabek." },
    { q: "Bisakah saya mengembalikan produk?", a: "Kami menerima retur jika produk rusak saat diterima. Pastikan untuk melampirkan video unboxing sebagai syarat klaim." },
  ],
  "Tentang Aroma": [
    { q: "Apakah parfum Evomi aman untuk kulit?", a: "Ya, setiap racikan parfum Evomi menggunakan bahan-bahan yang telah tersertifikasi aman untuk kulit." },
    { q: "Bagaimana cara memilih aroma yang tepat?", a: "Anda dapat mencoba Kuis Persona kami di halaman utama untuk mendapatkan rekomendasi aroma berdasarkan kepribadian Anda." },
  ],
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      className="border-b border-gray-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-6 text-left group"
      >
        <span className="text-[16px] md:text-[18px] font-medium text-gray-800 group-hover:text-[#1172BA] transition-colors">
          {question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[15px] md:text-[16px] text-gray-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-24 font-['Nohemi',sans-serif]">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[32px] md:text-[48px] font-bold text-gray-900 mb-6"
        >
          Pusat Bantuan Evomi
        </motion.h1>
        <p className="text-gray-500 text-[16px] md:text-[18px]">
          Ada yang bisa kami bantu? Temukan jawaban atas pertanyaan yang paling sering diajukan di sini.
        </p>

        {/* Search Bar */}
        <div className="relative mt-10 max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari topik bantuan..." 
            className="w-full h-[56px] pl-12 pr-4 rounded-full border border-gray-200 outline-none focus:border-[#1172BA] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
        {Object.entries(faqData).map(([category, items]) => (
          <motion.div 
            key={category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[20px] font-bold text-[#1172BA] mb-4 uppercase tracking-widest text-sm">
              {category}
            </h2>
            <div className="bg-white rounded-2xl">
              {items.map((item, index) => (
                <FAQItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-20 p-8 md:p-12 bg-gray-50 rounded-[32px] text-center"
      >
        <HelpCircle className="w-12 h-12 text-[#1172BA] mx-auto mb-6" />
        <h3 className="text-[24px] font-bold text-gray-900 mb-2">Masih butuh bantuan?</h3>
        <p className="text-gray-600 mb-8">Tim kami siap membantu Anda setiap hari Senin - Jumat.</p>
        <a 
          href="/kontak" 
          className="inline-flex items-center gap-2 bg-[#1172BA] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0e609d] transition-all"
        >
          <Mail className="w-5 h-5" />
          Hubungi Customer Service
        </a>
      </motion.div>
    </div>
  );
}
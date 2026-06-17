"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// Memastikan halaman selalu fresh saat diakses
export const dynamic = "force-dynamic";

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-24 font-['Nohemi',sans-serif]">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[32px] md:text-[48px] font-bold text-gray-900 mb-6"
        >
          Hubungi Kami
        </motion.h1>
        <p className="text-gray-500 text-[16px] md:text-[18px]">
          Punya pertanyaan atau ingin berkolaborasi? Tim Evomi siap mendengarkan Anda.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-gray-50 p-8 md:p-10 rounded-[32px]"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nama Anda" className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]" />
              <input type="email" placeholder="Email Anda" className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]" />
            </div>
            <input type="text" placeholder="Subjek" className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]" />
            <textarea placeholder="Tulis pesan Anda di sini..." className="w-full h-[150px] p-5 rounded-3xl border border-gray-200 outline-none focus:border-[#1172BA] resize-none"></textarea>
            <button className="w-full h-[56px] bg-[#1172BA] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0e609d] transition-all">
              Kirim Pesan <Send size={18} />
            </button>
          </form>
        </motion.div>

        {/* Info Section */}
        <div className="flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4 p-6 border border-gray-100 rounded-3xl"
          >
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl"><Mail /></div>
            <div>
              <h4 className="font-bold text-gray-900">Email</h4>
              <p className="text-gray-600">hello@evomi.id</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-6 border border-gray-100 rounded-3xl"
          >
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl"><Phone /></div>
            <div>
              <h4 className="font-bold text-gray-900">WhatsApp</h4>
              <p className="text-gray-600">+62 812-3456-7890</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-6 border border-gray-100 rounded-3xl"
          >
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl"><MapPin /></div>
            <div>
              <h4 className="font-bold text-gray-900">Kantor Pusat</h4>
              <p className="text-gray-600">Jakarta, Indonesia</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
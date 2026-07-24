"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Truck, Package, Clock, ShieldCheck, MapPin } from "lucide-react";

const shippingSteps = [
  {
    icon: Package,
    title: "Pesanan Diterima",
    desc: "Sistem kami memverifikasi detail pesanan Anda.",
  },
  {
    icon: Clock,
    title: "Proses Pengemasan",
    desc: "Tim kami menyiapkan parfum dengan keamanan ekstra.",
  },
  {
    icon: Truck,
    title: "Dalam Perjalanan",
    desc: "Kurir mengirimkan paket ke lokasi Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Paket Diterima",
    desc: "Nikmati aroma baru dari Evomi!",
  },
];

export default function PengirimanPage() {
  const router = useRouter();
  const [resi, setResi] = useState("");
  const [error, setError] = useState("");

  const handleLacak = () => {
    const value = resi.trim();
    if (!value) {
      setError("Masukkan nomor resi terlebih dahulu. Pesanan tanpa no resi belum bisa dilacak.");
      return;
    }
    setError("");
    router.push(`/pengiriman/${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 md:px-12 lg:px-24 font-nohemi">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[32px] md:text-[48px] font-bold text-gray-900 mb-6"
        >
          Informasi Pengiriman
        </motion.h1>
        <p className="text-gray-500 text-[16px] md:text-[18px]">
          Kami memastikan setiap tetes aroma Evomi sampai ke tangan Anda dengan
          aman dan tepat waktu.
        </p>
      </div>

      {/* Stepper Section */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-[20px] font-bold text-[#1172BA] mb-12 text-center uppercase tracking-widest">
          Alur Pengiriman Kami
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {shippingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-[#1172BA]">
                <step.icon size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Details Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 border border-gray-100 rounded-[32px]">
          <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
            <MapPin className="text-[#1172BA]" /> Estimasi Waktu
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li>• Jabodetabek: 1-2 hari kerja</li>
            <li>• Pulau Jawa: 2-3 hari kerja</li>
            <li>• Luar Pulau Jawa: 3-5 hari kerja</li>
          </ul>
        </div>

        <div className="p-8 bg-[#1172BA] text-white rounded-[32px]">
          <h3 className="text-[20px] font-bold mb-4">Lacak Pesanan Anda</h3>
          <p className="mb-6 opacity-90">
            Masukkan nomor resi pengiriman Anda. Jika resi belum tersedia,
            paket belum bisa dilacak.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={resi}
              onChange={(e) => {
                setResi(e.target.value);
                if (error) setError("");
              }}
              placeholder="Masukkan nomor resi..."
              className="w-full h-[48px] rounded-full px-4 text-gray-900 outline-none bg-white text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLacak();
              }}
            />
            <button
              onClick={handleLacak}
              className="bg-white text-[#1172BA] px-6 rounded-full font-bold hover:bg-gray-100 transition-colors active:scale-95 shrink-0"
            >
              Lacak
            </button>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-amber-100 bg-white/10 rounded-xl px-3 py-2">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

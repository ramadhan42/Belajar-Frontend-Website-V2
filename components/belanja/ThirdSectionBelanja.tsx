"use client";

import React from "react";
import Image from "next/image"; // Gunakan jika ada gambar asli nanti

const products = [
  { id: 1, name: "Evomi Aroma 1", price: "Rp 150.000", desc: "Scent of joy" },
  { id: 2, name: "Evomi Aroma 2", price: "Rp 150.000", desc: "Scent of peace" },
  {
    id: 3,
    name: "Evomi Aroma 3",
    price: "Rp 150.000",
    desc: "Scent of energy",
  },
  { id: 4, name: "Evomi Aroma 4", price: "Rp 150.000", desc: "Scent of focus" },
];

export default function ThirdSectionBelanja() {
  return (
    <section className="w-full px-5 md:px-12 lg:px-24 py-16 bg-[#1172BA]">
        
      {/* Judul Bagian */}
      <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-12">
        Koleksi Kami
      </h2>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
        {products.map((product, index) => {
          // Logika Rotasi:
          // Index 0 dan 2 (Produk 1 & 3) -> putar kanan 5 derajat
          // Index 1 dan 3 (Produk 2 & 4) -> putar kiri -5 derajat
          const rotationClass =
            index % 2 === 0 ? "hover:rotate-[5deg]" : "hover:-rotate-[5deg]";

          return (
            <div
              key={product.id}
              className={`bg-white rounded-3xl p-5 flex flex-col items-center justify-between shadow-lg transition-transform duration-300 ease-out cursor-pointer ${rotationClass}`}
            >
              {/* Area Gambar (Placeholder) */}
              <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-5 flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  Gambar {product.id}
                </span>
                {/* Jika punya gambar, ganti dengan: 
                  <Image src="/path-gambar.jpg" alt={product.name} width={200} height={200} className="rounded-2xl object-cover" /> 
                */}
              </div>

              {/* Detail Produk */}
              <div className="text-center w-full">
                <h3 className="text-[#1172BA] font-bold text-lg md:text-xl leading-tight">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{product.desc}</p>
                <p className="text-gray-800 font-semibold mt-3 mb-5">
                  {product.price}
                </p>

                {/* Tombol Beli */}
                <button className="w-full bg-[#1172BA] text-white py-3 rounded-full text-sm font-bold hover:bg-[#0e5d99] transition-colors shadow-sm">
                  Masukkan Keranjang
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

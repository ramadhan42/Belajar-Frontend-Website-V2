"use client";
import { useState } from "react";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("qris");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Penyelesaian Pesanan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Pengiriman & Pembayaran */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section Alamat */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Pengiriman</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nama Penerima" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
              <textarea placeholder="Alamat Lengkap Pengiriman" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none" />
            </div>
          </div>

          {/* Section Metode Pembayaran */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === 'qris' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="qris" className="hidden" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                <span className="font-semibold text-gray-900">QRIS</span>
                <span className="text-xs text-gray-500">Gopay, OVO, Dana, dll</span>
              </label>
              
              <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="cash" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span className="font-semibold text-gray-900">Cash (COD)</span>
                <span className="text-xs text-gray-500">Bayar di tempat</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ringkasan Pesanan (Sidebar Checkout) */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-200 pb-4">
            <div className="flex justify-between">
              <span>Subtotal produk</span>
              <span className="font-medium text-gray-900">Rp 250.000</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span className="font-medium text-gray-900">Rp 20.000</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mb-8">
            <span>Total Tagihan</span>
            <span>Rp 270.000</span>
          </div>
          
          <button className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-md">
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
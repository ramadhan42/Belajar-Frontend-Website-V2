"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

// Memastikan halaman selalu fresh saat diakses
export const dynamic = "force-dynamic";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // Ganti URL dengan endpoint API Laravel Anda.
      // Disarankan menggunakan environment variable: process.env.NEXT_PUBLIC_API_URL + '/api/contact'
      const response = await fetch("http://localhost:8000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: data.message });
        setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
      } else {
        setStatus({
          type: "error",
          message: data.message || "Gagal mengirim pesan.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Terjadi kesalahan koneksi. Pastikan server berjalan.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          Punya pertanyaan atau ingin berkolaborasi? Tim Evomi siap mendengarkan
          Anda.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-gray-50 p-8 md:p-10 rounded-[32px]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {status.type && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Anda"
                required
                className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Anda"
                required
                className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]"
              />
            </div>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subjek"
              required
              className="w-full h-[52px] px-5 rounded-full border border-gray-200 outline-none focus:border-[#1172BA]"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tulis pesan Anda di sini..."
              required
              className="w-full h-[150px] p-5 rounded-3xl border border-gray-200 outline-none focus:border-[#1172BA] resize-none"
            ></textarea>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[56px] bg-[#1172BA] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0e609d] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  Mengirim... <Loader2 size={18} className="animate-spin" />
                </>
              ) : (
                <>
                  Kirim Pesan <Send size={18} />
                </>
              )}
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
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl">
              <Mail />
            </div>
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
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl">
              <Phone />
            </div>
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
            <div className="p-3 bg-blue-50 text-[#1172BA] rounded-2xl">
              <MapPin />
            </div>
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

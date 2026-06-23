"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Eye } from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/contact`);
      const data = await res.json();
      setMessages(data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter berdasarkan nama, email, atau subject
  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-gray-500 mt-1">Daftar kontak atau pesan yang dikirim oleh pelanggan.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesan (nama, email, subject)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-2 focus:ring-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Pengirim</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Pesan Singkat</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMessages.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{m.email}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{m.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                    {m.message.length > 50 ? `${m.message.substring(0, 50)}...` : m.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(m.created_at).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMessages.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">
              Tidak ada pesan ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
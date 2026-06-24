"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Eye, X, Calendar } from "lucide-react";

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

  // State untuk melihat detail pesan di dalam Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenDetail = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-gray-500 mt-1">Daftar kontak atau pesan yang dikirim oleh pelanggan melalui form hubungi kami.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesan (nama, email, subject)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {/* Judul Pengirim & Email Diubah Ketengah */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[250px]">
                  Pengirim
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Pesan Singkat
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/40 transition-colors group">
                    {/* Mengagak-tengahkan Data Pengirim dengan Blok Info Rata Kiri */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-center max-w-xs mx-auto text-left">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors shadow-sm">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {m.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                      {m.message.length > 50 ? `${m.message.substring(0, 50)}...` : m.message}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-colors"
                      >
                        <Eye size={14} />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400 font-medium">
                    Tidak ada pesan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREVIEW DETAIL PESAN MASUK */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-900 text-white shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Detail Isi Pesanan</h3>
                  <p className="text-xs text-gray-500 mt-0.5">ID Kontak: #{selectedMessage.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Konten Utama Detail */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Pengirim</span>
                  <span className="text-sm font-semibold text-gray-900 block mt-0.5">{selectedMessage.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Alamat Email</span>
                  <span className="text-sm font-semibold text-gray-600 block mt-0.5 break-all">{selectedMessage.email}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Subject / Perihal</span>
                <div className="text-sm font-bold text-gray-900 bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100">
                  {selectedMessage.subject}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Isi Pesan Lengkap</span>
                <div className="text-sm text-gray-700 bg-gray-50/30 px-4 py-3 rounded-xl border border-gray-100 whitespace-pre-line leading-relaxed max-h-[200px] overflow-y-auto font-medium">
                  "{selectedMessage.message}"
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-2">
                <Calendar size={14} />
                <span>Dikirim pada: </span>
                <span className="text-gray-600">
                  {new Date(selectedMessage.created_at).toLocaleDateString("id-ID", {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })} WIB
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 shadow-sm transition-colors"
              >
                Tutup Pesan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
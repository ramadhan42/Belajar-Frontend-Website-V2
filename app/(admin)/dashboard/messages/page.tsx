"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Eye, X, Calendar, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

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

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Reset halaman ke 1 jika user melakukan pencarian baru
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // LOGIKA FILTER & PAGINATION
  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pesan Masuk</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Daftar kontak atau pesan yang dikirim oleh pelanggan melalui form hubungi kami.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesan (nama, email, subject)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Wrapper Table untuk Responsivitas Mobile */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left w-[280px]">
                  Pengirim
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left w-[200px]">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  Pesan Singkat
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[150px]">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[120px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedMessages.length > 0 ? (
                paginatedMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5" title={m.email}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 truncate" title={m.subject}>
                        {m.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 font-medium truncate max-w-[250px]" title={m.message}>
                        {m.message.length > 60 ? `${m.message.substring(0, 60)}...` : m.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-gray-600">
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(m)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl shadow-sm transition-all"
                      >
                        <Eye size={14} />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Inbox size={40} className="mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">Tidak ada pesan yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* NAVIGASI PAGINATION */}
          {filteredMessages.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-gray-50/50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="text-sm font-bold text-gray-700 min-w-[80px] text-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                {currentPage} <span className="text-gray-400 font-medium mx-1">/</span> {totalPages}
              </div>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PREVIEW DETAIL PESAN MASUK */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gray-900 text-white shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Detail Pesan Masuk</h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">ID Kontak: #{selectedMessage.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-200/80 text-gray-400 hover:text-gray-700 transition-colors bg-white border border-gray-200 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Konten Utama Detail */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nama Pengirim</span>
                  <span className="text-sm font-bold text-gray-900 block mt-1">{selectedMessage.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Alamat Email</span>
                  <span className="text-sm font-bold text-gray-600 block mt-1 break-all">{selectedMessage.email}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Subject / Perihal</span>
                <div className="text-sm font-bold text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                  {selectedMessage.subject}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Isi Pesan Lengkap</span>
                <div className="text-sm text-gray-700 bg-gray-50/50 px-4 py-4 rounded-xl border border-gray-200 whitespace-pre-line leading-relaxed max-h-[240px] overflow-y-auto font-medium shadow-inner">
                  "{selectedMessage.message}"
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pt-2 border-t border-gray-50">
                <Calendar size={14} className="text-gray-400" />
                <span>Dikirim pada: </span>
                <span className="text-gray-700">
                  {new Date(selectedMessage.created_at).toLocaleDateString("id-ID", {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })} WIB
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/80 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 shadow-sm transition-all"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
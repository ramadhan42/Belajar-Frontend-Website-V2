"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Eye,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Reply,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import AdminModal from "@/components/admin/AdminModal";
import { getAdminHeaders } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";

// Definisikan tipe data untuk riwayat balasan
interface ContactReply {
  id: number;
  contact_message_id: number;
  reply_message: string;
  replied_by: number;
  created_at: string;
}

// Definisikan tipe data untuk pesan utama
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  replies?: ContactReply[]; // Menampung array riwayat chat balasan
}

export default function MessagesPage() {
  const { t, common } = useAdminI18n();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE MODAL DETAIL & BALAS
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
  // STATE INPUT BALASAN
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      
      // Mengamankan data array hasil fetch
      const fetchedData = data?.data || [];
      setMessages(fetchedData);

      // Sinkronisasi data real-time jika modal chat sedang terbuka agar pesan baru langsung muncul
      if (selectedMessage) {
        const currentUpdated = fetchedData.find((m: ContactMessage) => m.id === selectedMessage.id);
        if (currentUpdated) setSelectedMessage(currentUpdated);
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // AKSI UNTUK MEMBALAS CHAT
  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    setIsReplying(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/contact/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ reply_message: replyText }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText(""); // Kosongkan form teks
        await fetchMessages(); // Refresh data utama & list chat di dalam modal
      } else {
        alert(
          data.message ||
            t(
              "messages",
              "reply_error",
              "Gagal mengirim balasan.",
              "Failed to send reply.",
            ),
        );
      }
    } catch (error) {
      console.error("Error mengirim balasan:", error);
      alert(
        t(
          "messages",
          "network_error",
          "Terjadi kesalahan jaringan.",
          "A network error occurred.",
        ),
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleOpenDetail = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const handleOpenReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText("");
    setIsReplyModalOpen(true);
  };

  // FILTER PENCARIAN
  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIKA PAGINATION
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t("messages", "title", "Pesan Masuk", "Inbox Messages")}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {t(
              "messages",
              "subtitle",
              "Kelola kritik, saran, dan obrolan pesan dari pelanggan.",
              "Manage feedback, suggestions, and customer message threads.",
            )}
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t(
              "messages",
              "search_ph",
              "Cari nama, email, subjek...",
              "Search name, email, subject...",
            )}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* TABLE DATA SECTION */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[22%]">
                  {t("messages", "col_customer", "Pelanggan", "Customer")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">
                  {t("messages", "col_subject", "Subjek", "Subject")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[28%]">
                  {t("messages", "col_message", "Pesan", "Message")}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">
                  {common.date}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">
                  {common.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                    {common.loading}
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 mb-4 shadow-sm border border-gray-100">
                        <Inbox size={28} />
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {t(
                          "messages",
                          "empty_title",
                          "Tidak ada pesan ditemukan",
                          "No messages found",
                        )}
                      </p>
                      <p className="text-xs font-medium text-gray-400 text-center mt-1">
                        {t(
                          "messages",
                          "empty_desc",
                          "Belum ada pesan masuk atau kata kunci pencarian Anda tidak cocok.",
                          "No inbox messages yet, or your search did not match.",
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm leading-snug">
                        {m.name}
                      </div>
                      <div className="text-xs font-medium text-gray-400 mt-0.5 flex items-center gap-1">
                        <Mail size={12} />
                        {m.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block max-w-full truncate text-xs font-bold text-gray-700 bg-gray-100/80 px-2.5 py-1 rounded-lg border border-gray-200/50">
                        {m.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-medium">
                        {m.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(m.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* TOMBOL LIHAT DETAIL */}
                        <button
                          onClick={() => handleOpenDetail(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl shadow-sm transition-all"
                        >
                          <Eye size={14} />
                          {t("messages", "view", "Lihat", "View")}
                        </button>

                        {/* TOMBOL BALAS & RIWAYAT CHAT */}
                        <button
                          onClick={() => handleOpenReply(m)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shadow-sm transition-all border ${
                            m.replies && m.replies.length > 0
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100/80"
                              : "bg-gray-900 text-white border-transparent hover:bg-gray-800"
                          }`}
                        >
                          <Reply size={14} />
                          {m.replies && m.replies.length > 0
                            ? t(
                                "messages",
                                "history",
                                `Riwayat (${m.replies.length})`,
                                `History (${m.replies.length})`,
                              )
                            : common.reply}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLLER PANEL */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              {t("messages", "showing", "Menampilkan", "Showing")}{" "}
              {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredMessages.length)}{" "}
              {t("messages", "of", "dari", "of")} {filteredMessages.length}{" "}
              {t("messages", "messages_word", "pesan", "messages")}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white text-gray-600 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all shadow-sm ${
                    currentPage === page
                      ? "bg-gray-900 text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white text-gray-600 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: DETAIL PESAN SAJA                                */}
      {/* ========================================================= */}
      <AdminModal
        open={isModalOpen && !!selectedMessage}
        onClose={() => setIsModalOpen(false)}
        panelClassName="max-w-lg"
      >
          <div className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gray-900 text-white shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {t("messages", "detail_title", "Detail Pesan Masuk", "Message Detail")}
                  </h3>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    {t("messages", "message_id", "ID Pesan", "Message ID")}:
                    #{selectedMessage?.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 border border-gray-200/60 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    {t("messages", "sender_name", "Nama Pengirim", "Sender Name")}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedMessage?.name}
                  </span>
                </div>
                <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    {t("messages", "email_address", "Alamat Email", "Email Address")}
                  </span>
                  <span className="text-sm font-bold text-gray-800 break-all">
                    {selectedMessage?.email}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {t("messages", "main_subject", "Subjek Utama", "Main Subject")}
                </span>
                <div className="text-sm font-bold text-gray-900 bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100">
                  {selectedMessage?.subject}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {t(
                    "messages",
                    "message_content",
                    "Isi Pesan Masuk",
                    "Message Content",
                  )}
                </span>
                <div className="text-sm text-gray-700 bg-gray-50/50 px-4 py-4 rounded-xl border border-gray-200 whitespace-pre-line leading-relaxed max-h-[200px] overflow-y-auto font-medium shadow-inner">
                  "{selectedMessage?.message}"
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pt-2 border-t border-gray-50">
                <Calendar size={14} className="text-gray-400" />
                <span>{t("messages", "sent_at", "Dikirim pada", "Sent at")}: </span>
                <span className="text-gray-700">
                  {selectedMessage
                    ? new Date(selectedMessage.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}{" "}
                  WIB
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/80 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 shadow-sm transition-all"
              >
                {common.close}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 2: KHUSUS BALAS PESAN & THREAD CHAT RIWAYAT         */}
      {/* ========================================================= */}
      <AdminModal
        open={isReplyModalOpen && !!selectedMessage}
        onClose={() => setIsReplyModalOpen(false)}
        panelClassName="max-w-xl"
      >
          <div className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal Balas */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shadow-sm">
                  <Reply size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {t("messages", "reply_title", "Balas Pesan Pelanggan", "Reply to Customer")}
                  </h3>
                  <p className="text-xs font-medium text-gray-300 mt-0.5">
                    {t("messages", "chat_with", "Ruang obrolan dengan", "Chat with")}{" "}
                    {selectedMessage?.name} ({selectedMessage?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/20 text-gray-300 hover:text-white transition-colors bg-white/5 border border-white/10 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* KONTEN UTAMA OBROLAN (SCROLLABLE CHAT THREAD VIEW) */}
            <div className="p-6 bg-gray-50/40 space-y-4 max-h-[45vh] overflow-y-auto shadow-inner border-b border-gray-100">
              
              {/* Balon Chat 1: Pesan Awal dari User */}
              <div className="flex flex-col items-start mr-12">
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-left">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">
                    {selectedMessage?.name} (
                    {t("messages", "initial_message", "Pesan Awal", "Initial Message")}{" "}
                    — {selectedMessage?.subject})
                  </span>
                  <p className="text-sm text-gray-800 font-medium whitespace-pre-line leading-relaxed">
                    {selectedMessage?.message}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 ml-1 font-bold">
                  {selectedMessage
                    ? new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })
                    : ""}
                </span>
              </div>

              {/* Balon Chat Loop: Riwayat Balasan Admin Sebelumnya */}
              {selectedMessage?.replies && selectedMessage.replies.length > 0 && (
                <div className="space-y-4 pt-2">
                  {selectedMessage.replies.map((reply) => (
                    <div key={reply.id} className="flex flex-col items-end ml-12 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-gray-900 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm text-left">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide block mb-1">
                          {t("messages", "admin_you", "Admin (Anda)", "Admin (You)")}
                        </span>
                        <p className="text-sm font-medium whitespace-pre-line leading-relaxed">
                          {reply.reply_message}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 mr-1 font-bold">
                        {new Date(reply.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANEL FOOTER: TEXTAREA INPUT BALASAN BARU */}
            <div className="p-5 bg-white space-y-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                  {t(
                    "messages",
                    "write_reply_label",
                    "Tulis Balasan Follow-up / Balasan Baru",
                    "Write a Follow-up / New Reply",
                  )}
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t(
                    "messages",
                    "reply_placeholder",
                    `Ketik pesan balasan Anda ke ${selectedMessage?.name}...`,
                    `Type your reply to ${selectedMessage?.name}...`,
                  )}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-bold border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
                >
                  {common.cancel}
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 disabled:bg-gray-400 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isReplying ? (
                    common.saving
                  ) : (
                    <>
                      <Reply size={16} />
                      {t("messages", "send_reply", "Kirim Balasan", "Send Reply")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
      </AdminModal>
    </div>
  );
}
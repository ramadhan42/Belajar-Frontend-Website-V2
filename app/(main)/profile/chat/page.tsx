"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  CheckCircle2,
  XCircle,
  User,
  Bot,
} from "lucide-react";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  sender_type?: "user" | "admin"; // Tambahkan flag jika backend mendukung
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    message: "",
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto scroll ke bawah saat pesan baru muncul
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem("auth_user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const emailFilter = encodeURIComponent(user.email);
      const res = await fetch(
        `http://127.0.0.1:8000/api/contact-show?email=${emailFilter}`,
      );
      const response = await res.json();

      if (response.success) setMessages(response.data);
    } catch (err) {
      console.error("Gagal memuat pesan", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("subject", "Hubungi Admin");
    formData.append("message", newMessage);

    setIsSending(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Gagal mengirim pesan.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Admin Evomi</h1>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : messages.length > 0 ? (
          // ... di dalam Chat Area (sebelum .map) ...
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-end">
              {/* TAMBAHKAN NAMA/EMAIL DI SINI */}
              <span className="text-[13px] text-gray-500 font-medium mb-1 mr-1">
                {msg.name}
              </span>

              <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-tr-none bg-black text-white shadow-md">
                <p className="text-sm">{msg.message}</p>
              </div>

              {/* Waktu pesan */}
              <span className="text-[10px] text-gray-400 mt-1 mr-1">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-2 opacity-20" />
            <p>Belum ada pesan terkirim</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-gray-100 flex gap-3"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 px-5 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-gray-200 transition-all"
        />
        <button
          disabled={isSending}
          className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl">
            {modal.type === "success" ? (
              <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
            ) : (
              <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            )}
            <p className="font-bold text-lg mb-6">{modal.message}</p>
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full py-3 bg-black text-white rounded-xl font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

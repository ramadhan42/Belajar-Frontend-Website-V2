"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  User as UserIcon,
  Headset,
  Info,
  Check,
  CheckCheck,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";

interface ContactReply {
  id: number;
  reply_message: string;
  replied_by: number;
  created_at: string;
  is_read_by_user?: number | boolean;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read_by_admin?: number | boolean;
  replies?: ContactReply[];
}

interface ChatBubble {
  id: string;
  type: "user" | "admin";
  text: string;
  createdAt: string;
  subject?: string;
  isReadByAdmin: boolean; // Untuk centang biru pesan user
  isReadByUser: boolean; // Untuk sinyal BARU pesan admin
}

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const [userData, setUserData] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        name: parsedUser.name || "Pelanggan",
        email: parsedUser.email || "",
      });
    }
  }, []);

  const fetchMessages = async () => {
    if (!userData.email) return;

    // FUNGSI BANTU: Menerjemahkan format aneh dari database ('t', '1', 'true', dll)
    const parseBoolean = (val: any) => {
      return (
        val === true ||
        val === 1 ||
        val === "1" ||
        val === "true" ||
        val === "t"
      );
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/contact?email=${userData.email}`);
      const data = await res.json();

      if (data.success) {
        const rawMessages: ContactMessage[] = data.data;
        const flattenedChats: ChatBubble[] = [];

        rawMessages.forEach((msg) => {
          const readByAdmin =
            parseBoolean(msg.is_read_by_admin) ||
            (msg.replies && msg.replies.length > 0);

          flattenedChats.push({
            id: `msg-${msg.id}`,
            type: "user",
            text: msg.message,
            createdAt: msg.created_at,
            subject: msg.subject,
            isReadByAdmin: Boolean(readByAdmin),
            isReadByUser: true,
          });

          if (msg.replies && msg.replies.length > 0) {
            msg.replies.forEach((reply) => {
              flattenedChats.push({
                id: `reply-${reply.id}`,
                type: "admin",
                text: reply.reply_message,
                createdAt: reply.created_at,
                isReadByAdmin: true,
                // Gunakan fungsi bantu di sini
                isReadByUser: parseBoolean(reply.is_read_by_user),
              });
            });
          }
        });

        flattenedChats.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        setChatHistory(flattenedChats);

        // Tandai pesan sebagai "Telah Dibaca" di Backend
        fetch(`${baseUrl}/api/contact/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email }),
        })
          .then((res) => res.json())
          .then((markData) => {
            if (markData.success) {
              // Hapus angka merah di Sidebar
              window.dispatchEvent(new Event("messages_read"));
            } else {
              console.error(
                "Backend gagal update status read:",
                markData.error,
              );
            }
          })
          .finally(() => {
            // UX FIX: Selalu hilangkan lencana merah "BARU" setelah 2.5 detik
            // tanpa mempedulikan balasan server agar layar pengguna tetap bersih
            setTimeout(() => {
              setChatHistory((prev) =>
                prev.map((chat) =>
                  chat.type === "admin"
                    ? { ...chat, isReadByUser: true }
                    : chat,
                ),
              );
            }, 2500);
          });
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData.email) fetchMessages();
    else setIsLoading(false);
  }, [userData.email]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData.email) return;

    setIsSending(true);
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        subject: "Pesan Dukungan Pelanggan",
        message: newMessage,
      };

      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-sm">
            <Headset size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Layanan Pelanggan
            </h2>
            <p className="text-[11px] font-medium text-green-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Admin Siap Membantu
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa] scroll-smooth"
      >
        {!userData.email ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Info size={32} className="mb-3" />
            <p className="text-sm font-medium">
              Silakan login untuk memulai obrolan.
            </p>
          </div>
        ) : isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-gray-900" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Memuat obrolan...
            </p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={40} className="mb-4 opacity-50" />
            <p className="text-sm font-medium text-gray-600 mb-1">
              Belum ada percakapan
            </p>
          </div>
        ) : (
          chatHistory.map((chat, index) => {
            const isUser = chat.type === "user";
            const isConsecutive =
              index > 0 && chatHistory[index - 1].type === chat.type;

            return (
              <div
                key={chat.id}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-2" : "mt-6"}`}
              >
                <div
                  className={`flex max-w-[75%] md:max-w-[65%] gap-3 relative ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isConsecutive && (
                    <div className="flex-shrink-0 mt-auto mb-1">
                      {isUser ? (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <UserIcon size={14} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-sm">
                          <Headset size={14} />
                        </div>
                      )}
                    </div>
                  )}
                  {isConsecutive && <div className="w-7 flex-shrink-0" />}

                  <div className="flex flex-col relative">
                    {/* LABEL PESAN BARU */}
                    {!isUser && !chat.isReadByUser && (
                      <span className="absolute -top-3 -left-2 flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm z-10 animate-bounce transition-all duration-500">
                        BARU
                      </span>
                    )}

                    <div
                      className={`px-5 py-3.5 text-[13px] font-medium leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {chat.subject && (
                        <span className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-60">
                          Topik: {chat.subject}
                        </span>
                      )}
                      <span className="whitespace-pre-line">{chat.text}</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-1.5 ${isUser ? "justify-end mr-1" : "justify-start ml-1"}`}
                    >
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(chat.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* CENTANG UNTUK PESAN USER */}
                      {isUser &&
                        (chat.isReadByAdmin ? (
                          <CheckCheck
                            size={14}
                            className="text-blue-500 ml-0.5"
                          />
                        ) : (
                          <Check size={14} className="text-gray-400 ml-0.5" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/60 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10 transition-all shadow-inner"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending || !userData.email}
            placeholder={
              userData.email
                ? "Ketik pesan Anda di sini..."
                : "Login untuk membalas..."
            }
            className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder-gray-400 w-full"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim() || !userData.email}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  User as UserIcon,
  Headset,
  Info,
  Check,
  CheckCheck,
  Sparkles,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import { useProfileBrand } from "@/components/profile/ProfileBrandShell";
import { profileBrandGradient } from "@/components/profile/brand";

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
  isReadByAdmin: boolean;
  isReadByUser: boolean;
  pending?: boolean;
}

const SYSTEM_PLACEHOLDER = "[Percakapan dimulai oleh admin]";

const parseBoolean = (val: unknown) =>
  val === true ||
  val === 1 ||
  val === "1" ||
  val === "true" ||
  val === "t";

function dayKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function ChatPage() {
  const { locale } = useLocale();
  const brand = useProfileBrand();

  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showJumpLatest, setShowJumpLatest] = useState(false);
  const [sendError, setSendError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const baseUrl = SITE_STRINGS.base_url.url_backend;
  const [userData, setUserData] = useState({ name: "", email: "" });

  const copy = useMemo(
    () => ({
      customerServiceTitle: L(locale, "Pesan Anda", "Your Messages"),
      adminReady: L(locale, "Admin online · siap membantu", "Admin online · ready to help"),
      loginToChat: L(
        locale,
        "Silakan login untuk memulai obrolan dengan admin Evomi.",
        "Please log in to start chatting with Evomi admin.",
      ),
      loadingChat: L(locale, "Memuat percakapan...", "Loading conversation..."),
      noConversation: L(locale, "Belum ada percakapan", "No conversation yet"),
      noConversationHint: L(
        locale,
        "Tanyakan stok, pengiriman, atau rekomendasi aroma. Tim Evomi akan membalas di sini.",
        "Ask about stock, shipping, or scent recommendations. Evomi will reply here.",
      ),
      newBadge: L(locale, "BARU", "NEW"),
      topicLabel: L(locale, "Topik", "Topic"),
      inputPlaceholder: L(
        locale,
        "Tulis pesan untuk admin Evomi...",
        "Write a message to Evomi admin...",
      ),
      loginToReplyPlaceholder: L(
        locale,
        "Login untuk mengirim pesan...",
        "Log in to send a message...",
      ),
      defaultCustomerName: L(locale, "Pelanggan", "Customer"),
      supportSubject: L(
        locale,
        "Pesan Dukungan Pelanggan",
        "Customer Support Message",
      ),
      dateLocale: locale === "en" ? "en-US" : "id-ID",
      today: L(locale, "Hari ini", "Today"),
      yesterday: L(locale, "Kemarin", "Yesterday"),
      jumpLatest: L(locale, "Pesan terbaru", "Latest messages"),
      refresh: L(locale, "Muat ulang", "Refresh"),
      quickHints: [
        L(locale, "Cek status pesanan saya", "Check my order status"),
        L(locale, "Rekomendasi aroma untuk saya", "Scent recommendation for me"),
        L(locale, "Info pengiriman & ongkir", "Shipping & delivery info"),
      ],
      sendFailed: L(
        locale,
        "Gagal mengirim pesan. Coba lagi ya.",
        "Failed to send message. Please try again.",
      ),
      you: L(locale, "Anda", "You"),
      admin: L(locale, "Admin Evomi", "Evomi Admin"),
    }),
    [locale],
  );

  const formatSubject = (subject?: string) => {
    if (!subject) return subject;
    if (
      subject === "Pesan Dukungan Pelanggan" ||
      subject === "Customer Support Message" ||
      subject === "Chat Admin Evomi"
    ) {
      return copy.supportSubject;
    }
    return subject;
  };

  const formatDayLabel = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    const yday = new Date();
    yday.setDate(today.getDate() - 1);
    if (dayKey(iso) === dayKey(today.toISOString())) return copy.today;
    if (dayKey(iso) === dayKey(yday.toISOString())) return copy.yesterday;
    return d.toLocaleDateString(copy.dateLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        name: parsedUser.name || parsedUser.nama_lengkap || copy.defaultCustomerName,
        email: parsedUser.email || "",
      });
    }
  }, [copy.defaultCustomerName]);

  const flattenMessages = useCallback((rawMessages: ContactMessage[]) => {
    const flattenedChats: ChatBubble[] = [];

    rawMessages.forEach((msg) => {
      if (msg.message === SYSTEM_PLACEHOLDER) {
        // skip system seed, keep replies
      } else {
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
      }

      (msg.replies || []).forEach((reply) => {
        flattenedChats.push({
          id: `reply-${reply.id}`,
          type: "admin",
          text: reply.reply_message,
          createdAt: reply.created_at,
          isReadByAdmin: true,
          isReadByUser: parseBoolean(reply.is_read_by_user),
        });
      });
    });

    flattenedChats.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return flattenedChats;
  }, []);

  const fetchMessages = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!userData.email) return;
      const silent = opts?.silent;

      try {
        if (silent) setIsRefreshing(true);
        else setIsLoading(true);

        const res = await fetch(
          `${baseUrl}/api/contact?email=${encodeURIComponent(userData.email)}`,
        );
        const data = await res.json();

        if (data.success) {
          const flattened = flattenMessages(data.data || []);
          setChatHistory((prev) => {
            // keep optimistic pending bubbles until server catches up
            const pending = prev.filter((p) => p.pending);
            const serverIds = new Set(flattened.map((f) => f.id));
            const stillPending = pending.filter(
              (p) => !flattened.some((f) => f.text === p.text && f.type === "user"),
            );
            return [...flattened, ...stillPending.filter((p) => !serverIds.has(p.id))];
          });

          fetch(`${baseUrl}/api/contact/mark-read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userData.email }),
          })
            .then((r) => r.json())
            .then((markData) => {
              if (markData.success) {
                window.dispatchEvent(new Event("messages_read"));
              }
            })
            .finally(() => {
              setTimeout(() => {
                setChatHistory((prev) =>
                  prev.map((chat) =>
                    chat.type === "admin"
                      ? { ...chat, isReadByUser: true }
                      : chat,
                  ),
                );
              }, 1800);
            });
        }
      } catch (error) {
        console.error("Gagal memuat pesan:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [baseUrl, flattenMessages, userData.email],
  );

  useEffect(() => {
    if (userData.email) fetchMessages();
    else setIsLoading(false);
  }, [userData.email, fetchMessages]);

  // Poll for new admin replies
  useEffect(() => {
    if (!userData.email) return;
    const id = window.setInterval(() => {
      fetchMessages({ silent: true });
    }, 30000);
    return () => window.clearInterval(id);
  }, [userData.email, fetchMessages]);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  };

  useEffect(() => {
    if (!isLoading) scrollToBottom(true);
  }, [chatHistory.length, isLoading]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJumpLatest(dist > 120);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !userData.email || isSending) return;

    const text = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setSendError("");
    setNewMessage("");
    setIsSending(true);

    setChatHistory((prev) => [
      ...prev,
      {
        id: tempId,
        type: "user",
        text,
        createdAt: new Date().toISOString(),
        subject: copy.supportSubject,
        isReadByAdmin: false,
        isReadByUser: true,
        pending: true,
      },
    ]);

    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          subject: copy.supportSubject,
          message: text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMessages({ silent: true });
      } else {
        setChatHistory((prev) => prev.filter((c) => c.id !== tempId));
        setNewMessage(text);
        setSendError(copy.sendFailed);
      }
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      setChatHistory((prev) => prev.filter((c) => c.id !== tempId));
      setNewMessage(text);
      setSendError(copy.sendFailed);
    } finally {
      setIsSending(false);
    }
  };

  const useQuickHint = (hint: string) => {
    setNewMessage(hint);
  };

  return (
    <div
      className="flex flex-col h-[min(80vh,760px)] min-h-[560px] w-full max-w-4xl mx-auto rounded-[28px] overflow-hidden relative border border-gray-100 bg-white"
      style={
        {
          "--chat-brand": brand,
        } as React.CSSProperties
      }
    >
      {/* Ambient header */}
      <div
        className="relative px-5 sm:px-6 py-4 text-white shrink-0"
        style={{
          background: profileBrandGradient(brand),
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.2), transparent 35%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shadow-sm">
                <Headset size={20} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0e6aad]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] sm:text-base font-bold tracking-tight truncate flex items-center gap-1.5">
                {copy.customerServiceTitle}
                <Sparkles size={14} className="opacity-80 shrink-0" />
              </h2>
              <p className="text-[11px] sm:text-xs text-white/80 font-medium mt-0.5 truncate">
                {copy.adminReady}
              </p>
            </div>
          </div>

          {userData.email ? (
            <button
              type="button"
              onClick={() => fetchMessages({ silent: true })}
              disabled={isRefreshing || isLoading}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-50"
              title={copy.refresh}
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">{copy.refresh}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto scroll-smooth relative bg-white"
      >
        <div className="p-4 sm:p-6 space-y-1 min-h-full flex flex-col">
          {!userData.email ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[var(--chat-brand)] mb-4">
                <Info size={26} />
              </div>
              <p className="text-sm font-semibold text-gray-700 max-w-sm">
                {copy.loginToChat}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-20">
              <Loader2
                className="w-7 h-7 animate-spin mb-3"
                style={{ color: brand }}
              />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                {copy.loadingChat}
              </p>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
              <div
                className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: brand }}
              >
                <MessageSquare size={28} />
              </div>
              <p className="text-base font-bold text-gray-800 mb-1">
                {copy.noConversation}
              </p>
              <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                {copy.noConversationHint}
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {copy.quickHints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => useQuickHint(hint)}
                    className="text-left text-[12px] font-medium px-3.5 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[var(--chat-brand)] hover:text-[var(--chat-brand)] shadow-sm transition"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => {
                const isUser = chat.type === "user";
                const prev = chatHistory[index - 1];
                const isConsecutive = !!prev && prev.type === chat.type;
                const showDay =
                  !prev || dayKey(prev.createdAt) !== dayKey(chat.createdAt);

                return (
                  <div key={chat.id}>
                    {showDay ? (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/90 border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                          {formatDayLabel(chat.createdAt)}
                        </span>
                      </div>
                    ) : null}

                    <div
                      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${
                        isConsecutive ? "mt-1.5" : "mt-4"
                      }`}
                    >
                      <div
                        className={`flex max-w-[85%] sm:max-w-[72%] gap-2.5 ${
                          isUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {!isConsecutive ? (
                          <div className="flex-shrink-0 mt-auto mb-5">
                            {isUser ? (
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                                <UserIcon size={14} />
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                                style={{ backgroundColor: brand }}
                              >
                                <Headset size={14} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0" />
                        )}

                        <div className="flex flex-col relative min-w-0">
                          {!isUser && !chat.isReadByUser ? (
                            <span className="absolute -top-2.5 left-0 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                              {copy.newBadge}
                            </span>
                          ) : null}

                          {!isConsecutive ? (
                            <span
                              className={`text-[10px] font-semibold mb-1 ${
                                isUser
                                  ? "text-right text-gray-400 mr-1"
                                  : "text-left text-gray-400 ml-1"
                              }`}
                            >
                              {isUser ? copy.you : copy.admin}
                            </span>
                          ) : null}

                          <div
                            className={`px-4 py-3 text-[13px] sm:text-[14px] font-medium leading-relaxed shadow-sm ${
                              isUser
                                ? "text-white rounded-2xl rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-100/80 rounded-2xl rounded-bl-md"
                            } ${chat.pending ? "opacity-70" : ""}`}
                            style={
                              isUser
                                ? {
                                    background: profileBrandGradient(brand),
                                  }
                                : undefined
                            }
                          >
                            {chat.subject &&
                            chat.subject !== "Chat Admin Evomi" &&
                            !isConsecutive ? (
                              <span
                                className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                                  isUser ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                {copy.topicLabel}: {formatSubject(chat.subject)}
                              </span>
                            ) : null}
                            <span className="whitespace-pre-line break-words">
                              {chat.text}
                            </span>
                          </div>

                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isUser
                                ? "justify-end mr-1"
                                : "justify-start ml-1"
                            }`}
                          >
                            <span className="text-[10px] font-semibold text-gray-400">
                              {new Date(chat.createdAt).toLocaleTimeString(
                                copy.dateLocale,
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            {isUser ? (
                              chat.isReadByAdmin ? (
                                <CheckCheck
                                  size={14}
                                  className="text-sky-500 ml-0.5"
                                />
                              ) : (
                                <Check
                                  size={14}
                                  className="text-gray-400 ml-0.5"
                                />
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {showJumpLatest ? (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 shadow-md px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <ChevronDown size={14} />
            {copy.jumpLatest}
          </button>
        ) : null}
      </div>

      {/* Composer */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur border-t border-gray-100 shrink-0">
        {sendError ? (
          <p className="text-[11px] font-medium text-rose-600 mb-2 px-1">
            {sendError}
          </p>
        ) : null}
        {userData.email && chatHistory.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-hide">
            {copy.quickHints.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => useQuickHint(hint)}
                className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-[var(--chat-brand)] hover:text-[var(--chat-brand)] transition"
              >
                {hint}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-2 sm:gap-3 rounded-2xl border border-gray-200 bg-gray-50/90 p-1.5 focus-within:border-[var(--chat-brand)] focus-within:ring-2 focus-within:ring-[color:var(--chat-brand)]/15 transition-all"
        >
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (sendError) setSendError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
            disabled={isSending || !userData.email}
            rows={1}
            placeholder={
              userData.email
                ? copy.inputPlaceholder
                : copy.loginToReplyPlaceholder
            }
            className="flex-1 resize-none max-h-28 min-h-[42px] px-3.5 py-2.5 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder-gray-400 w-full"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim() || !userData.email}
            className="w-11 h-11 shrink-0 flex items-center justify-center text-white rounded-xl hover:opacity-90 active:scale-95 transition disabled:opacity-45 shadow-sm"
            style={{ backgroundColor: brand }}
            aria-label="Send"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 px-1 hidden sm:block">
          Enter ↵ kirim · Shift+Enter baris baru
        </p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCheck,
  Clock3,
  History,
  Loader2,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { L } from "@/lib/localeText";

type Locale = "id" | "en";

interface ContactReply {
  id: number;
  reply_message: string;
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
  pending?: boolean;
  isReadByAdmin?: boolean;
  isReadByUser?: boolean;
}

interface RecentThread {
  key: string;
  subject: string;
  preview: string;
  updatedAt: string;
  unread: number;
  count: number;
}

type PanelView = "chat" | "recent";

function parseBoolean(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function dayKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function stripProductLink(text: string) {
  return text.replace(/\n*\s*Link Produk:\s*\S+/gi, "").trim();
}

export default function ProductChatPanel({
  open,
  onClose,
  accentColor,
  productTitle,
  productUrl,
  locale,
  onRequireLogin,
  adminTitle,
  replyHint,
}: {
  open: boolean;
  onClose: () => void;
  accentColor: string;
  productTitle: string;
  productUrl: string;
  locale: Locale;
  onRequireLogin: () => void;
  adminTitle?: string;
  replyHint?: string;
}) {
  const baseUrl = SITE_STRINGS.base_url.url_backend;
  const [view, setView] = useState<PanelView>("chat");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [rawMessages, setRawMessages] = useState<ContactMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  const copy = useMemo(
    () => ({
      title:
        adminTitle ||
        L(locale, "Chat Admin Evomi", "Chat Evomi Admin"),
      onlineHint:
        replyHint ||
        L(
          locale,
          "Biasanya membalas dalam beberapa menit",
          "Usually replies within a few minutes",
        ),
      placeholder: L(
        locale,
        "Tulis pertanyaan tentang produk ini...",
        "Ask about this product...",
      ),
      send: L(locale, "Kirim", "Send"),
      sending: L(locale, "Mengirim...", "Sending..."),
      recent: L(locale, "Riwayat", "History"),
      backToChat: L(locale, "Kembali ke chat", "Back to chat"),
      emptyTitle: L(locale, "Belum ada percakapan", "No conversations yet"),
      emptyHint: L(
        locale,
        "Tanyakan stok, pengiriman, atau aroma produk. Admin akan membalas di sini.",
        "Ask about stock, shipping, or scent. Admin will reply here.",
      ),
      emptyRecent: L(
        locale,
        "Belum ada riwayat chat.",
        "No chat history yet.",
      ),
      allChats: L(locale, "Semua pesan", "All messages"),
      aboutProduct: L(locale, "Tentang produk ini", "About this product"),
      openFull: L(locale, "Buka chat lengkap", "Open full chat"),
      loginHint: L(
        locale,
        "Login untuk chat & melihat balasan admin.",
        "Log in to chat and see admin replies.",
      ),
      loginCta: L(locale, "Login dulu", "Log in first"),
      loadFailed: L(
        locale,
        "Gagal memuat chat.",
        "Failed to load chat.",
      ),
      sendFailed: L(
        locale,
        "Gagal mengirim pesan.",
        "Failed to send message.",
      ),
      today: L(locale, "Hari ini", "Today"),
      yesterday: L(locale, "Kemarin", "Yesterday"),
      unread: L(locale, "belum dibaca", "unread"),
      welcome: L(
        locale,
        `Halo! Ada yang bisa kami bantu soal ${productTitle}?`,
        `Hi! How can we help with ${productTitle}?`,
      ),
      templates: [
        L(locale, "Hai, barang ini ready?", "Hi, is this item in stock?"),
        L(locale, "Bisa dikirim hari ini?", "Can it be shipped today?"),
        L(
          locale,
          "Apakah aroma ini tahan lama?",
          "Does this scent last long?",
        ),
      ],
    }),
    [locale, productTitle, adminTitle, replyHint],
  );

  const productSubject = useMemo(
    () => `Chat Produk, ${productTitle}`,
    [productTitle],
  );

  const flattenMessages = useCallback((messages: ContactMessage[]) => {
    const list: ChatBubble[] = [];
    messages.forEach((msg) => {
      list.push({
        id: `msg-${msg.id}`,
        type: "user",
        text: stripProductLink(msg.message),
        createdAt: msg.created_at,
        subject: msg.subject,
        isReadByAdmin:
          parseBoolean(msg.is_read_by_admin) ||
          Boolean(msg.replies && msg.replies.length > 0),
        isReadByUser: true,
      });
      (msg.replies || []).forEach((reply) => {
        list.push({
          id: `reply-${reply.id}`,
          type: "admin",
          text: reply.reply_message,
          createdAt: reply.created_at,
          subject: msg.subject,
          isReadByAdmin: true,
          isReadByUser: parseBoolean(reply.is_read_by_user),
        });
      });
    });
    list.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return list;
  }, []);

  const fetchThread = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!user?.email) return;
      if (!opts?.silent) setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${baseUrl}/api/contact?email=${encodeURIComponent(user.email)}`,
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || copy.loadFailed);
        }
        const messages: ContactMessage[] = data.data || [];
        setRawMessages(messages);
        const flattened = flattenMessages(messages);
        setBubbles((prev) => {
          const pending = prev.filter((p) => p.pending);
          const stillPending = pending.filter(
            (p) =>
              !flattened.some(
                (f) => f.type === "user" && f.text.trim() === p.text.trim(),
              ),
          );
          return [...flattened, ...stillPending];
        });

        void fetch(`${baseUrl}/api/contact/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        }).then(() => {
          window.dispatchEvent(new Event("messages_read"));
          setBubbles((prev) =>
            prev.map((b) =>
              b.type === "admin" ? { ...b, isReadByUser: true } : b,
            ),
          );
        });
      } catch (err) {
        console.error(err);
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : copy.loadFailed);
        }
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [baseUrl, copy.loadFailed, flattenMessages, user?.email],
  );

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) {
        setUser(null);
        return;
      }
      const parsed = JSON.parse(raw);
      setUser({
        name: parsed.name || parsed.nama_lengkap || "User Evomi",
        email: parsed.email || "",
      });
    } catch {
      setUser(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !user?.email) return;
    setView("chat");
    void fetchThread();
  }, [open, user?.email, fetchThread]);

  useEffect(() => {
    if (!open || !user?.email) return;
    pollRef.current = window.setInterval(() => {
      void fetchThread({ silent: true });
    }, 30000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [open, user?.email, fetchThread]);

  useEffect(() => {
    if (!open || view !== "chat") return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles.length, open, view, activeSubject]);

  const recentThreads = useMemo(() => {
    const map = new Map<string, RecentThread>();
    rawMessages.forEach((msg) => {
      const key = msg.subject || "Chat Admin Evomi";
      const lastReply = msg.replies?.[msg.replies.length - 1];
      const updatedAt = lastReply?.created_at || msg.created_at;
      const preview = lastReply
        ? lastReply.reply_message
        : stripProductLink(msg.message);
      const unread = (msg.replies || []).filter(
        (r) => !parseBoolean(r.is_read_by_user),
      ).length;
      const prev = map.get(key);
      if (!prev || new Date(updatedAt) > new Date(prev.updatedAt)) {
        map.set(key, {
          key,
          subject: key,
          preview,
          updatedAt,
          unread: (prev?.unread || 0) + unread,
          count: (prev?.count || 0) + 1 + (msg.replies?.length || 0),
        });
      } else {
        map.set(key, {
          ...prev,
          unread: prev.unread + unread,
          count: prev.count + 1 + (msg.replies?.length || 0),
        });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [rawMessages]);

  const visibleBubbles = useMemo(() => {
    if (!activeSubject) return bubbles;
    return bubbles.filter((b) => b.subject === activeSubject);
  }, [activeSubject, bubbles]);

  const unreadCount = useMemo(
    () =>
      bubbles.filter((b) => b.type === "admin" && b.isReadByUser === false)
        .length,
    [bubbles],
  );

  const formatDayLabel = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    const yday = new Date();
    yday.setDate(today.getDate() - 1);
    if (dayKey(iso) === dayKey(today.toISOString())) return copy.today;
    if (dayKey(iso) === dayKey(yday.toISOString())) return copy.yesterday;
    return d.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const formatSubjectLabel = (subject: string) => {
    if (subject.startsWith("Chat Produk,")) {
      return subject.replace(/^Chat Produk,\s*/i, "");
    }
    return subject;
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    if (!user?.email) {
      onRequireLogin();
      return;
    }

    const optimisticId = `pending-${Date.now()}`;
    const now = new Date().toISOString();
    setBubbles((prev) => [
      ...prev,
      {
        id: optimisticId,
        type: "user",
        text: trimmed,
        createdAt: now,
        subject: productSubject,
        pending: true,
        isReadByAdmin: false,
      },
    ]);
    setDraft("");
    setActiveSubject(null);
    setView("chat");
    setIsSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("subject", productSubject);
      formData.append(
        "message",
        `${trimmed}\n\nLink Produk: ${productUrl || ""}`,
      );

      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || copy.sendFailed);
      }
      await fetchThread({ silent: true });
    } catch (err) {
      setBubbles((prev) => prev.filter((b) => b.id !== optimisticId));
      setError(err instanceof Error ? err.message : copy.sendFailed);
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-end md:p-6 pointer-events-none">
      <div
        className="pointer-events-auto absolute inset-0 bg-black/25 md:bg-transparent"
        onClick={onClose}
        aria-hidden
      />
      <div className="pointer-events-auto relative w-full md:w-[380px] h-[min(92vh,640px)] md:h-[600px] bg-white md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div
          className="px-4 py-3.5 flex items-center justify-between text-white shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] font-nohemi truncate">
                {copy.title}
              </h3>
              <p className="text-[11px] opacity-90 font-parkinsans flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {copy.onlineHint}
                {unreadCount > 0 ? (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                    {unreadCount} {copy.unread}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setView(view === "recent" ? "chat" : "recent")}
              className={`p-2 rounded-full transition ${
                view === "recent" ? "bg-white/25" : "hover:bg-white/20"
              }`}
              title={copy.recent}
            >
              <History size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter chip */}
        {view === "chat" && activeSubject ? (
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
            <p className="text-[12px] text-gray-600 font-parkinsans truncate">
              <span className="font-semibold text-gray-800">
                {copy.aboutProduct}:{" "}
              </span>
              {formatSubjectLabel(activeSubject)}
            </p>
            <button
              type="button"
              onClick={() => setActiveSubject(null)}
              className="text-[11px] font-semibold shrink-0"
              style={{ color: accentColor }}
            >
              {copy.allChats}
            </button>
          </div>
        ) : null}

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[#F5F7FA] custom-scrollbar">
          {!user?.email ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: accentColor }}
              >
                <MessageCircle size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {copy.loginHint}
              </p>
              <button
                type="button"
                onClick={onRequireLogin}
                className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: accentColor }}
              >
                {copy.loginCta}
              </button>
            </div>
          ) : view === "recent" ? (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {copy.recent}
                </p>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="text-[12px] font-semibold"
                  style={{ color: accentColor }}
                >
                  {copy.backToChat}
                </button>
              </div>
              {recentThreads.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10 font-parkinsans">
                  {copy.emptyRecent}
                </p>
              ) : (
                recentThreads.map((thread) => (
                  <button
                    key={thread.key}
                    type="button"
                    onClick={() => {
                      setActiveSubject(thread.key);
                      setView("chat");
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">
                        {formatSubjectLabel(thread.subject)}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatDayLabel(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 font-parkinsans">
                      {thread.preview}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{thread.count} pesan</span>
                      {thread.unread > 0 ? (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-white font-bold"
                          style={{ backgroundColor: accentColor }}
                        >
                          {thread.unread} {copy.unread}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))
              )}
              <Link
                href="/profile/chat"
                className="block text-center text-[12px] font-semibold py-3"
                style={{ color: accentColor }}
              >
                {copy.openFull}
              </Link>
            </div>
          ) : isLoading && bubbles.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: accentColor }}
              />
            </div>
          ) : (
            <div className="p-3 sm:p-4 flex flex-col gap-2.5 min-h-full">
              {visibleBubbles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    {copy.emptyTitle}
                  </p>
                  <p className="text-[13px] text-gray-500 font-parkinsans mb-4 max-w-[260px]">
                    {copy.emptyHint}
                  </p>
                  <div
                    className="self-start max-w-[85%] p-3 rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-[13px] text-gray-700 shadow-sm"
                  >
                    {copy.welcome}
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {copy.templates.map((template) => (
                      <button
                        key={template}
                        type="button"
                        disabled={isSending}
                        onClick={() => void handleSend(template)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-[12px] text-gray-700 hover:shadow-sm transition font-parkinsans disabled:opacity-50"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                visibleBubbles.map((bubble, index) => {
                  const prev = visibleBubbles[index - 1];
                  const showDay =
                    !prev ||
                    dayKey(prev.createdAt) !== dayKey(bubble.createdAt);
                  const isUser = bubble.type === "user";
                  return (
                    <div key={bubble.id}>
                      {showDay ? (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-white/80 px-2.5 py-1 rounded-full border border-gray-100">
                            {formatDayLabel(bubble.createdAt)}
                          </span>
                        </div>
                      ) : null}
                      <div
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed font-parkinsans ${
                            isUser
                              ? "text-white rounded-br-md"
                              : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm"
                          } ${bubble.pending ? "opacity-70" : ""}`}
                          style={
                            isUser ? { backgroundColor: accentColor } : undefined
                          }
                        >
                          {!isUser ? (
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                              Admin
                            </p>
                          ) : null}
                          {bubble.subject &&
                          bubble.subject.startsWith("Chat Produk,") &&
                          (!activeSubject || index === 0 || prev?.subject !== bubble.subject) ? (
                            <p
                              className={`text-[10px] mb-1 font-medium ${
                                isUser ? "text-white/80" : "text-gray-400"
                              }`}
                            >
                              {formatSubjectLabel(bubble.subject)}
                            </p>
                          ) : null}
                          <p className="whitespace-pre-wrap break-words">
                            {bubble.text}
                          </p>
                          <div
                            className={`mt-1 flex items-center gap-1 justify-end text-[10px] ${
                              isUser ? "text-white/75" : "text-gray-400"
                            }`}
                          >
                            <span>
                              {new Date(bubble.createdAt).toLocaleTimeString(
                                locale === "en" ? "en-US" : "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            {isUser ? (
                              bubble.pending ? (
                                <Clock3 size={11} />
                              ) : bubble.isReadByAdmin ? (
                                <CheckCheck size={12} />
                              ) : (
                                <Check size={12} />
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error ? (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-[12px] text-red-600 font-parkinsans">
            {error}
          </div>
        ) : null}

        {/* Composer */}
        {view === "chat" ? (
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            {user?.email && visibleBubbles.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-hide">
                {copy.templates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    disabled={isSending}
                    onClick={() => void handleSend(template)}
                    className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {template}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(draft);
                  }
                }}
                rows={2}
                placeholder={copy.placeholder}
                disabled={!user?.email || isSending}
                className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] font-parkinsans outline-none focus:border-gray-300 focus:bg-white disabled:opacity-60"
              />
              <button
                type="button"
                disabled={!draft.trim() || isSending || !user?.email}
                onClick={() => void handleSend(draft)}
                className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition active:scale-95"
                style={{ backgroundColor: accentColor }}
                aria-label={copy.send}
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="mt-2 flex justify-between items-center px-0.5">
              <Link
                href="/profile/chat"
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
              >
                {copy.openFull}
              </Link>
              <span className="text-[10px] text-gray-300 font-parkinsans">
                Enter ↵
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

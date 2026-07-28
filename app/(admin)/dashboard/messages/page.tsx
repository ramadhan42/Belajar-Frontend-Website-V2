"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Send,
  Trash2,
  MessageSquare,
  User as UserIcon,
  Loader2,
  Headset,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { getAdminHeaders } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import AdminAlertModal from "@/components/admin/AdminAlertModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";

interface Conversation {
  email: string;
  name: string;
  avatar?: string | null;
  user_id?: number | null;
  phone?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  message_count: number;
  has_chat: boolean;
}

interface ChatBubble {
  id: string;
  type: "user" | "admin";
  text: string;
  subject?: string;
  created_at?: string;
}

function avatarUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SITE_STRINGS.base_url.url_backend}/storage/${path}`;
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const { t, common } = useAdminI18n();
  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<{
    name: string;
    avatar?: string | null;
    email: string;
  } | null>(null);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
    variant: "info" | "success" | "error";
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/contact/conversations`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success) setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  }, [baseUrl]);

  const openThread = useCallback(
    async (conv: Conversation) => {
      setSelectedEmail(conv.email);
      setSelectedMeta({
        name: conv.name,
        avatar: conv.avatar,
        email: conv.email,
      });
      setIsLoadingThread(true);
      try {
        const res = await fetch(
          `${baseUrl}/api/admin/contact/thread?email=${encodeURIComponent(conv.email)}`,
          { headers: getAdminHeaders() },
        );
        const data = await res.json();
        if (data.success) {
          setBubbles(data.data?.messages || []);
          setSelectedMeta({
            name: data.data?.name || conv.name,
            avatar: data.data?.avatar ?? conv.avatar,
            email: conv.email,
          });
          // refresh unread badges in list
          setConversations((prev) =>
            prev.map((c) =>
              c.email === conv.email ? { ...c, unread_count: 0 } : c,
            ),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingThread(false);
      }
    },
    [baseUrl],
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bubbles, isLoadingThread]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.last_message || "").toLowerCase().includes(q),
    );
  }, [conversations, searchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !selectedEmail) return;
    setIsSending(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/contact/thread/send`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: selectedEmail,
          name: selectedMeta?.name,
          message: draft.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBubbles((prev) => [...prev, data.data]);
        setDraft("");
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.email === selectedEmail
              ? {
                  ...c,
                  last_message: data.data.text,
                  last_message_at: data.data.created_at,
                  has_chat: true,
                }
              : c,
          );
          return [...next].sort((a, b) =>
            (b.last_message_at || "").localeCompare(a.last_message_at || ""),
          );
        });
      } else {
        setAlertDialog({
          title: t(
            "messages",
            "send_failed_title",
            "Pesan gagal dikirim",
            "Message failed to send",
          ),
          message: data.message || "Gagal mengirim pesan.",
          variant: "error",
        });
      }
    } catch {
      setAlertDialog({
        title: t(
          "messages",
          "network_error_title",
          "Koneksi bermasalah",
          "Connection issue",
        ),
        message: "Terjadi kesalahan jaringan.",
        variant: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedEmail) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/admin/contact/thread?email=${encodeURIComponent(selectedEmail)}`,
        {
          method: "DELETE",
          headers: getAdminHeaders(),
        },
      );
      const data = await res.json();
      if (data.success) {
        setBubbles([]);
        setDeleteOpen(false);
        setConversations((prev) =>
          prev.map((c) =>
            c.email === selectedEmail
              ? {
                  ...c,
                  last_message: null,
                  last_message_at: null,
                  unread_count: 0,
                  message_count: 0,
                  has_chat: false,
                }
              : c,
          ),
        );
      } else {
        setAlertDialog({
          title: t(
            "messages",
            "delete_failed_title",
            "Gagal menghapus percakapan",
            "Failed to delete conversation",
          ),
          message: data.message || "Gagal menghapus chat.",
          variant: "error",
        });
      }
    } catch {
      setAlertDialog({
        title: t(
          "messages",
          "network_error_title",
          "Koneksi bermasalah",
          "Connection issue",
        ),
        message: "Terjadi kesalahan jaringan.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 h-[calc(100vh-7rem)] min-h-[560px] flex flex-col">
      <AdminAlertModal
        open={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        title={alertDialog?.title || ""}
        message={alertDialog?.message || ""}
        variant={alertDialog?.variant || "info"}
        buttonLabel={common.close}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <MessageSquare size={28} />
          {t("messages", "title", "Pesan", "Messages")}
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          {t(
            "messages",
            "subtitle_chat",
            "Chat 1-1 dengan pengguna. Klik user untuk membuka percakapan.",
            "1-1 chat with users. Click a user to open the conversation.",
          )}
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* USER LIST */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[320px]">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(
                  "messages",
                  "search_users",
                  "Cari nama atau email user...",
                  "Search user name or email...",
                )}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingList ? (
              <div className="h-40 flex items-center justify-center text-gray-400">
                <Loader2 className="animate-spin" size={22} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                {t("messages", "empty_users", "Tidak ada user.", "No users found.")}
              </div>
            ) : (
              filtered.map((conv) => {
                const active = selectedEmail === conv.email;
                const img = avatarUrl(conv.avatar);
                return (
                  <button
                    key={conv.email}
                    type="button"
                    onClick={() => openThread(conv)}
                    className={`w-full text-left px-4 py-3 flex gap-3 border-b border-gray-50 transition ${
                      active ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm ${
                        active
                          ? "bg-white text-gray-900"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (conv.name || "?").charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            active ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {conv.name}
                        </span>
                        {conv.unread_count > 0 ? (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                            {conv.unread_count}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`block text-[11px] truncate mt-0.5 ${
                          active ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {conv.email}
                      </span>
                      <span
                        className={`block text-[12px] truncate mt-1 ${
                          active ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {conv.last_message ||
                          t(
                            "messages",
                            "no_chat_yet",
                            "Belum ada chat",
                            "No chat yet",
                          )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CHAT PANE */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          {!selectedEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-8">
              <MessageSquare size={42} className="opacity-30" />
              <p className="text-sm font-medium text-gray-500 text-center max-w-sm">
                {t(
                  "messages",
                  "pick_user",
                  "Pilih user di sebelah kiri untuk melihat dan membalas chat 1-1.",
                  "Select a user on the left to view and reply in a 1-1 chat.",
                )}
              </p>
            </div>
          ) : (
            <>
              <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/60">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-700 shrink-0">
                    {avatarUrl(selectedMeta?.avatar) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl(selectedMeta?.avatar)!}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (selectedMeta?.name || "?").charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {selectedMeta?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedMeta?.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={!bubbles.length}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:hover:bg-red-50 transition"
                  title={t(
                    "messages",
                    "delete_chat",
                    "Hapus chat",
                    "Delete chat",
                  )}
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">
                    {t("messages", "delete_chat", "Hapus chat", "Delete chat")}
                  </span>
                </button>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F7F8FA]"
              >
                {isLoadingThread ? (
                  <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : bubbles.length === 0 ? (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 gap-2">
                    <UserIcon size={28} className="opacity-40" />
                    <p className="text-sm text-center max-w-xs">
                      {t(
                        "messages",
                        "empty_thread",
                        "Belum ada percakapan. Kirim pesan pertama di bawah.",
                        "No conversation yet. Send the first message below.",
                      )}
                    </p>
                  </div>
                ) : (
                  bubbles.map((b) => {
                    const isAdmin = b.type === "admin";
                    // Hide system placeholder from admin-started chats in the feed visually optional - show lightly
                    const isPlaceholder =
                      b.type === "user" &&
                      b.text === "[Percakapan dimulai oleh admin]";
                    if (isPlaceholder) return null;

                    return (
                      <div
                        key={b.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isAdmin
                              ? "bg-gray-900 text-white rounded-br-md"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 opacity-70">
                            {isAdmin ? (
                              <Headset size={12} />
                            ) : (
                              <UserIcon size={12} />
                            )}
                            <span className="text-[10px] font-semibold uppercase tracking-wide">
                              {isAdmin ? "Admin" : "User"}
                            </span>
                          </div>
                          {b.subject && b.type === "user" ? (
                            <p
                              className={`text-[10px] mb-1 ${
                                isAdmin ? "text-white/60" : "text-gray-400"
                              }`}
                            >
                              {b.subject}
                            </p>
                          ) : null}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {b.text}
                          </p>
                          <p
                            className={`text-[10px] mt-1.5 ${
                              isAdmin ? "text-white/50" : "text-gray-400"
                            }`}
                          >
                            {formatTime(b.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-gray-100 bg-white flex gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t(
                    "messages",
                    "chat_placeholder",
                    "Ketik pesan untuk user ini...",
                    "Type a message to this user...",
                  )}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition"
                >
                  {isSending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {t("messages", "send", "Kirim", "Send")}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <AdminConfirmModal
        open={deleteOpen}
        onClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}
        onConfirm={handleDeleteChat}
        loading={isDeleting}
        title={t(
          "messages",
          "delete_title",
          "Hapus percakapan?",
          "Delete conversation?",
        )}
        message={
          selectedMeta
            ? t(
                "messages",
                "delete_message",
                `Semua chat dengan "${selectedMeta.name}" (${selectedMeta.email}) akan dihapus permanen.`,
                `All chats with "${selectedMeta.name}" (${selectedMeta.email}) will be permanently deleted.`,
              )
            : ""
        }
        confirmLabel={common.yes_delete}
        cancelLabel={common.cancel}
      />
    </div>
  );
}

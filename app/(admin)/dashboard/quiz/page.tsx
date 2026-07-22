"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Edit2,
  Eye,
  Plus,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { getAdminHeaders } from "@/lib/api";

type TabKey = "questions" | "scores";

interface QuizOptionForm {
  id?: number;
  option_text: string;
  prestige_score: number;
  peaceful_calm_score: number;
  rebel_brave_score: number;
  sweet_shy_score: number;
}

interface QuizQuestionItem {
  id: number;
  question_text: string;
  options_count?: number;
  options: QuizOptionForm[];
  created_at?: string;
}

interface QuizScoreItem {
  id: number;
  user?: { id: number; name: string; email: string } | null;
  total_prestige: number;
  total_peaceful_calm: number;
  total_rebel_brave: number;
  total_sweet_shy: number;
  dominant_personality: string;
  personality_type?: string;
  match_percentage: number;
  product_id?: number | null;
  recommended_product?: { id: number; title: string } | null;
  created_at?: string;
  answers?: Array<{
    id: number;
    question_text?: string;
    option_text?: string;
  }>;
}

const emptyOption = (): QuizOptionForm => ({
  option_text: "",
  prestige_score: 0,
  peaceful_calm_score: 0,
  rebel_brave_score: 0,
  sweet_shy_score: 0,
});

const PERSONALITY_LABELS: Record<string, string> = {
  prestige: "Purpose Prestige",
  purpose_prestige: "Purpose Prestige",
  peaceful_calm: "Peaceful Calm",
  rebel_brave: "Rebel Brave",
  sweet_shy: "Sweet Shy",
};

export default function QuizAdminPage() {
  const baseUrl = SITE_STRINGS.base_url.url_backend;
  const [tab, setTab] = useState<TabKey>("questions");
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [scores, setScores] = useState<QuizScoreItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<QuizOptionForm[]>([
    emptyOption(),
    emptyOption(),
    emptyOption(),
    emptyOption(),
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "question" | "score";
    id: number;
  } | null>(null);

  const [scoreDetail, setScoreDetail] = useState<QuizScoreItem | null>(null);
  const [isScoreEditOpen, setIsScoreEditOpen] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    total_prestige: 0,
    total_peaceful_calm: 0,
    total_rebel_brave: 0,
    total_sweet_shy: 0,
    dominant_personality: "prestige",
  });

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", type: "success" });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ isOpen: true, message, type });
    setTimeout(
      () => setNotification({ isOpen: false, message: "", type: "success" }),
      3000,
    );
  };

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`${baseUrl}/api/admin/quiz/questions`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Gagal memuat soal kuis");
    const data = await res.json();
    setQuestions(data.data || []);
  }, [baseUrl]);

  const fetchScores = useCallback(async () => {
    const res = await fetch(`${baseUrl}/api/admin/quiz/scores`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Gagal memuat skor kuis");
    const data = await res.json();
    setScores(data.data || []);
  }, [baseUrl]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchQuestions(), fetchScores()]);
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Gagal memuat data kuis",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuestions, fetchScores]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return questions.filter((item) =>
      item.question_text.toLowerCase().includes(q),
    );
  }, [questions, searchTerm]);

  const filteredScores = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return scores.filter((item) => {
      const name = item.user?.name?.toLowerCase() || "";
      const email = item.user?.email?.toLowerCase() || "";
      const personality = (item.dominant_personality || "").toLowerCase();
      return name.includes(q) || email.includes(q) || personality.includes(q);
    });
  }, [scores, searchTerm]);

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setQuestionText("");
    setOptions([emptyOption(), emptyOption(), emptyOption(), emptyOption()]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: QuizQuestionItem) => {
    setModalMode("edit");
    setEditingId(item.id);
    setQuestionText(item.question_text);
    setOptions(
      item.options.length
        ? item.options.map((o) => ({
            id: o.id,
            option_text: o.option_text,
            prestige_score: Number(o.prestige_score) || 0,
            peaceful_calm_score: Number(o.peaceful_calm_score) || 0,
            rebel_brave_score: Number(o.rebel_brave_score) || 0,
            sweet_shy_score: Number(o.sweet_shy_score) || 0,
          }))
        : [emptyOption(), emptyOption()],
    );
    setIsModalOpen(true);
  };

  const updateOptionField = (
    index: number,
    field: keyof QuizOptionForm,
    value: string | number,
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)),
    );
  };

  const addOptionRow = () => {
    setOptions((prev) => [...prev, emptyOption()]);
  };

  const removeOptionRow = (index: number) => {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      showNotification("Teks soal wajib diisi.", "error");
      return;
    }
    if (options.some((o) => !o.option_text.trim())) {
      showNotification("Semua teks jawaban wajib diisi.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question_text: questionText.trim(),
        options: options.map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          option_text: o.option_text.trim(),
          prestige_score: Number(o.prestige_score) || 0,
          peaceful_calm_score: Number(o.peaceful_calm_score) || 0,
          rebel_brave_score: Number(o.rebel_brave_score) || 0,
          sweet_shy_score: Number(o.sweet_shy_score) || 0,
        })),
      };

      const url =
        modalMode === "add"
          ? `${baseUrl}/api/admin/quiz/questions`
          : `${baseUrl}/api/admin/quiz/questions/${editingId}`;

      const res = await fetch(url, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan soal");

      setIsModalOpen(false);
      showNotification(
        modalMode === "add" ? "Soal berhasil ditambahkan." : "Soal berhasil diperbarui.",
        "success",
      );
      await fetchQuestions();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menyimpan soal",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const url =
        deleteTarget.type === "question"
          ? `${baseUrl}/api/admin/quiz/questions/${deleteTarget.id}`
          : `${baseUrl}/api/admin/quiz/scores/${deleteTarget.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus data");

      setDeleteTarget(null);
      showNotification("Data berhasil dihapus.", "success");
      if (deleteTarget.type === "question") await fetchQuestions();
      else await fetchScores();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menghapus data",
        "error",
      );
    }
  };

  const openScoreDetail = async (id: number) => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/quiz/scores/${id}`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat detail skor");
      setScoreDetail(data.data);
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Gagal memuat detail skor",
        "error",
      );
    }
  };

  const openScoreEdit = (item: QuizScoreItem) => {
    setScoreDetail(item);
    setScoreForm({
      total_prestige: item.total_prestige,
      total_peaceful_calm: item.total_peaceful_calm,
      total_rebel_brave: item.total_rebel_brave,
      total_sweet_shy: item.total_sweet_shy,
      dominant_personality: item.dominant_personality || "prestige",
    });
    setIsScoreEditOpen(true);
  };

  const handleSaveScore = async () => {
    if (!scoreDetail) return;
    setIsSaving(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/admin/quiz/scores/${scoreDetail.id}`,
        {
          method: "PUT",
          headers: getAdminHeaders(),
          body: JSON.stringify(scoreForm),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui skor");

      setIsScoreEditOpen(false);
      setScoreDetail(null);
      showNotification("Skor berhasil diperbarui.", "success");
      await fetchScores();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Gagal memperbarui skor",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {notification.isOpen && (
        <div className="fixed bottom-6 right-6 z-[70] bg-white border border-gray-100 shadow-xl rounded-2xl p-4 flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              notification.type === "success" ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {notification.message}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={28} />
            Manajemen Quiz
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola soal, jawaban, skor karakter, dan hasil kuis pengguna.
          </p>
        </div>

        {tab === "questions" && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            <Plus size={16} />
            Tambah Soal
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setTab("questions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "questions"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Soal & Jawaban
          </button>
          <button
            onClick={() => setTab("scores")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "scores"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Skor Akhir
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            tab === "questions"
              ? "Cari teks soal..."
              : "Cari nama, email, atau kepribadian..."
          }
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      {tab === "questions" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Soal
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Jawaban
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                      Belum ada soal kuis.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 text-sm text-gray-500">#{item.id}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 max-w-xl">
                        {item.question_text}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.options?.length || item.options_count || 0} opsi
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "question", id: item.id })
                            }
                            className="p-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Skor
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Hasil
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      Belum ada skor kuis.
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.name || "User dihapus"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.user?.email || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 space-y-0.5">
                        <div>PC: {item.total_peaceful_calm}</div>
                        <div>PP: {item.total_prestige}</div>
                        <div>SS: {item.total_sweet_shy}</div>
                        <div>RB: {item.total_rebel_brave}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          <Trophy size={12} />
                          {PERSONALITY_LABELS[item.dominant_personality] ||
                            item.dominant_personality}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Match {item.match_percentage}%
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openScoreDetail(item.id)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openScoreEdit(item)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "score", id: item.id })
                            }
                            className="p-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === "add" ? "Tambah Soal Quiz" : "Edit Soal Quiz"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Teks Soal
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Masukkan pertanyaan kuis..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Pilihan Jawaban & Skor
                  </h3>
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                  >
                    <Plus size={14} /> Tambah Opsi
                  </button>
                </div>

                {options.map((opt, index) => (
                  <div
                    key={opt.id ?? `new-${index}`}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Opsi {index + 1}
                      </label>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionRow(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      value={opt.option_text}
                      onChange={(e) =>
                        updateOptionField(index, "option_text", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                      placeholder="Teks jawaban"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(
                        [
                          ["peaceful_calm_score", "Peaceful"],
                          ["prestige_score", "Prestige"],
                          ["sweet_shy_score", "Sweet"],
                          ["rebel_brave_score", "Rebel"],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field}>
                          <label className="block text-[11px] text-gray-500 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={opt[field]}
                            onChange={(e) =>
                              updateOptionField(
                                index,
                                field,
                                Number(e.target.value) || 0,
                              )
                            }
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail skor */}
      {scoreDetail && !isScoreEditOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[80vh] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <h2 className="text-lg font-semibold">Detail Skor #{scoreDetail.id}</h2>
              <button
                type="button"
                onClick={() => setScoreDetail(null)}
                className="p-2 hover:bg-gray-50 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-6 space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Pengguna</p>
                <p className="font-medium text-gray-900">
                  {scoreDetail.user?.name || "-"} ({scoreDetail.user?.email || "-"})
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">Peaceful: {scoreDetail.total_peaceful_calm}</div>
                <div className="rounded-xl bg-gray-50 p-3">Prestige: {scoreDetail.total_prestige}</div>
                <div className="rounded-xl bg-gray-50 p-3">Sweet: {scoreDetail.total_sweet_shy}</div>
                <div className="rounded-xl bg-gray-50 p-3">Rebel: {scoreDetail.total_rebel_brave}</div>
              </div>
              <div>
                <p className="text-gray-500">Hasil Dominan</p>
                <p className="font-medium">
                  {PERSONALITY_LABELS[scoreDetail.dominant_personality] ||
                    scoreDetail.dominant_personality}{" "}
                  ({scoreDetail.match_percentage}%)
                </p>
              </div>
              {scoreDetail.recommended_product && (
                <div>
                  <p className="text-gray-500">Produk Rekomendasi</p>
                  <p className="font-medium">{scoreDetail.recommended_product.title}</p>
                </div>
              )}
              {scoreDetail.answers && scoreDetail.answers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500">Jawaban User</p>
                  {scoreDetail.answers.map((a) => (
                    <div key={a.id} className="rounded-xl border border-gray-100 p-3">
                      <p className="font-medium text-gray-800">{a.question_text}</p>
                      <p className="text-gray-500 mt-1">{a.option_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit skor */}
      {isScoreEditOpen && scoreDetail && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Skor #{scoreDetail.id}</h2>
              <button
                onClick={() => {
                  setIsScoreEditOpen(false);
                  setScoreDetail(null);
                }}
                className="p-2 hover:bg-gray-50 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {(
                [
                  ["total_peaceful_calm", "Peaceful Calm"],
                  ["total_prestige", "Purpose Prestige"],
                  ["total_sweet_shy", "Sweet Shy"],
                  ["total_rebel_brave", "Rebel Brave"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={scoreForm[field]}
                    onChange={(e) =>
                      setScoreForm((prev) => ({
                        ...prev,
                        [field]: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Kepribadian Dominan
                </label>
                <select
                  value={scoreForm.dominant_personality}
                  onChange={(e) =>
                    setScoreForm((prev) => ({
                      ...prev,
                      dominant_personality: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                >
                  <option value="peaceful_calm">Peaceful Calm</option>
                  <option value="prestige">Purpose Prestige</option>
                  <option value="sweet_shy">Sweet Shy</option>
                  <option value="rebel_brave">Rebel Brave</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsScoreEditOpen(false);
                  setScoreDetail(null);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveScore}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Hapus data?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

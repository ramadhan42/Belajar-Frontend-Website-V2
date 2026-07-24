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
import AdminModal from "@/components/admin/AdminModal";
import { getAdminHeaders } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";

type TabKey = "questions" | "scores";

interface QuizOptionForm {
  id?: number;
  option_text: string;
  option_text_en: string;
  prestige_score: number;
  peaceful_calm_score: number;
  rebel_brave_score: number;
  sweet_shy_score: number;
}

interface QuizQuestionItem {
  id: number;
  question_text: string;
  question_text_en?: string | null;
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
    question_text_en?: string | null;
    option_text?: string;
    option_text_en?: string | null;
  }>;
}

const emptyOption = (): QuizOptionForm => ({
  option_text: "",
  option_text_en: "",
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
  const { t, common, locale } = useAdminI18n();
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
  const [questionTextEn, setQuestionTextEn] = useState("");
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

  const localizedQuestionText = (item: {
    question_text: string;
    question_text_en?: string | null;
  }) =>
    locale === "en" && item.question_text_en?.trim()
      ? item.question_text_en
      : item.question_text;

  const localizedOptionText = (item: {
    option_text?: string | null;
    option_text_en?: string | null;
  }) =>
    locale === "en" && item.option_text_en?.trim()
      ? item.option_text_en
      : item.option_text || "";

  const filteredQuestions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return questions;
    return questions.filter((item) => {
      const idText = item.question_text?.toLowerCase() || "";
      const enText = item.question_text_en?.toLowerCase() || "";
      const display = localizedQuestionText(item).toLowerCase();
      return display.includes(q) || idText.includes(q) || enText.includes(q);
    });
  }, [questions, searchTerm, locale]);

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
    setQuestionTextEn("");
    setOptions([emptyOption(), emptyOption(), emptyOption(), emptyOption()]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: QuizQuestionItem) => {
    setModalMode("edit");
    setEditingId(item.id);
    setQuestionText(item.question_text);
    setQuestionTextEn(item.question_text_en || "");
    setOptions(
      item.options.length
        ? item.options.map((o) => ({
            id: o.id,
            option_text: o.option_text,
            option_text_en: o.option_text_en || "",
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
      showNotification(
        t(
          "quiz",
          "validation_question_required",
          "Teks soal wajib diisi.",
          "Question text is required.",
        ),
        "error",
      );
      return;
    }
    if (options.some((o) => !o.option_text.trim())) {
      showNotification(
        t(
          "quiz",
          "validation_options_required",
          "Semua teks jawaban wajib diisi.",
          "All answer texts are required.",
        ),
        "error",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question_text: questionText.trim(),
        question_text_en: questionTextEn.trim() || null,
        options: options.map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          option_text: o.option_text.trim(),
          option_text_en: o.option_text_en.trim() || null,
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
        modalMode === "add"
          ? t(
              "quiz",
              "added_success",
              "Soal berhasil ditambahkan.",
              "Question added successfully.",
            )
          : t(
              "quiz",
              "updated_success",
              "Soal berhasil diperbarui.",
              "Question updated successfully.",
            ),
        "success",
      );
      await fetchQuestions();
    } catch (err) {
      showNotification(
        err instanceof Error
          ? err.message
          : t("quiz", "save_error", "Gagal menyimpan soal", "Failed to save question"),
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
      showNotification(
        t("quiz", "deleted_success", "Data berhasil dihapus.", "Data deleted successfully."),
        "success",
      );
      if (deleteTarget.type === "question") await fetchQuestions();
      else await fetchScores();
    } catch (err) {
      showNotification(
        err instanceof Error
          ? err.message
          : t("quiz", "delete_error", "Gagal menghapus data", "Failed to delete data"),
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
      showNotification(
        t("quiz", "score_updated_success", "Skor berhasil diperbarui.", "Score updated successfully."),
        "success",
      );
      await fetchScores();
    } catch (err) {
      showNotification(
        err instanceof Error
          ? err.message
          : t("quiz", "score_update_error", "Gagal memperbarui skor", "Failed to update score"),
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
            {t("quiz", "title", "Manajemen Kuis", "Quiz Management")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "quiz",
              "subtitle",
              "Kelola soal, jawaban, skor karakter, dan hasil kuis pengguna.",
              "Manage questions, answers, character scores, and quiz results.",
            )}
          </p>
        </div>

        {tab === "questions" && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            <Plus size={16} />
            {t("quiz", "add_question", "Tambah Soal", "Add Question")}
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
            {t("quiz", "tab_questions", "Soal", "Questions")}
          </button>
          <button
            onClick={() => setTab("scores")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "scores"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("quiz", "tab_scores", "Skor", "Scores")}
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            tab === "questions"
              ? t(
                  "quiz",
                  "search_questions",
                  "Cari teks soal...",
                  "Search question text...",
                )
              : t(
                  "quiz",
                  "search_scores",
                  "Cari nama, email, atau kepribadian...",
                  "Search name, email, or personality...",
                )
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
                    {common.id}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {t("quiz", "col_question", "Soal", "Question")}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {t("quiz", "col_answers", "Jawaban", "Answers")}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                    {common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                      {t("quiz", "empty_questions", "Belum ada soal kuis.", "No quiz questions yet.")}
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 text-sm text-gray-500">#{item.id}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 max-w-xl">
                        {localizedQuestionText(item)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.options?.length || item.options_count || 0}{" "}
                        {t("quiz", "options_word", "opsi", "options")}
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
                    {common.user}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {t("quiz", "col_score", "Skor", "Score")}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {t("quiz", "col_result", "Hasil", "Result")}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {common.date}
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                    {common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      {t("quiz", "empty_scores", "Belum ada skor kuis.", "No quiz scores yet.")}
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.name ||
                            t("quiz", "deleted_user", "User dihapus", "Deleted user")}
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
      <AdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zIndexClass="z-[80]"
        panelClassName="max-w-3xl"
      >
          <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === "add"
                  ? t("quiz", "modal_add", "Tambah Soal Quiz", "Add Quiz Question")
                  : t("quiz", "modal_edit", "Edit Soal Quiz", "Edit Quiz Question")}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("quiz", "question_text_id", "Teks Soal (ID)", "Question Text (ID)")}
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder={t(
                    "quiz",
                    "question_placeholder_id",
                    "Masukkan pertanyaan kuis...",
                    "Enter quiz question...",
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("quiz", "question_text_en", "Teks Soal (EN)", "Question Text (EN)")}
                </label>
                <textarea
                  value={questionTextEn}
                  onChange={(e) => setQuestionTextEn(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder={t(
                    "quiz",
                    "question_placeholder_en",
                    "Enter quiz question in English...",
                    "Enter quiz question in English...",
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {t(
                      "quiz",
                      "options_scores_heading",
                      "Pilihan Jawaban & Skor",
                      "Answer Options & Scores",
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                  >
                    <Plus size={14} />{" "}
                    {t("quiz", "add_option", "Tambah Opsi", "Add Option")}
                  </button>
                </div>

                {options.map((opt, index) => (
                  <div
                    key={opt.id ?? `new-${index}`}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t("quiz", "option_label", "Opsi", "Option")} {index + 1}
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
                      placeholder={t(
                        "quiz",
                        "answer_placeholder_id",
                        "Teks jawaban (ID)",
                        "Answer text (ID)",
                      )}
                    />
                    <input
                      value={opt.option_text_en}
                      onChange={(e) =>
                        updateOptionField(
                          index,
                          "option_text_en",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                      placeholder={t(
                        "quiz",
                        "answer_placeholder_en",
                        "Answer text (EN)",
                        "Answer text (EN)",
                      )}
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
                {common.cancel}
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? common.saving : common.save}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* Detail skor */}
      <AdminModal
        open={!!scoreDetail && !isScoreEditOpen}
        onClose={() => setScoreDetail(null)}
        zIndexClass="z-[80]"
        panelClassName="max-w-lg"
      >
          <div className="bg-white rounded-2xl w-full h-[80vh] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <h2 className="text-lg font-semibold">
                {t("quiz", "score_detail_title", "Detail Skor", "Score Detail")} #
                {scoreDetail?.id}
              </h2>
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
                <p className="text-gray-500">{common.user}</p>
                <p className="font-medium text-gray-900">
                  {scoreDetail?.user?.name || "-"} ({scoreDetail?.user?.email || "-"})
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">Peaceful: {scoreDetail?.total_peaceful_calm}</div>
                <div className="rounded-xl bg-gray-50 p-3">Prestige: {scoreDetail?.total_prestige}</div>
                <div className="rounded-xl bg-gray-50 p-3">Sweet: {scoreDetail?.total_sweet_shy}</div>
                <div className="rounded-xl bg-gray-50 p-3">Rebel: {scoreDetail?.total_rebel_brave}</div>
              </div>
              <div>
                <p className="text-gray-500">
                  {t("quiz", "dominant_result", "Hasil Dominan", "Dominant Result")}
                </p>
                <p className="font-medium">
                  {scoreDetail
                    ? PERSONALITY_LABELS[scoreDetail.dominant_personality] ||
                      scoreDetail.dominant_personality
                    : ""}{" "}
                  ({scoreDetail?.match_percentage}%)
                </p>
              </div>
              {scoreDetail?.recommended_product && (
                <div>
                  <p className="text-gray-500">
                    {t(
                      "quiz",
                      "recommended_product",
                      "Produk Rekomendasi",
                      "Recommended Product",
                    )}
                  </p>
                  <p className="font-medium">{scoreDetail.recommended_product.title}</p>
                </div>
              )}
              {scoreDetail?.answers && scoreDetail.answers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500">
                    {t("quiz", "user_answers", "Jawaban User", "User Answers")}
                  </p>
                  {scoreDetail.answers.map((a) => (
                    <div key={a.id} className="rounded-xl border border-gray-100 p-3">
                      <p className="font-medium text-gray-800">
                        {localizedQuestionText({
                          question_text: a.question_text || "",
                          question_text_en: a.question_text_en,
                        })}
                      </p>
                      <p className="text-gray-500 mt-1">
                        {localizedOptionText({
                          option_text: a.option_text,
                          option_text_en: a.option_text_en,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </AdminModal>

      {/* Edit skor */}
      <AdminModal
        open={isScoreEditOpen && !!scoreDetail}
        onClose={() => {
          setIsScoreEditOpen(false);
          setScoreDetail(null);
        }}
        zIndexClass="z-[80]"
        panelClassName="max-w-md"
      >
          <div className="bg-white rounded-2xl w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t("quiz", "score_edit_title", "Edit Skor", "Edit Score")} #
                {scoreDetail?.id}
              </h2>
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
                  {t(
                    "quiz",
                    "dominant_personality_label",
                    "Kepribadian Dominan",
                    "Dominant Personality",
                  )}
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
                {common.cancel}
              </button>
              <button
                onClick={handleSaveScore}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-50"
              >
                {isSaving ? common.saving : common.save}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* Delete confirm */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        zIndexClass="z-[80]"
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded-2xl w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {common.confirm_delete}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {t(
                "quiz",
                "confirm_delete_desc",
                "Tindakan ini tidak dapat dibatalkan.",
                "This action cannot be undone.",
              )}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
              >
                {common.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm"
              >
                {common.delete}
              </button>
            </div>
          </div>
      </AdminModal>
    </div>
  );
}

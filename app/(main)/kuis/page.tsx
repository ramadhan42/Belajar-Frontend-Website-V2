"use client";

import KuisResultSection from "@/components/kuis/KuisResultSection";
import { useNavbarColor } from "@/context/NavbarColorContext";
import React, { useState, useEffect } from "react";
import {
  getQuizQuestions,
  submitQuiz,
  QuizQuestion,
  QuizAnswer,
} from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { L } from "@/lib/localeText";
import { useTrackLocaleLoad } from "@/hooks/useTrackLocaleLoad";

const PRODUCT_COLORS = {
  peaceful_calm: "#5EA14A",
  purpose_prestige: "#1172BA",
  sweet_shy: "#DD74A5",
  rebel_brave: "#E33D35",
};

const EVOMI_PRODUCTS = {
  peaceful_calm: {
    id: "peaceful_calm",
    name: "Evomi Peaceful Calm",
    description: {
      id: "Aroma segar dan menenangkan, cocok untuk jiwa yang mencari kedamaian dan keseimbangan.",
      en: "A fresh and soothing scent, perfect for souls seeking peace and balance.",
    },
    characterImg: "/src/images/kuis/peaceful-calm.png",
    shapeImg: "/src/images/kuis/peaceful.png",
  },
  purpose_prestige: {
    id: "purpose_prestige",
    name: "Evomi Purpose Prestige",
    description: {
      id: "Aroma berkelas dan karismatik. Mewakili ambisi, tujuan yang kuat, dan kesan profesional yang eksklusif.",
      en: "A classy and charismatic scent. Represents ambition, strong purpose, and an exclusive professional impression.",
    },
    characterImg: "/src/images/kuis/purpose-prestige.png",
    shapeImg: "/src/images/kuis/purpose.png",
  },
  sweet_shy: {
    id: "sweet_shy",
    name: "Evomi Sweet Shy",
    description: {
      id: "Aroma manis yang lembut dan berhati-hati, memberikan kesan hangat, ramah, dan memikat secara perlahan.",
      en: "A soft and gentle sweet scent, giving a warm, friendly, and slowly captivating impression.",
    },
    characterImg: "/src/images/kuis/sweet-shy.png",
    shapeImg: "/src/images/kuis/sweet.png",
  },
  rebel_brave: {
    id: "rebel_brave",
    name: "Evomi Rebel Brave",
    description: {
      id: "Aroma berani dan dinamis. Memberikan suntikan energi ekstra untuk jiwa petualang yang tidak takut melanggar batas.",
      en: "A bold and dynamic scent. Gives an extra energy boost for adventurous souls unafraid to push boundaries.",
    },
    characterImg: "/src/images/kuis/rebel-brave.png",
    shapeImg: "/src/images/kuis/rabel.png",
  },
};

type ProductKey = keyof typeof EVOMI_PRODUCTS;

export default function KuisPage() {
  const { setNavbarAndFooterColor } = useNavbarColor();
  const { locale } = useLocale();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [collectedAnswers, setCollectedAnswers] = useState<QuizAnswer[]>([]);

  const [scores, setScores] = useState({
    peaceful_calm: 0,
    purpose_prestige: 0,
    sweet_shy: 0,
    rebel_brave: 0,
  });

  useTrackLocaleLoad(isLoadingQuestions);

  useEffect(() => {
    setIsLoadingQuestions(true);
    setIsFinished(false);
    setCurrentStep(0);
    setCollectedAnswers([]);
    setScores({
      peaceful_calm: 0,
      purpose_prestige: 0,
      sweet_shy: 0,
      rebel_brave: 0,
    });
    // Sumber data: backend GET /api/quiz/questions?locale=
    getQuizQuestions(locale)
      .then((data) => {
        if (data && data.length > 0) {
          setQuestions(data);
          setLoadError(null);
        } else {
          setQuestions([]);
          setLoadError(
            locale === "en"
              ? "No quiz questions on the server yet. Add questions via Admin Dashboard → Quiz."
              : "Belum ada soal kuis di server. Tambahkan soal lewat Dashboard Admin → Quiz.",
          );
        }
      })
      .catch(() => {
        setQuestions([]);
        setLoadError(
          locale === "en"
            ? "Failed to load questions from the backend."
            : "Gagal memuat soal dari backend. Pastikan API berjalan dan sudah di-seed.",
        );
      })
      .finally(() => setIsLoadingQuestions(false));
  }, [locale]);

  const handleAnswer = async (
    optionIndex: number,
    questionId: number,
    optionId: number,
  ) => {
    const currentQuestion = questions[currentStep];
    const selectedOption =
      currentQuestion?.options?.find((o) => o.id === optionId) ??
      currentQuestion?.options?.[optionIndex];

    if (!selectedOption) return;

    const newScores = {
      peaceful_calm:
        scores.peaceful_calm + (Number(selectedOption.peaceful_calm_score) || 0),
      purpose_prestige:
        scores.purpose_prestige + (Number(selectedOption.prestige_score) || 0),
      sweet_shy: scores.sweet_shy + (Number(selectedOption.sweet_shy_score) || 0),
      rebel_brave:
        scores.rebel_brave + (Number(selectedOption.rebel_brave_score) || 0),
    };

    const newAnswers = [
      ...collectedAnswers,
      { question_id: questionId, option_id: optionId },
    ];

    setScores(newScores);
    setCollectedAnswers(newAnswers);

    const isLastQuestion = currentStep >= questions.length - 1;

    if (!isLastQuestion) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null;
    if (token) {
      try {
        await submitQuiz(newAnswers, locale);
      } catch {
        // Hasil lokal tetap ditampilkan
      }
    }
    setIsFinished(true);
  };

  const getResult = () => {
    let highestScore = 0;
    let resultProductKey: ProductKey = "peaceful_calm";
    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score;
        resultProductKey = key as ProductKey;
      }
    });
    const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const matchPercentage = Math.round((highestScore / totalPoints) * 100);
    const product = EVOMI_PRODUCTS[resultProductKey];
    return { product, matchPercentage };
  };

  const getResultKey = (): ProductKey => {
    let highestScore = 0;
    let resultProductKey: ProductKey = "purpose_prestige";
    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score;
        resultProductKey = key as ProductKey;
      }
    });
    return resultProductKey;
  };

  const currentColor = isFinished
    ? PRODUCT_COLORS[getResult().product.id as keyof typeof PRODUCT_COLORS]
    : "#1172BA";

  useEffect(() => {
    setNavbarAndFooterColor(currentColor);
  }, [currentColor, setNavbarAndFooterColor]);

  const progressPercentage =
    questions.length > 0
      ? ((currentStep + 1) / questions.length) * 100
      : 0;

  if (isFinished) {
    return (
      <main className="w-full min-h-screen bg-white transition-colors duration-500">
        <KuisResultSection
          resultKey={getResultKey() as any}
          onRestart={() => window.location.reload()}
        />
      </main>
    );
  }

  if (isLoadingQuestions) {
    return (
      <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center pb-4 md:pb-12 md:pt-10 px-4 md:px-6">
        <div className="w-full max-w-[900px] min-h-[420px] rounded-[24px] flex flex-col overflow-hidden bg-white border-2 border-[#1172BA]/45 animate-pulse">
          <div className="px-8 md:px-10 py-6 shrink-0 flex flex-col justify-center h-[160px] bg-[#1172BA]/30">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/40" />
              <div className="h-3 w-28 rounded bg-white/40" />
            </div>
            <div className="h-8 w-48 rounded bg-white/40 mt-1" />
            <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/5 bg-white/40 rounded-full" />
            </div>
          </div>
          <div className="flex-grow px-6 md:px-10 py-6 md:py-8 flex flex-col justify-center bg-white">
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded w-11/12" />
              <div className="h-5 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[52px] bg-white border-2 border-[#1172BA]/35 rounded-[16px] flex items-center justify-between px-4"
                >
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="w-4 h-4 rounded-full bg-gray-100 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-[560px] rounded-[24px] bg-white border-2 border-[#1172BA]/45 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {L(locale, "Soal kuis belum tersedia", "Quiz questions not available yet")}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {loadError ||
              L(
                locale,
                "Data soal/jawaban hanya diambil dari backend. Silakan seed database atau tambah soal di admin.",
                "Question/answer data is only sourced from the backend. Please seed the database or add questions in the admin panel.",
              )}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#1172BA] text-white text-sm font-medium"
          >
            {L(locale, "Coba lagi", "Try again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center py-4 md:py-12 md:mb-7 px-4 md:px-6 font-nohemi transition-colors duration-500">
      <div className="w-full max-w-[900px] min-h-[420px] rounded-[24px] flex flex-col overflow-hidden bg-white border-2 border-[#1172BA]/55">
        <div
          className="px-8 md:px-10 py-6 shrink-0 flex flex-col justify-center h-[160px] transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src="/src/images/kuis/scent-finder-Icon.png"
              alt="Quiz Icon"
              className="w-4 h-4 md:w-5 md:h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <p className="text-[12px] md:text-[13px] text-white font-normal uppercase tracking-wide">
              {L(locale, "Kuis Scent Finder", "Scent Finder Quiz")}
            </p>
          </div>

          <h1 className="text-[28px] md:text-[32px] font-semibold text-white tracking-tight">
            {L(locale, "Temukan aromamu", "Discover your scent")}
          </h1>

          <div className="mt-4 w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A5E194] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex-grow px-6 md:px-10 py-6 md:py-8 flex flex-col justify-center bg-white">
          <div className="flex flex-col h-full justify-between">
            <h2
              className="text-[18px] md:text-[22px] font-semibold leading-snug transition-colors duration-500"
              style={{ color: currentColor }}
            >
              {questions[currentStep].text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {questions[currentStep].options.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleAnswer(idx, option.question_id, option.id)
                  }
                  className="bg-white hover:bg-sky-50 text-[13px] md:text-[15px] font-medium p-3.5 md:p-4 rounded-[16px] flex justify-between items-center transition-all active:scale-[0.98] text-left border-2 border-[#1172BA]/45 hover:border-[#1172BA]/75"
                  style={{ color: currentColor }}
                >
                  <span>{option.text}</span>
                  <svg
                    className="w-4 h-4 ml-4 shrink-0 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

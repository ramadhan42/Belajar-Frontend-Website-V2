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

// --- DATA WARNA PRODUK ---
const PRODUCT_COLORS = {
  peaceful_calm: "#5EA14A",
  purpose_prestige: "#1172BA",
  sweet_shy: "#DD74A5",
  rebel_brave: "#E33D35",
};

// --- DATA PRODUK EVOMI (statis, untuk hasil kuis) ---
const EVOMI_PRODUCTS = {
  peaceful_calm: {
    id: "peaceful_calm",
    name: "Evomi Peaceful Calm",
    description:
      "Aroma segar dan menenangkan, cocok untuk jiwa yang mencari kedamaian dan keseimbangan.",
    characterImg: "/src/images/kuis/peaceful-calm.png",
    shapeImg: "/src/images/kuis/peaceful.png",
  },
  purpose_prestige: {
    id: "purpose_prestige",
    name: "Evomi Purpose Prestige",
    description:
      "Aroma berkelas dan karismatik. Mewakili ambisi, tujuan yang kuat, dan kesan profesional yang eksklusif.",
    characterImg: "/src/images/kuis/purpose-prestige.png",
    shapeImg: "/src/images/kuis/purpose.png",
  },
  sweet_shy: {
    id: "sweet_shy",
    name: "Evomi Sweet Shy",
    description:
      "Aroma manis yang lembut dan berhati-hati, memberikan kesan hangat, ramah, dan memikat secara perlahan.",
    characterImg: "/src/images/kuis/sweet-shy.png",
    shapeImg: "/src/images/kuis/sweet.png",
  },
  rebel_brave: {
    id: "rebel_brave",
    name: "Evomi Rebel Brave",
    description:
      "Aroma berani dan dinamis. Memberikan suntikan energi ekstra untuk jiwa petualang yang tidak takut melanggar batas.",
    characterImg: "/src/images/kuis/rebel-brave.png",
    shapeImg: "/src/images/kuis/rabel.png",
  },
};

// --- DATA PERTANYAAN KUIS (fallback lokal) ---
const FALLBACK_QUESTIONS = [
  {
    id: 1,
    text: "Apa aktivitas akhir pekan favoritmu?",
    options: [
      {
        id: 1,
        question_id: 1,
        text: "Bersantai menikmati ketenangan alam",
        product: "peaceful_calm",
      },
      {
        id: 2,
        question_id: 1,
        text: "Makan malam mewah dan eksklusif",
        product: "purpose_prestige",
      },
      {
        id: 3,
        question_id: 1,
        text: "Piknik santai membaca buku",
        product: "sweet_shy",
      },
      {
        id: 4,
        question_id: 1,
        text: "Olahraga atau aktivitas menantang",
        product: "rebel_brave",
      },
    ],
  },
  {
    id: 2,
    text: "Bagaimana gaya berpakaian andalanmu sehari-hari?",
    options: [
      {
        id: 5,
        question_id: 2,
        text: "Casual, simpel, dan nyaman",
        product: "peaceful_calm",
      },
      {
        id: 6,
        question_id: 2,
        text: "Elegan, rapi, dan terstruktur",
        product: "purpose_prestige",
      },
      {
        id: 7,
        question_id: 2,
        text: "Warna pastel dan lembut",
        product: "sweet_shy",
      },
      {
        id: 8,
        question_id: 2,
        text: "Sporty, edgy, dan berani",
        product: "rebel_brave",
      },
    ],
  },
  {
    id: 3,
    text: "Aroma seperti apa yang paling menarik perhatianmu?",
    options: [
      {
        id: 9,
        question_id: 3,
        text: "Aroma laut dan udara yang sejuk",
        product: "peaceful_calm",
      },
      {
        id: 10,
        question_id: 3,
        text: "Aroma kayu-kayuan dan rempah mewah",
        product: "purpose_prestige",
      },
      {
        id: 11,
        question_id: 3,
        text: "Aroma bunga-bunga yang manis",
        product: "sweet_shy",
      },
      {
        id: 12,
        question_id: 3,
        text: "Aroma citrus yang tajam dan segar",
        product: "rebel_brave",
      },
    ],
  },
  {
    id: 4,
    text: "Kesan apa yang ingin kamu tinggalkan saat bertemu orang baru?",
    options: [
      {
        id: 13,
        question_id: 4,
        text: "Tenang, suportif, dan mudah didekati",
        product: "peaceful_calm",
      },
      {
        id: 14,
        question_id: 4,
        text: "Misterius, karismatik, dan berwibawa",
        product: "purpose_prestige",
      },
      {
        id: 15,
        question_id: 4,
        text: "Hangat, pemalu, namun menggemaskan",
        product: "sweet_shy",
      },
      {
        id: 16,
        question_id: 4,
        text: "Penuh semangat, percaya diri, dan tegas",
        product: "rebel_brave",
      },
    ],
  },
  {
    id: 5,
    text: "Pilih suasana cuaca yang paling membuat mood kamu naik:",
    options: [
      {
        id: 17,
        question_id: 5,
        text: "Pagi hari yang sejuk dan tenang",
        product: "peaceful_calm",
      },
      {
        id: 18,
        question_id: 5,
        text: "Malam hari yang dingin dan syahdu",
        product: "purpose_prestige",
      },
      {
        id: 19,
        question_id: 5,
        text: "Sore hari musim semi yang hangat",
        product: "sweet_shy",
      },
      {
        id: 20,
        question_id: 5,
        text: "Siang hari yang terik untuk beraktivitas",
        product: "rebel_brave",
      },
    ],
  },
];

const OPTION_INDEX_TO_KEY = [
  "peaceful_calm",
  "purpose_prestige",
  "sweet_shy",
  "rebel_brave",
] as const;

type ProductKey = keyof typeof EVOMI_PRODUCTS;

export default function KuisPage() {
  const { setNavbarAndFooterColor } = useNavbarColor();

  const [apiQuestions, setApiQuestions] = useState<QuizQuestion[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [collectedAnswers, setCollectedAnswers] = useState<QuizAnswer[]>([]);

  const [scores, setScores] = useState({
    peaceful_calm: 0,
    purpose_prestige: 0,
    sweet_shy: 0,
    rebel_brave: 0,
  });

  useEffect(() => {
    getQuizQuestions()
      .then((data) => {
        if (data && data.length > 0) setApiQuestions(data);
        else setApiQuestions(null);
      })
      .catch(() => setApiQuestions(null))
      .finally(() => setIsLoadingQuestions(false));
  }, []);

  const questions = apiQuestions ?? FALLBACK_QUESTIONS;
  const usingApiQuestions = apiQuestions !== null;

  const handleAnswer = async (
    optionIndex: number,
    questionId: number,
    optionId: number,
  ) => {
    const productKey: ProductKey = OPTION_INDEX_TO_KEY[optionIndex % 4];
    const newScores = { ...scores, [productKey]: scores[productKey] + 1 };
    const newAnswers = [
      ...collectedAnswers,
      { question_id: questionId, option_id: optionId },
    ];

    setScores(newScores);
    setCollectedAnswers(newAnswers);

    const isLastQuestion = currentStep >= questions.length - 1;

    if (!isLastQuestion) {
      setCurrentStep(currentStep + 1);
    } else {
      if (usingApiQuestions) {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        if (token) {
          try {
            await submitQuiz(newAnswers);
          } catch {
            // Submit gagal
          }
        }
      }
      setIsFinished(true);
    }
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
    const matchPercentage = Math.round((highestScore / questions.length) * 100);
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

  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  if (isFinished) {
    return (
      <main className="w-full min-h-screen bg-[#F6F6F6] transition-colors duration-500">
        <KuisResultSection
          resultKey={getResultKey() as any}
          onRestart={() => window.location.reload()}
        />
      </main>
    );
  }

  // placeholder kuis saat loading
  if (isLoadingQuestions) {
    return (
      <div className="w-full bg-[#F6F6F6] flex flex-col items-center justify-center pb-4 md:pb-12 md:pt-10 px-4 md:px-6">
        <div className="w-full max-w-[900px] min-h-[420px] rounded-[24px] flex flex-col shadow-2xl overflow-hidden bg-white animate-pulse">
          {/* Header placeholder — cocok dengan h-[160px] + padding card asli */}
          <div className="px-8 md:px-10 py-6 shrink-0 flex flex-col justify-center h-[160px] bg-[#1172BA]/30">
            {/* Ikon + label "Scent Finder Quiz" */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/40" />
              <div className="h-3 w-28 rounded bg-white/40" />
            </div>
            {/* Judul besar */}
            <div className="h-8 w-48 rounded bg-white/40 mt-1" />
            {/* Progress bar */}
            <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/5 bg-white/40 rounded-full" />
            </div>
          </div>

          {/* Body placeholder — cocok dengan px-6 md:px-10 py-6 md:py-8 card asli */}
          <div className="flex-grow px-6 md:px-10 py-6 md:py-8 flex flex-col justify-center">
            <div className="flex flex-col h-full justify-between">
              {/* Teks pertanyaan */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-11/12" />
                <div className="h-5 bg-gray-200 rounded w-2/3" />
              </div>
              {/* Grid 4 pilihan jawaban (2 kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-[52px] bg-[#EFEFEF] rounded-[16px] flex items-center justify-between px-4"
                  >
                    <div className="h-3 bg-gray-300 rounded w-2/3" />
                    <div className="w-4 h-4 rounded-full bg-gray-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // justify-start diganti menjadi justify-center
    // Menghapus md:mt-4 pt-8 md:pt-12 menjadi py-12 md:py-16 agar jarak atas bawah sama
    <div className="w-full bg-[#F6F6F6] flex flex-col items-center justify-center py-4 md:py-12 md:mb-7 px-4 md:px-6 font-nohemi transition-colors duration-500">
      <div className="w-full max-w-[900px] min-h-[420px] rounded-[24px] flex flex-col shadow-2xl overflow-hidden bg-white">
        {/* ================= BAGIAN ATAS CARD ================= */}
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
              Scent Finder Quiz
            </p>
          </div>

          <h1 className="text-[28px] md:text-[32px] font-semibold text-white tracking-tight">
            Temukan aromamu
          </h1>

          <div className="mt-4 w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A5E194] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* ================= BAGIAN BAWAH CARD ================= */}
        <div className="flex-grow px-6 md:px-10 py-6 md:py-8 flex flex-col justify-center">
          <div className="flex flex-col h-full justify-between">
            {/* Pertanyaan */}
            <h2
              className="text-[18px] md:text-[22px] font-semibold leading-snug transition-colors duration-500"
              style={{ color: currentColor }}
            >
              {questions[currentStep].text}
            </h2>

            {/* Pilihan Jawaban */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {questions[currentStep].options.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleAnswer(idx, option.question_id, option.id)
                  }
                  className="bg-[#EFEFEF] hover:bg-gray-200 text-[13px] md:text-[15px] font-medium p-3.5 md:p-4 rounded-[16px] flex justify-between items-center transition-all active:scale-[0.98] text-left"
                  style={{ color: currentColor }}
                >
                  <span>{option.text}</span>
                  <svg
                    className="w-4 h-4 ml-4 shrink-0"
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

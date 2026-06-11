"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// Import context untuk mengubah warna navbar
import { useNavbarColor } from "@/context/NavbarColorContext";
import KuisResultSection from "@/components/kuis/KuisResultSection";

// --- DATA WARNA PRODUK ---
const PRODUCT_COLORS = {
  peaceful_calm: "#5EA14A",
  purpose_prestige: "#1172BA",
  sweet_shy: "#DD74A5",
  rebel_brave: "#E33D35",
};

// --- DATA PRODUK EVOMI ---
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

// --- DATA PERTANYAAN KUIS ---
const QUIZ_QUESTIONS = [
  {
    question: "Apa aktivitas akhir pekan favoritmu?",
    options: [
      { text: "Bersantai menikmati ketenangan alam", product: "peaceful_calm" },
      { text: "Makan malam mewah dan eksklusif", product: "purpose_prestige" },
      { text: "Piknik santai membaca buku", product: "sweet_shy" },
      { text: "Olahraga atau aktivitas menantang", product: "rebel_brave" },
    ],
  },
  {
    question: "Bagaimana gaya berpakaian andalanmu sehari-hari?",
    options: [
      { text: "Casual, simpel, dan nyaman", product: "peaceful_calm" },
      { text: "Elegan, rapi, dan terstruktur", product: "purpose_prestige" },
      { text: "Warna pastel dan lembut", product: "sweet_shy" },
      { text: "Sporty, edgy, dan berani", product: "rebel_brave" },
    ],
  },
  {
    question: "Aroma seperti apa yang paling menarik perhatianmu?",
    options: [
      { text: "Aroma laut dan udara yang sejuk", product: "peaceful_calm" },
      {
        text: "Aroma kayu-kayuan dan rempah mewah",
        product: "purpose_prestige",
      },
      { text: "Aroma bunga-bunga yang manis", product: "sweet_shy" },
      { text: "Aroma citrus yang tajam dan segar", product: "rebel_brave" },
    ],
  },
  {
    question: "Kesan apa yang ingin kamu tinggalkan saat bertemu orang baru?",
    options: [
      {
        text: "Tenang, suportif, dan mudah didekati",
        product: "peaceful_calm",
      },
      {
        text: "Misterius, karismatik, dan berwibawa",
        product: "purpose_prestige",
      },
      { text: "Hangat, pemalu, namun menggemaskan", product: "sweet_shy" },
      {
        text: "Penuh semangat, percaya diri, dan tegas",
        product: "rebel_brave",
      },
    ],
  },
  {
    question: "Pilih suasana cuaca yang paling membuat mood kamu naik:",
    options: [
      { text: "Pagi hari yang sejuk dan tenang", product: "peaceful_calm" },
      {
        text: "Malam hari yang dingin dan syahdu",
        product: "purpose_prestige",
      },
      { text: "Sore hari musim semi yang hangat", product: "sweet_shy" },
      {
        text: "Siang hari yang terik untuk beraktivitas",
        product: "rebel_brave",
      },
    ],
  },
];

export default function KuisPage() {
  const { setNavbarAndFooterColor } = useNavbarColor();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [scores, setScores] = useState({
    peaceful_calm: 0,
    purpose_prestige: 0,
    sweet_shy: 0,
    rebel_brave: 0,
  });

  const handleAnswer = (productKey: keyof typeof scores) => {
    setScores((prevScores) => ({
      ...prevScores,
      [productKey]: prevScores[productKey] + 1,
    }));

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const getResult = () => {
    let highestScore = 0;
    let resultProductKey = "peaceful_calm";

    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score;
        resultProductKey = key;
      }
    });

    const matchPercentage = Math.round(
      (highestScore / QUIZ_QUESTIONS.length) * 100,
    );
    const product =
      EVOMI_PRODUCTS[resultProductKey as keyof typeof EVOMI_PRODUCTS];

    return { product, matchPercentage };
  };

  // Menentukan warna aktif saat ini berdasarkan state 'isFinished' dan hasil kuis
  const currentColor = isFinished
    ? PRODUCT_COLORS[getResult().product.id as keyof typeof PRODUCT_COLORS]
    : "#1172BA";

  // Mengubah warna navbar & footer secara dinamis setiap currentColor berubah
  useEffect(() => {
    setNavbarAndFooterColor(currentColor);
  }, [currentColor, setNavbarAndFooterColor]);

  const progressPercentage = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  const getResultKey = () => {
    let highestScore = 0;
    let resultProductKey = "purpose_prestige";
    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score;
        resultProductKey = key;
      }
    });
    return resultProductKey;
  };

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

  return (
    // PERUBAHAN DI SINI: pb-0 dan penghapusan min-h-[calc...] agar tidak ada jarak sisa ke footer
    // 1. Tambahkan 'justify-center' agar card benar-benar di tengah layar
    // 2. Hapus/Kurangi 'pt-8' jika ingin benar-benar di tengah absolut
    <div className="w-full bg-[#F6F6F6] flex flex-col items-center justify-start min-h-screen md:mt-7 pt-10 md:pt-16 px-4 md:px-6 font-nohemi transition-colors duration-500">
      <div className="w-full max-w-[1000px] min-h-[500px] rounded-[25px] flex flex-col shadow-2xl overflow-hidden bg-white">
        {/* ================= BAGIAN ATAS CARD ================= */}
        <div
          className="px-10 py-8 shrink-0 flex flex-col justify-center h-[200px] transition-colors duration-500"
          style={{ backgroundColor: currentColor }}
        >
          <div className="flex items-center gap-2 mb-2">
            <img
              src="/src/images/kuis/scent-finder-Icon.png"
              alt="Quiz Icon"
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <p className="text-[14px] text-white font-normal uppercase tracking-wide">
              Scent Finder Quiz
            </p>
          </div>

          <h1 className="text-[36px] font-semibold text-white tracking-tight">
            {isFinished ? "Inilah Aromamu!" : "Temukan aromamu"}
          </h1>

          {!isFinished && (
            <div className="mt-6 w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A5E194] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
        {/* ================= BAGIAN BAWAH CARD ================= */}
        <div className="flex-grow px-6 md:px-10 py-8 flex flex-col justify-center">
          {!isFinished ? (
            <div className="flex flex-col h-full justify-between">
              {/* Warna Teks Judul Pertanyaan Dinamis */}
              <h2
                className="text-[20px] md:text-[24px] font-semibold leading-snug transition-colors duration-500"
                style={{ color: currentColor }}
              >
                {QUIZ_QUESTIONS[currentStep].question}
              </h2>

              {/* Menggunakan grid-cols-1 untuk mobile, grid-cols-2 untuk desktop agar rapi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
                {QUIZ_QUESTIONS[currentStep].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAnswer(option.product as keyof typeof scores)
                    }
                    className="bg-[#EFEFEF] hover:bg-gray-200 text-[14px] md:text-[16px] font-medium p-4 md:p-5 rounded-2xl flex justify-between items-center transition-all active:scale-[0.98] text-left"
                    style={{ color: currentColor }}
                  >
                    <span>{option.text}</span>
                    <svg
                      className="w-5 h-5 ml-4 shrink-0"
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
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between h-full gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="inline-block px-4 py-1.5 bg-[#A5E194]/20 text-green-700 font-semibold rounded-full text-sm">
                  Kecocokan: {getResult().matchPercentage}%
                </div>

                {/* Warna Nama Produk Dinamis */}
                <h2
                  className="text-[24px] md:text-[28px] font-bold transition-colors duration-500"
                  style={{ color: currentColor }}
                >
                  {getResult().product.name}
                </h2>

                <p className="text-slate-600 text-[14px] md:text-[16px] leading-relaxed">
                  {getResult().product.description}
                </p>

                {/* Tombol Ulangi Kuis Dinamis */}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full md:w-auto px-8 py-3 text-white rounded-xl font-semibold hover:brightness-90 transition-all duration-300 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: currentColor }}
                >
                  Ulangi Kuis
                </button>
              </div>

              {/* === SECTION HASIL DENGAN IMAGE SHAPE & CHARACTER === */}
              <div className="flex-1 flex justify-center items-center relative w-full h-[250px] md:h-full mt-6 md:mt-0">
                <img
                  src={getResult().product.shapeImg}
                  alt="Shape"
                  className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] object-contain z-0"
                />

                <img
                  src={getResult().product.characterImg}
                  alt={getResult().product.name}
                  className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] object-contain drop-shadow-2xl z-10 -rotate-[5deg] transition-transform duration-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// --- DATA PRODUK EVOMI ---
// --- DATA PRODUK EVOMI ---
const EVOMI_PRODUCTS = {
    peaceful_calm: {
        id: 'peaceful_calm',
        name: 'Evomi Peaceful Calm',
        description: 'Aroma segar dan menenangkan, cocok untuk jiwa yang mencari kedamaian dan keseimbangan.',
        characterImg: '/src/images/kuis/peaceful-calm.png',
        shapeImg: '/src/images/kuis/peaceful.png',
    },
    purpose_prestige: {
        id: 'purpose_prestige',
        name: 'Evomi Purpose Prestige',
        description: 'Aroma berkelas dan karismatik. Mewakili ambisi, tujuan yang kuat, dan kesan profesional yang eksklusif.',
        characterImg: '/src/images/kuis/purpose-prestige.png',
        shapeImg: '/src/images/kuis/purpose.png',
    },
    sweet_shy: {
        id: 'sweet_shy',
        name: 'Evomi Sweet Shy',
        description: 'Aroma manis yang lembut dan berhati-hati, memberikan kesan hangat, ramah, dan memikat secara perlahan.',
        characterImg: '/src/images/kuis/sweet-shy.png',
        shapeImg: '/src/images/kuis/sweet.png',
    },
    rebel_brave: {
        id: 'rebel_brave',
        name: 'Evomi Rebel Brave',
        description: 'Aroma berani dan dinamis. Memberikan suntikan energi ekstra untuk jiwa petualang yang tidak takut melanggar batas.',
        characterImg: '/src/images/kuis/rebel-brave.png',
        shapeImg: '/src/images/kuis/rabel.png', // Sesuai path yang Anda berikan
    },
};

// --- DATA PERTANYAAN KUIS ---
const QUIZ_QUESTIONS = [
    {
        question: 'Apa aktivitas akhir pekan favoritmu?',
        options: [
            { text: 'Bersantai menikmati ketenangan alam', product: 'peaceful_calm' },
            { text: 'Makan malam mewah dan eksklusif', product: 'purpose_prestige' },
            { text: 'Piknik santai membaca buku', product: 'sweet_shy' },
            { text: 'Olahraga atau aktivitas menantang', product: 'rebel_brave' },
        ],
    },
    {
        question: 'Bagaimana gaya berpakaian andalanmu sehari-hari?',
        options: [
            { text: 'Casual, simpel, dan nyaman', product: 'peaceful_calm' },
            { text: 'Elegan, rapi, dan terstruktur', product: 'purpose_prestige' },
            { text: 'Warna pastel dan lembut', product: 'sweet_shy' },
            { text: 'Sporty, edgy, dan berani', product: 'rebel_brave' },
        ],
    },
    {
        question: 'Aroma seperti apa yang paling menarik perhatianmu?',
        options: [
            { text: 'Aroma laut dan udara yang sejuk', product: 'peaceful_calm' },
            { text: 'Aroma kayu-kayuan dan rempah mewah', product: 'purpose_prestige' },
            { text: 'Aroma bunga-bunga yang manis', product: 'sweet_shy' },
            { text: 'Aroma citrus yang tajam dan segar', product: 'rebel_brave' },
        ],
    },
    {
        question: 'Kesan apa yang ingin kamu tinggalkan saat bertemu orang baru?',
        options: [
            { text: 'Tenang, suportif, dan mudah didekati', product: 'peaceful_calm' },
            { text: 'Misterius, karismatik, dan berwibawa', product: 'purpose_prestige' },
            { text: 'Hangat, pemalu, namun menggemaskan', product: 'sweet_shy' },
            { text: 'Penuh semangat, percaya diri, dan tegas', product: 'rebel_brave' },
        ],
    },
    {
        question: 'Pilih suasana cuaca yang paling membuat mood kamu naik:',
        options: [
            { text: 'Pagi hari yang sejuk dan tenang', product: 'peaceful_calm' },
            { text: 'Malam hari yang dingin dan syahdu', product: 'purpose_prestige' },
            { text: 'Sore hari musim semi yang hangat', product: 'sweet_shy' },
            { text: 'Siang hari yang terik untuk beraktivitas', product: 'rebel_brave' },
        ],
    },
];

export default function KuisPage() {
    const [currentStep, setCurrentStep] = useState(0);

    // State diupdate menggunakan ID produk Evomi yang baru
    const [scores, setScores] = useState({
        peaceful_calm: 0,
        purpose_prestige: 0,
        sweet_shy: 0,
        rebel_brave: 0,
    });

    const [isFinished, setIsFinished] = useState(false);

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
        // Default disetel ke produk pertama
        let resultProductKey = 'peaceful_calm';

        Object.entries(scores).forEach(([key, score]) => {
            if (score > highestScore) {
                highestScore = score;
                resultProductKey = key;
            }
        });

        const matchPercentage = Math.round((highestScore / QUIZ_QUESTIONS.length) * 100);
        const product = EVOMI_PRODUCTS[resultProductKey as keyof typeof EVOMI_PRODUCTS];

        return { product, matchPercentage };
    };

    const progressPercentage = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center p-6 font-nohemi">

            <div className="w-full max-w-[1000px] h-[500px] rounded-[25px] flex flex-col shadow-2xl overflow-hidden">

                {/* ================= BAGIAN ATAS CARD ================= */}
                <div className="bg-[#1172BA] px-10 py-8 shrink-0 flex flex-col justify-center h-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src="/src/images/kuis/scent-finder-Icon.png"
                            alt="Quiz Icon"
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <p className="text-[14px] text-white font-normal uppercase tracking-wide">
                            Scent Finder Quiz
                        </p>
                    </div>

                    <h1 className="text-[36px] font-semibold text-white tracking-tight">
                        {isFinished ? 'Inilah Aromamu!' : 'Temukan aromamu'}
                    </h1>

                    {!isFinished && (
                        <div className="mt-6 w-full h-2 bg-blue-300/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#A5E194] transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* ================= BAGIAN BAWAH CARD ================= */}
                <div className="bg-white flex-grow px-10 py-8 flex flex-col justify-center">

                    {!isFinished ? (
                        <div className="flex flex-col h-full justify-between">
                            <h2 className="text-[24px] font-semibold text-[#1172BA] leading-snug">
                                {QUIZ_QUESTIONS[currentStep].question}
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {QUIZ_QUESTIONS[currentStep].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option.product as keyof typeof scores)}
                                        className="bg-[#EFEFEF] hover:bg-gray-200 text-[#1172BA] text-[16px] font-medium p-5 rounded-2xl flex justify-between items-center transition-all active:scale-[0.98] text-left"
                                    >
                                        <span>{option.text}</span>
                                        <svg className="w-5 h-5 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between h-full gap-8">

                            <div className="flex-1 space-y-4">
                                <div className="inline-block px-4 py-1.5 bg-[#A5E194]/20 text-green-700 font-semibold rounded-full text-sm">
                                    Kecocokan: {getResult().matchPercentage}%
                                </div>
                                <h2 className="text-[28px] font-bold text-[#1172BA]">
                                    {getResult().product.name}
                                </h2>
                                <p className="text-slate-600 text-[16px] leading-relaxed">
                                    {getResult().product.description}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-8 py-3 bg-[#1172BA] text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                                >
                                    Ulangi Kuis
                                </button>
                            </div>

                            {/* === SECTION HASIL DENGAN IMAGE SHAPE & CHARACTER ROTATED === */}
                            <div className="flex-1 flex justify-center items-center relative h-full">
                                {/* Image Shape (Di bawah) */}
                                <img
                                    src={getResult().product.shapeImg}
                                    alt="Shape"
                                    className="absolute w-[280px] h-[280px] object-contain z-0"
                                />

                                {/* Image Character (Di atas, Rotate Kiri 5 derajat) */}
                                <img
                                    src={getResult().product.characterImg}
                                    alt={getResult().product.name}
                                    className="w-[220px] h-[220px] object-contain drop-shadow-2xl z-10 -rotate-[5deg] transition-transform duration-300"
                                />
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
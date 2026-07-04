"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function ThirdSection() {
  const brandValues = [
    {
      title: "Self\nAwareness",
      description: (
        <>
          Setiap aroma dirancang untuk <b>merepresentasikan versi diri</b>,
          emosi, dan karakter manusia yang berbeda, sehingga parfum menjadi
          medium ekspresi personal, <b>bukan sekadar wewangian</b>.
        </>
      ),
      icon: "/src/images/section 3/star-medium.png",
      hoverClass: "hover:rotate-[5deg] md:hover:rotate-[5deg]",
    },
    {
      title: "Environment\nFriendly",
      description: (
        <>
          Mengusung <b>kepedulian terhadap lingkungan</b> melalui pemanfaatan
          daur ulang tutup botol plastik menjadi bagian dari identitas produk,
          sebagai bentuk kontribusi kecil dalam mengurangi limbah plastik
          sekaligus menghadirkan nilai <b>sustainability</b>.
        </>
      ),
      icon: "/src/images/section 3/peaceful-calm.png",
      hoverClass: "hover:-rotate-[5deg] md:hover:-rotate-[5deg]",
    },
    {
      title: "Playful Design\nConcept",
      description: (
        <>
          Dikemas dengan pendekatan <b>visual yang playful, ekspresif,</b> dan
          dekat dengan generasi muda agar pengalaman menggunakan parfum terasa
          lebih personal dan menyenangkan.
        </>
      ),
      icon: "/src/images/section 3/triangle.png",
      hoverClass: "hover:rotate-[5deg] md:hover:rotate-[5deg]",
    },
  ];

  // Varian untuk staggered animation pada kartu
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative bg-[#0071BC] flex flex-col items-center text-center w-full px-2 md:px-2 overflow-hidden pb-10 md:pb-10">
      {/* 1. Teks Atas - Animasi fade in dari bawah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="group flex items-center justify-center gap-3 md:gap-4 mt-10 md:mt-15 mb-6 md:mb-[30px] cursor-pointer"
      >
        <h2 className="text-[32px] sm:text-[60px] md:text-[42px] font-bold leading-tight transition-transform duration-300 ease-in-out group-hover:rotate-[4deg]">
          <span className="text-white">Brand </span>
          <span className="text-[#90EE90]">Value</span>
        </h2>
        <div className="w-[24px] md:w-[24px] h-[24px] md:h-[24px] relative flex justify-center items-center transition-transform duration-300 ease-in-out group-hover:-rotate-[4deg]">
          <Image
            src="/src/images/section 3/star-medium.png"
            alt="Icon"
            width={27}
            height={27}
            className="w-full h-full object-contain brightness-0 invert"
          />
        </div>
      </motion.div>

      {/* 2. Card Section - Animasi berurutan */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        // Opsional: Jika card terasa terlalu sempit setelah jarak dijauhkan,
        // kamu bisa mengubah max-w-6xl menjadi max-w-7xl di baris ini 👇
        className="flex justify-center w-full max-w-6xl mt-2 md:mt-4 mb-8 relative z-10"
      >
        {/* Ubah bagian gap-12 md:gap-8 menjadi gap-16 md:gap-14 (atau md:gap-16) 👇 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-14 w-full px-20 md:px-10 pt-6 md:pt-5 pb-6 md:pb-5">
          {brandValues.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="flex flex-col"
            >
              <h3 className="text-white text-[18px] md:text-[22px] font-bold mb-4 md:mb-6 text-left px-2 whitespace-pre-line">
                {card.title}
              </h3>
              <div
                className={`relative bg-white rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-xl flex flex-col cursor-pointer transition-transform duration-300 ease-out hover:z-10 flex-grow ${card.hoverClass}`}
              >
                <div className="absolute -top-6 -right-2 md:-top-5 md:-right-5 w-[60px] md:w-[45px] h-[60px] md:h-[45px] z-20 flex justify-center items-center">
                  <Image
                    src={card.icon}
                    alt={card.title.replace("\n", " ")}
                    width={70}
                    height={70}
                    className="object-contain drop-shadow-md"
                  />
                </div>
                <p className="text-left text-[#0071BC] text-[15px] md:text-[14px] leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3. Teks Bawah - Animasi scale */}
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        className="text-white text-[20px] md:text-[28px] font-bold mt-4 md:mt-[10px] mb-8 md:mb-5 relative z-10 cursor-pointer"
      >
        Every Version of Me
      </motion.p>
    </section>
  );
}

import React from "react";

const AUTH_CHARS = [
  {
    src: "/src/images/section%202/purpose-prestige.png",
    alt: "Evomi Purpose Prestige",
    className:
      "absolute top-[8%] left-[5%] md:top-[12%] md:left-[15%] -rotate-12 w-14 h-14 sm:w-24 sm:h-24 md:w-36 md:h-36 opacity-70 sm:opacity-90 z-0 drop-shadow-2xl hover:rotate-0 transition-transform duration-300",
  },
  {
    src: "/src/images/section%202/peaceful-calm.png",
    alt: "Evomi Peaceful Calm",
    className:
      "absolute top-[12%] right-[5%] md:top-[15%] md:right-[15%] rotate-12 w-14 h-14 sm:w-24 sm:h-24 md:w-36 md:h-36 opacity-70 sm:opacity-90 z-0 drop-shadow-2xl hover:rotate-0 transition-transform duration-300",
  },
  {
    src: "/src/images/section%202/sweet-shy.png",
    alt: "Evomi Sweet Shy",
    className:
      "absolute bottom-[12%] left-[8%] md:bottom-[15%] md:left-[15%] rotate-6 w-14 h-14 sm:w-24 sm:h-24 md:w-36 md:h-36 opacity-70 sm:opacity-90 z-0 drop-shadow-2xl hover:-rotate-12 transition-transform duration-300",
  },
  {
    src: "/src/images/section%202/rabel-brave.png",
    alt: "Evomi Rebel Brave",
    className:
      "absolute bottom-[12%] right-[8%] md:bottom-[12%] md:right-[15%] -rotate-[15deg] w-14 h-14 sm:w-24 sm:h-24 md:w-36 md:h-36 opacity-70 sm:opacity-90 z-0 drop-shadow-2xl hover:rotate-6 transition-transform duration-300",
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="evomi-site min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-nohemi"
      style={{ backgroundColor: "#2B92DE" }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-50 rounded-full blur-[120px]" />

      {AUTH_CHARS.map((char) => (
        <div key={char.src} className={char.className}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={char.src}
            alt={char.alt}
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      <div
        className="w-full max-w-[480px] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-blue-950/20 border border-blue-600/20 relative z-10"
        style={{ backgroundColor: "#1172ba" }}
      >
        {children}
      </div>
    </div>
  );
}

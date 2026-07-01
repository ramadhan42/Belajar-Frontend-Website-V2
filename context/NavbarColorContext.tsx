// @/context/NavbarColorContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// @/context/NavbarColorContext.tsx

interface NavbarColorContextType {
  navbarColor: string;
  footerColor: string;
  setNavbarColor: (color: string) => void; // Tambahkan ini
  setFooterColor: (color: string) => void; // Tambahkan ini
  setNavbarAndFooterColor: (color: string) => void;
  resetColors: () => void;
}

export function NavbarColorProvider({ children }: { children: ReactNode }) {
  const [navbarColor, setNavbarColor] = useState<string>("#0f62a2ff");
  const [footerColor, setFooterColor] = useState<string>("#1172BA");

  const setNavbarAndFooterColor = (color: string) => {
    setNavbarColor(color);
    setFooterColor(color);
  };

  const resetColors = () => {
    setNavbarColor("#0f62a2ff");
    setFooterColor("#1172BA");
  };

  return (
    <NavbarColorContext.Provider
      value={{
        navbarColor,
        footerColor,
        setNavbarColor, // Tambahkan ini
        setFooterColor, // Tambahkan ini
        setNavbarAndFooterColor,
        resetColors,
      }}
    >
      {children}
    </NavbarColorContext.Provider>
  );
}

const NavbarColorContext = createContext<NavbarColorContextType | undefined>(
  undefined,
);

export function useNavbarColor() {
  const context = useContext(NavbarColorContext);
  if (context === undefined) {
    throw new Error("useNavbarColor must be used within NavbarColorProvider");
  }
  return context;
}

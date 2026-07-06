// @/context/NavbarColorContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface NavbarColorContextType {
  navbarColor: string;
  footerColor: string;
  setNavbarColor: (color: string) => void;
  setFooterColor: (color: string) => void;
  setNavbarAndFooterColor: (color: string) => void;
  resetColors: () => void;
}

// Context harus dideklarasikan SEBELUM Provider yang memakainya
const NavbarColorContext = createContext<NavbarColorContextType | undefined>(
  undefined,
);

export function NavbarColorProvider({ children }: { children: ReactNode }) {
  const [navbarColor, setNavbarColor] = useState<string>("#1172BA");
  const [footerColor, setFooterColor] = useState<string>("#1172BA");

  const setNavbarAndFooterColor = useCallback((color: string) => {
    setNavbarColor(color);
    setFooterColor(color);
  }, []);

  const resetColors = useCallback(() => {
    setNavbarColor("#1172BA");
    setFooterColor("#1172BA");
  }, []);

  const stableSetNavbarColor = useCallback((color: string) => {
    setNavbarColor(color);
  }, []);

  const stableSetFooterColor = useCallback((color: string) => {
    setFooterColor(color);
  }, []);

  return (
    <NavbarColorContext.Provider
      value={{
        navbarColor,
        footerColor,
        setNavbarColor: stableSetNavbarColor,
        setFooterColor: stableSetFooterColor,
        setNavbarAndFooterColor,
        resetColors,
      }}
    >
      {children}
    </NavbarColorContext.Provider>
  );
}

export function useNavbarColor() {
  const context = useContext(NavbarColorContext);
  if (context === undefined) {
    throw new Error("useNavbarColor must be used within NavbarColorProvider");
  }
  return context;
}

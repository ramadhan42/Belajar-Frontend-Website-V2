// @/context/NavbarColorContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavbarColorContextType {
  navbarColor: string;
  footerColor: string; 
  setNavbarAndFooterColor: (color: string) => void;
  resetColors: () => void;
}

const NavbarColorContext = createContext<NavbarColorContextType | undefined>(undefined);

export function NavbarColorProvider({ children }: { children: ReactNode }) {
  // Warna default awal
  const [navbarColor, setNavbarColor] = useState<string>("#2B92DE"); 
  const [footerColor, setFooterColor] = useState<string>("#1172BA"); // Default Footer

  const setNavbarAndFooterColor = (color: string) => {
    setNavbarColor(color);
    setFooterColor(color);
  };

  const resetColors = () => {
    setNavbarColor("#2B92DE"); // Reset Navbar ke default awal
    setFooterColor("#1172BA"); // Reset Footer ke warna 1172BA
  };

  return (
    <NavbarColorContext.Provider value={{ navbarColor, footerColor, setNavbarAndFooterColor, resetColors }}>
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
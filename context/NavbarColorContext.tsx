"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavbarColorContextType {
  navbarColor: string;
  setNavbarColor: (color: string) => void;
  resetNavbarColor: () => void;
}

const NavbarColorContext = createContext<NavbarColorContextType | undefined>(undefined);

export function NavbarColorProvider({ children }: { children: ReactNode }) {
  const [navbarColor, setNavbarColor] = useState<string>("#2B92DE"); // Default color (Biru)

  const resetNavbarColor = () => {
    setNavbarColor("#2B92DE");
  };

  return (
    <NavbarColorContext.Provider value={{ navbarColor, setNavbarColor, resetNavbarColor }}>
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

"use client";

import { ReactNode, useEffect } from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { useNavbarColor } from "@/context/NavbarColorContext";
import {
  PROFILE_BRAND_BLUE,
  profileBrandGradient,
} from "@/components/profile/brand";

type ProfileBrandShellProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  headerRight?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

export default function ProfileBrandShell({
  title,
  subtitle,
  icon: Icon,
  headerRight,
  loading,
  loadingText,
  children,
}: ProfileBrandShellProps) {
  const brand = PROFILE_BRAND_BLUE;

  if (loading) {
    return (
      <div
        className="rounded-[28px] overflow-hidden border border-gray-100 min-h-[400px] flex flex-col items-center justify-center bg-white"
      >
        <Loader2
          className="w-8 h-8 animate-spin mb-4"
          style={{ color: brand }}
        />
        <p className="text-gray-500 font-medium text-sm">
          {loadingText || "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-[28px] overflow-hidden border border-gray-100 bg-white"
      style={{ ["--profile-brand" as string]: brand }}
    >
      <div
        className="relative px-5 sm:px-7 py-5 text-white"
        style={{ background: profileBrandGradient(brand) }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 90% 0%, rgba(255,255,255,0.18), transparent 35%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-[12px] sm:text-sm text-white/80 font-medium mt-0.5">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {headerRight}
        </div>
      </div>

      <div className="p-5 sm:p-7 bg-white">{children}</div>
    </div>
  );
}

export function useProfileBrand() {
  const { setNavbarAndFooterColor } = useNavbarColor();

  useEffect(() => {
    setNavbarAndFooterColor(PROFILE_BRAND_BLUE);
  }, [setNavbarAndFooterColor]);

  return PROFILE_BRAND_BLUE;
}

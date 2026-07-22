import localFont from "next/font/local";

export const nohemi = localFont({
  src: [
    {
      path: "../public/fonts/Nohemi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Nohemi-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Nohemi-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nohemi",
  display: "swap",
});

export const heavy = localFont({
  src: "../public/fonts/8-Heavy.ttf",
  variable: "--font-heavy",
  weight: "900",
  style: "normal",
  display: "swap",
});

export const parkinsans = localFont({
  src: [
    {
      path: "../public/fonts/Parkinsans-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Parkinsans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Parkinsans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Parkinsans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Parkinsans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Parkinsans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-parkinsans",
  display: "swap",
});

export const syne = localFont({
  src: [
    {
      path: "../public/fonts/Syne-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Syne-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Syne-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Syne-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Syne-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-syne",
  display: "swap",
});

export const fontVariables = [
  nohemi.variable,
  heavy.variable,
  parkinsans.variable,
  syne.variable,
].join(" ");

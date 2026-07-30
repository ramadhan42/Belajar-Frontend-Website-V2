import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Low-RAM machines: skip typecheck during `next build` (still run `tsc` separately if needed)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    qualities: [75, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.evomi.shop",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "belajar-be-website-evomi-v2-main-gbcsym.free.laravel.cloud",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "ramadhan.alwaysdata.net",
        pathname: "/storage/**",
      },
    ],
  },
  devIndicators: {},
  experimental: {},
};

export default nextConfig;

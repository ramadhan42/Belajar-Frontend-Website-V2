import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Low-RAM machines: skip typecheck during `next build` (still run `tsc` separately if needed)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent Hostinger CDN (hcdn) from caching HTML for a year after deploys.
  // Do not apply these to /_next/static (hashed assets should stay long-lived).
  async headers() {
    const noHtmlCache = [
      {
        key: "Cache-Control",
        value: "private, no-cache, no-store, max-age=0, must-revalidate",
      },
      {
        key: "CDN-Cache-Control",
        value: "no-store",
      },
    ];
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|src/|fonts/|sample-evomi/).*)",
        headers: noHtmlCache,
      },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: true,
    qualities: [75, 90, 95, 100],
    // Keep retina widths; drop 3840 (4K) — rarely needed and inflates optimizer work.
    // imageSizes stay in the "sizes" attribute small-image range (no overlap with deviceSizes).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        hostname: "images.unsplash.com",
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
  // Shared hosting (Hostinger): limit worker/CPU assumptions baked into the build.
  // Prevents Next from behaving like a 60-core machine during image/static work.
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
  },
  // Cap in-memory cache used by the Next server (~32MB).
  cacheMaxMemorySize: 32 * 1024 * 1024,
};

export default nextConfig;

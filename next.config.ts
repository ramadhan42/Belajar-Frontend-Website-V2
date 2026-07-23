import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    dangerouslyAllowLocalIP: true, // Tambahkan baris ini
    // Allow high-fidelity hero assets (quality={100})
    qualities: [75, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**', // Mengizinkan semua path di bawah hostname ini
      },
      {
        protocol: 'https',
        hostname: 'belajar-be-website-evomi-v2-main-gbcsym.free.laravel.cloud',
        port: '', // Biasanya kosong untuk HTTPS
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'ramadhan.alwaysdata.net',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
  
  // Matikan semua indikator pengembangan
  devIndicators: {
  },
  // Remove unsupported experimental flag 'devOverlay'
  experimental: {}
};

export default nextConfig;

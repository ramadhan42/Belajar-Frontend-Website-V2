import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true, // Tambahkan baris ini
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**', // Mengizinkan semua path di bawah hostname ini
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan semua indikator pengembangan
  devIndicators: {
  },
  // Remove unsupported experimental flag 'devOverlay'
  experimental: {}
};

export default nextConfig;

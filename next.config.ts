import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // 在生產構建時忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生產構建時忽略類型檢查錯誤
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

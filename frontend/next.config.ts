import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Biome is used exclusively for linting and formatting across this repository
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

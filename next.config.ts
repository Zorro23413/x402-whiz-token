import type { NextConfig } from "next";

if (!process.env.CI) {
  require("./src/lib/env");
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    nodeMiddleware: true,
  },
  // Reduce serverless function size by externalizing packages
  serverExternalPackages: [
    '@solana/web3.js',
    '@solana/spl-token',
  ],
};

export default nextConfig;

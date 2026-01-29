import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  // Turbopack config (Next.js 16+)
  turbopack: {},
};

export default nextConfig;

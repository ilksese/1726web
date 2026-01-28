import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["framer-motion"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

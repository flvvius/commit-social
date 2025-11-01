import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone", // This tells Next.js to build for dynamic server-side rendering
};

export default nextConfig;

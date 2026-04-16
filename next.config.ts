import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'tmssl.akamaized.net' },
      { hostname: 'www.brandfirm.nl' },
    ],
  },
};

export default nextConfig;

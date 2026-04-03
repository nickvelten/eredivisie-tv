import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'tmssl.akamaized.net' },
      { hostname: 'www.brandfirm.nl' },
      { hostname: 'a.espncdn.com' },
    ],
  },
};

export default nextConfig;

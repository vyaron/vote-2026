import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fs.knesset.gov.il',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/campaigns",
        destination: "/operations",
        permanent: true,
      },
      {
        source: "/calling/campaigns",
        destination: "/calling/calls",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

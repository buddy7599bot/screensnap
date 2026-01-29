import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jgnkfjyzabnrsfaiwfup.supabase.co",
      },
    ],
  },
};

export default nextConfig;

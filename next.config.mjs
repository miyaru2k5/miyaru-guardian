/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sf-static.upanhlaylink.com",
      },
      {
        protocol: "https",
        hostname: "f1980e440723315773335bc3e082876f.r2.cloudflarestorage.com",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: "/lien-he",
        destination: "/contact-facebook",
      },
      {
        source: "/dieu-khoan/:slug",
        destination: "/terms/:slug",
      },
    ];
  },
};

export default nextConfig;
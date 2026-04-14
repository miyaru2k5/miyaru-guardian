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
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
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
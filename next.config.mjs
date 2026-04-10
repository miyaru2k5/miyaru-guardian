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
      {
        protocol: "https",
        hostname: "pub-49d2fd12bb2f4f23a6d3196d2fcf2842.r2.dev",
      },
    ],
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
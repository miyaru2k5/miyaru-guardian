/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Upanh
      {
        protocol: "https",
        hostname: "sf-static.upanhlaylink.com",
      },

      // Cloudflare R2
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },

      // VnExpress CDN
      {
        protocol: "https",
        hostname: "**.vnecdn.net",
      },
      {
        protocol: "https",
        hostname: "**.vnexpress.net",
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
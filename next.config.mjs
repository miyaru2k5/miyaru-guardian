const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for now to support R2/Custom domains
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/lien-he", destination: "/contact-facebook" },
      { source: "/dieu-khoan/:slug", destination: "/terms/:slug" },
    ];
  },
};

export default nextConfig;

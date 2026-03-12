const nextConfig = {
  async rewrites() {
    return [
      { source: "/lien-he", destination: "/contact-facebook" },
      { source: "/dieu-khoan/:slug", destination: "/terms/:slug" },
    ];
  },
};

export default nextConfig;

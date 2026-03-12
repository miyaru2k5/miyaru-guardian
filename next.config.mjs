const nextConfig = {
  eslint: {
    dirs: ["app", "components", "lib", "hooks", "contexts", "types", "integrations"],
  },
  async rewrites() {
    return [
      { source: "/lien-he", destination: "/contact-facebook" },
      { source: "/dieu-khoan/:slug", destination: "/terms/:slug" },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  // Postgres embarqué (développement local) : chargé tel quel par Node, sans passer par le bundler
  serverExternalPackages: ["@electric-sql/pglite"],
  async redirects() {
    return [
      { source: "/journal", destination: "/conseils", permanent: true },
      { source: "/journal/:slug", destination: "/conseils/:slug", permanent: true },
      { source: "/equipe", destination: "/", permanent: true }
    ];
  }
};

export default nextConfig;

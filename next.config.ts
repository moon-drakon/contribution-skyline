import type { NextConfig } from "next";

// Static export for GitHub Pages. The site is served from /contribution-skyline/.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/contribution-skyline",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

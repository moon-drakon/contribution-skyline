import type { NextConfig } from "next";

// Static export for GitHub Pages. The deploy workflow sets PAGES_BASE_PATH to the
// repository path ("/contribution-skyline"), or "" for a user site or custom domain.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH ?? "",
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

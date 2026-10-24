import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages. The deploy workflow sets
  // PAGES_BASE_PATH to "/second-look"; locally it stays at the root.
  output: "export",
  basePath: process.env.PAGES_BASE_PATH || "",
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

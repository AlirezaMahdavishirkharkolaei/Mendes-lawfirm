import type { NextConfig } from "next";

/**
 * Static export: the site is plain HTML/CSS/JS and can be hosted
 * anywhere (GitHub Pages, Vercel, Netlify, any web server).
 * NEXT_PUBLIC_BASE_PATH is set when the site is served from a sub-path,
 * e.g. "/mendes-lawfirm" on GitHub Pages; leave it empty on a domain root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  experimental: { globalNotFound: true },
};

export default nextConfig;

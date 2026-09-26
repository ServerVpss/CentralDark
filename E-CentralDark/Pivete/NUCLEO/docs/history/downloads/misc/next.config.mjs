import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import createNextIntlPlugin from "next-intl/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    unoptimized: true,
  },
  // Disable Next.js built-in Tailwind CSS handling completely
  tailwindcss: false,
  // Ensure Next.js doesn't auto-detect Tailwind
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'tailwindcss': false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
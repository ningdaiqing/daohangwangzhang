/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "favicon.im",
      },
    ],
  },
  // 防止 better-sqlite3 被打包到 edge runtime
  serverExternalPackages: ["better-sqlite3"],
  webpack(config, { isServer, nextRuntime }) {
    if (nextRuntime === "edge") {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["better-sqlite3"] = false;
    }
    return config;
  },
};

export default nextConfig;

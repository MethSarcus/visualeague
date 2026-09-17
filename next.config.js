/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.135"],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

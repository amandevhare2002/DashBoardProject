/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  sassOptions: {
    fiber: false,
    includePaths: [path.join(__dirname, "src/styles")],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  swcMinify: false
}


const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)

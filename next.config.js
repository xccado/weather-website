/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CAIYUN_API_KEY: process.env.CAIYUN_API_KEY,
    TENCENT_API_KEY: process.env.TENCENT_API_KEY,
  }
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
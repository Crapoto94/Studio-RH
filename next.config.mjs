/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [],
  },
  experimental: {
    instrumentationHook: true
  }
}

export default nextConfig

/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  trailingSlash: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  ...(isGithubPages
    ? {
        basePath: '/AK-VISIO-SOFTWARE-FACTORY-V2',
        assetPrefix: '/AK-VISIO-SOFTWARE-FACTORY-V2/',
      }
    : {}),
}

export default nextConfig

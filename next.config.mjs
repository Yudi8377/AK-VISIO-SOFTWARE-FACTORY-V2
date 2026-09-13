/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS === 'true'
const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  trailingSlash: true,
  ...(isGithubPages ? { basePath: '/AK-VISIO-SOFTWARE-FACTORY-V2', assetPrefix: '/AK-VISIO-SOFTWARE-FACTORY-V2/' } : {}),
}
export default nextConfig

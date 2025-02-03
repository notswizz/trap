/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Remove or update basePath to match your repository name
  // For example, if your repo is "my-app", use '/my-app'
  // If deploying to a custom domain or Vercel, you might not need basePath at all
  // basePath: '/trap',
}

module.exports = nextConfig 
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  // NO PONGAS output: 'export', así Next.js usa backend/API en Vercel
  basePath: isGithubPages ? '/rottenlayer' : '',
  assetPrefix: isGithubPages ? '/rottenlayer/' : '',

  compiler: {
    styledComponents: true
  },

  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
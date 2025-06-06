const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  // Quita el modo export, así habilitas el backend/API:
  // output: 'export',   // <-- NO usar si quieres panel admin/BD/API

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
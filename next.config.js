const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/rottenlayer' : '',
  assetPrefix: isGithubPages ? '/rottenlayer/' : '',

  // Habilitamos styled-components para build estático:
  compiler: {
    styledComponents: true
  },

  // Desactivamos Image Optimization en export:
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
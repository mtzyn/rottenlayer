const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/rottenlayer' : '',
  assetPrefix: isGithubPages ? '/rottenlayer/' : '',
};

module.exports = nextConfig;
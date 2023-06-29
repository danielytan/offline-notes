const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV !== 'development',
  },
};

module.exports = nextConfig;
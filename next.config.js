/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'njit.campuslabs.com',
        port: '',
        pathname: '/engage/**', // Allows any image path under /engage/
      },
      // Add other allowed image hostnames here if needed
    ],
  },
  // Add any other Next.js configurations here if needed in the future
};

module.exports = nextConfig; 
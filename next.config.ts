/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com', // Pixabay videos cdn.pixabay.com se aate hain
      },
      {
        protocol: 'https',
        hostname: 'demo-dentist-main-adaeep.free.laravel.cloud',
        pathname: '/storage/**',
      },

    ],
  },
};

export default nextConfig;
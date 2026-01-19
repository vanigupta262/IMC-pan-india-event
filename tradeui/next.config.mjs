/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  
  // Environment variables for API URLs
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8000',
    FRONTEND_SERVER_URL: process.env.FRONTEND_SERVER_URL || 'http://localhost:3000',
  },
  
  // Rewrites to proxy API requests to the FastAPI backend
  async rewrites() {
    return [
      // Proxy direct backend API calls
      {
        source: '/backend/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    AIRWALLEX_API_KEY: process.env.AIRWALLEX_API_KEY,
    AIRWALLEX_CLIENT_ID: process.env.AIRWALLEX_CLIENT_ID,
    AIRWALLEX_ENVIRONMENT: process.env.AIRWALLEX_ENVIRONMENT || 'demo'
  }
};

module.exports = nextConfig; 
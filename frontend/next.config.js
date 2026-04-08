/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: ['*.replit.dev', '*.kirk.replit.dev'],
};

module.exports = nextConfig;

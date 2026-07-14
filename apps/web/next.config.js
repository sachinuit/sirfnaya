/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["placehold.co", "res.cloudinary.com"],
  },
};

module.exports = nextConfig;

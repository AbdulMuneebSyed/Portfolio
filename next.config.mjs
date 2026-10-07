/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The resume used to live under its old file name; links already sent
  // out keep working.
  async redirects() {
    return [
      {
        // Matched loosely: the browser sends spaces and the quote encoded.
        source: "/:file(Syed.+SDE.+Resume.+15.+\\.pdf)",
        destination: "/syedabdulmuneebresume.pdf",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

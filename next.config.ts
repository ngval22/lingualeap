import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       // Add pattern for AI Platform generated images if needed (replace with actual pattern)
      // {
      //   protocol: 'https',
      //   hostname: 'aiplatform.googleapis.com', // Example hostname
      //   port: '',
      //   pathname: '/**',
      // },
    ],
     // Allow data URIs
     dangerouslyAllowSVG: true, // If you use SVGs
     contentDispositionType: 'attachment',
     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
     // Allow data: scheme for images
     domains: [], // Keep empty or add other domains
     loader: 'default', // or imgix, cloudinary, etc.
     // Add 'data' to the list of allowed protocols
     // This might require adjusting other settings or using unoptimized={true} on Image component
     // For newer Next.js versions, remotePatterns is preferred, but data URIs need specific handling.
     // Often, using unoptimized={true} is the simplest way for data URIs.
     // Or configure a custom loader if necessary. Let's rely on unoptimized for now.

  },
};

export default nextConfig;

      
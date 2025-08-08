// next.config.mjs
import withPWAInit from "next-pwa";

// 1) INIT the PWA plugin with ONLY PWA/Workbox options
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // enable in dev for testing (note: offline caching is mostly disabled in dev by next-pwa)
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // HTML / navigation requests
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
      },
    },
    // Images
    {
      urlPattern: ({ request }) => request.destination === "image",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "images" },
    },
    // API GETs
    {
      urlPattern: /^https:\/\/api\.ragadecode\.com\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api",
        networkTimeoutSeconds: 3,
      },
    },
  ],
  // avoid precaching Next middleware manifest
  buildExcludes: [/middleware-manifest\.json$/],
});

// 2) NORMAL Next.js config stays in a plain object
const nextConfig = {
  experimental: {
    allowedDevOrigins: ["https://*.ngrok-free.app"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ragadecode-media.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "genuine-compassion-eb21be0109.media.strapiapp.com",
      },
      { protocol: "https", hostname: "ragadecode.com" },
      { protocol: "https", hostname: "api.ragadecode.com" },
    ],
  },
  // any other Next options…
  reactStrictMode: true,
};

// 3) Export the wrapped config (MUST be an object, not an array)
export default withPWA(nextConfig);

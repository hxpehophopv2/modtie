import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// @serwist/next is a webpack plugin, so production builds run with `next build --webpack`.
// In dev (Turbopack) the service worker is disabled to keep HMR fast and avoid stale caches.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: false, // never reload mid-game when the party wifi flickers back
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Silences the "webpack config present but using Turbopack" check in `next dev`.
  turbopack: {},
};

export default withSerwist(nextConfig);

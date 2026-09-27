import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest and linked in <head> automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ModTie — Party Charades",
    short_name: "ModTie",
    description: "Phone on your forehead. Tilt down = correct, tilt up = pass. Works offline.",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "landscape",
    background_color: "#1a0633",
    theme_color: "#1a0633",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

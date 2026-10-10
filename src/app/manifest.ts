/* ============================================================
   FILE: app/manifest.ts   (NEW)   - served at /manifest.webmanifest
   Makes the dashboard installable ("Install app" / "Add to Home Screen").
   The icons are in public/icons/.
   ============================================================ */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "GFI Lead Dashboard",
    short_name: "GFI Leads",
    description: "Lead and content tracker for GFI Armed Forces Division social media",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Navy, like the sidebar: the phone shows this colour with the icon while the app opens
    background_color: "#15223b",
    theme_color: "#15223b",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
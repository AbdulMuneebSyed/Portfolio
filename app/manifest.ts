import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muneeb OS — Syed Abdul Muneeb",
    short_name: "Muneeb OS",
    description:
      "Interactive macOS-style portfolio of Syed Abdul Muneeb, Software Engineer.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d1d1f",
    theme_color: "#1d1d1f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

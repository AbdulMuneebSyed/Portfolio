import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.syedabdulmuneeb.dev",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://www.syedabdulmuneeb.dev/profile",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

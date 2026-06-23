import type { MetadataRoute } from "next";

const BASE_URL = "https://budget-csjdm.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, priority: 1, changeFrequency: "daily" },
    { url: `${BASE_URL}/budget`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/projects`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/procurement`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/accountability`, priority: 0.8, changeFrequency: "weekly" },
  ];
}

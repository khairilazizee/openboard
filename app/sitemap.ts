import type { MetadataRoute } from "next";
import { prisma } from "./lib/prisma";
import { getBaseUrl } from "./lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const ads = await prisma.ads.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const adEntries: MetadataRoute.Sitemap = ads.map((ad) => ({
    url: `${baseUrl}/ads/${ad.slug || ad.id}`,
    lastModified: ad.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...adEntries,
  ];
}

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Link from "next/link";
import { AdsGridWithSidebar } from "./components/AdsGridWithSidebar";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenBoard",
  description:
    "Browse fresh classified ads across jobs, services, community, and local deals.",
  alternates: {
    canonical: "/",
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  "ALL",
  "MARKETPLACE",
  "SERVICES",
  "JOBS",
  "PROPERTY",
  "VEHICLE",
  "BUSINESSES",
  "REQUESTS",
  "EVENTS",
  "COMMUNITY",
  "DEALS",
  "NEWS",
];

async function getUserLocationFromHeader() {
  const h = await headers();
  const city = h.get("x-vercel-ip-city")?.trim();
  return city || null;
}

async function getAds(
  search: string | null,
  category: string | null,
  tag: string | null,
  userLocation: string | null,
) {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: any[] = [
    { OR: [{ endDate: null }, { endDate: { gt: now } }] },
  ];

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          tags: { some: { name: { contains: search, mode: "insensitive" } } },
        },
      ],
    });
  }

  if (tag) {
    andConditions.push({
      tags: {
        some: {
          name: {
            equals: tag,
            mode: "insensitive",
          },
        },
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
    AND: andConditions,
  };

  if (category && category !== "ALL") {
    where.category = category;
  }

  if (userLocation) {
    const localAds = await prisma.ads.findMany({
      where: {
        ...where,
        location: {
          some: { name: { equals: userLocation, mode: "insensitive" } },
        },
      },
      include: { user: true, tags: true, location: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    if (localAds.length > 0) return localAds;
  }

  return await prisma.ads.findMany({
    where,
    include: {
      user: true,
      tags: true,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

function shuffleAds<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || null;
  const category = params.category || null;
  const tag = params.tag?.trim() || null;
  const userLocation = await getUserLocationFromHeader();
  const ads = await getAds(search, category, tag, userLocation);
  const randomizedAds = shuffleAds(ads);
  const serializedAds = randomizedAds.map((ad) => ({
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    description: ad.description,
    category: ad.category,
    priority: ad.priority || 0,
    imageUrl: ad.imageUrl,
    url: ad.url,
    contactName: ad.contactName,
    contactNumber: ad.contactNumber,
    createdAt: ad.createdAt.toISOString(),
    tags: ad.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    user: {
      name: ad.user.name,
    },
  }));

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-900 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                <h1 className="text-2xl font-bold text-green-400 font-mono">
                  OPENBOARD
                </h1>
                <span className="font-mono text-xs text-zinc-500">LIVE</span>
              </div>
              <div className="font-mono text-sm text-zinc-400">
                {ads.length} active listings
              </div>
            </div>
            <form className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search ticker or description..."
                className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-sm text-green-400 placeholder-zinc-600 focus:border-green-500 focus:outline-none"
              />
              <input type="hidden" name="category" value={category || ""} />
              <input type="hidden" name="tag" value={tag || ""} />
              <button
                type="submit"
                className="rounded border border-green-500 bg-green-500/10 px-6 py-2 font-mono text-sm font-bold text-green-400 transition-colors hover:bg-green-500/20"
              >
                SEARCH
              </button>
            </form>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${cat}${search ? `&search=${search}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                  className={`rounded px-3 py-1 font-mono text-xs font-bold transition-colors ${
                    (category || "ALL") === cat
                      ? "bg-green-500 text-black"
                      : "border border-zinc-700 text-zinc-400 hover:border-green-500 hover:text-green-400"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
            {tag && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-zinc-500">Tag filter:</span>
                <span className="rounded bg-green-500/20 px-2 py-1 text-green-400">
                  #{tag}
                </span>
                <Link
                  href={`/?category=${category || "ALL"}${search ? `&search=${search}` : ""}`}
                  className="rounded border border-zinc-700 px-2 py-1 text-zinc-400 hover:border-green-500 hover:text-green-400"
                >
                  Clear tag
                </Link>
              </div>
            )}
          </div>

          <AdsGridWithSidebar ads={serializedAds} activeTag={tag} />

          {ads.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded border border-zinc-800 bg-zinc-800/30 py-16">
              <div className="mb-4 font-mono text-xl text-zinc-500">
                NO DATA AVAILABLE
              </div>
              <p className="font-mono text-sm text-zinc-600">
                Try adjusting your search parameters
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

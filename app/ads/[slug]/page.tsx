import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "../../lib/prisma";
import { getBaseUrl } from "../../lib/seo";
import { AdDetailsActions } from "../../components/AdDetailsActions";

async function getAdBySlug(slug: string) {
  const now = new Date();
  const include = {
    user: true,
    tags: true,
  } as const;

  const bySlug = await prisma.ads.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    include,
  });

  if (bySlug) return bySlug;

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      slug,
    );

  if (!isUuid) return null;

  return prisma.ads.findFirst({
    where: {
      id: slug,
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    include,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);

  if (!ad) {
    return {
      title: "Ad Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pathSlug = ad.slug || ad.id;
  const canonicalPath = `/ads/${pathSlug}`;
  const title = `${ad.title} (${ad.category})`;
  const description = ad.description.slice(0, 155);
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${canonicalPath}`;
  const image = ad.imageUrl ? new URL(ad.imageUrl, baseUrl).toString() : null;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: image ? [{ url: image, alt: ad.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: ad.status === "ACTIVE",
      follow: ad.status === "ACTIVE",
    },
  };
}

export default async function AdDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);

  if (!ad) {
    notFound();
  }

  function toExternalUrl(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  }
  const baseUrl = getBaseUrl();
  const sharePath = `/ads/${ad.slug || ad.id}`;
  const shareUrl = `${baseUrl}${sharePath}`;

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← Back to listings
            </Link>
          </div>

          <article className="overflow-hidden rounded-lg border border-solid border-black/[.08] bg-white dark:border-white/[.145] dark:bg-[#1a1a1a]">
            {ad.imageUrl && (
              <div className="relative h-56 w-full sm:h-80">
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {ad.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    ad.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : ad.status === "PRIVATE"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {ad.status}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
                {ad.title}
              </h1>

              <p className="mt-4 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {ad.description}
              </p>

              {ad.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {ad.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {ad.url && (
                <div className="mt-4 border-t border-zinc-800/60 pt-4">
                  <p className="font-mono text-[11px] text-zinc-500">
                    For more information, visit:
                  </p>
                  <a
                    href={toExternalUrl(ad.url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 block font-mono text-sm font-semibold text-green-400 hover:text-green-200"
                  >
                    {ad.url}
                  </a>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-black/[.08] pt-6 dark:border-white/[.145] sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Posted By
                  </p>
                  <p className="mt-1 text-sm text-black dark:text-zinc-50">
                    {ad.user.name || "Unknown User"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Posted On
                  </p>
                  <p className="mt-1 text-sm text-black dark:text-zinc-50">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Contact Name
                  </p>
                  <p className="mt-1 text-sm text-black dark:text-zinc-50">
                    {ad.contactName || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Contact Number
                  </p>
                  <p className="mt-1 text-sm text-black dark:text-zinc-50">
                    {ad.contactNumber || "Not provided"}
                  </p>
                </div>
              </div>
              <AdDetailsActions
                adId={ad.id}
                title={ad.title}
                shareUrl={shareUrl}
              />
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

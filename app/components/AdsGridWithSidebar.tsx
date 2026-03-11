"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, useMemo, useState } from "react";

type MarketAd = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: string;
  priority: number;
  imageUrl: string | null;
  url: string | null;
  contactName: string | null;
  contactNumber: string | null;
  createdAt: string;
  tags: { id: string; name: string }[];
  user: { name: string | null };
};

function getCardStyle(priority: number) {
  if (priority >= 3) return "row-span-2 col-span-2";
  if (priority === 2) return "row-span-2";
  if (priority === 1) return "row-span-1 col-span-2";
  return "row-span-1";
}
// function toExternalUrl(url: string)
function toExternalUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function trackAdView(adId: string) {
  const payload = JSON.stringify({ adId });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/ads/view", blob);
    return;
  }

  void fetch("/api/ads/view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  });
}

function getAdShareUrl(ad: MarketAd) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/ads/${ad.slug || ad.id}`;
}

function AdCardBody({
  ad,
  activeTag,
  onTagClick,
}: {
  ad: MarketAd;
  activeTag: string | null;
  onTagClick: (event: MouseEvent<HTMLButtonElement>, tag: string) => void;
}) {
  return (
    <>
      {ad.imageUrl && (
        <div className="relative mb-3 -mx-4 -mt-4 h-32 w-auto overflow-hidden">
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <span className="font-mono text-[10px] text-zinc-500">
          {ad.id.slice(0, 8).toUpperCase()}
        </span>
      </div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] text-green-400">
          {ad.category}
        </span>
      </div>
      <h3 className="mb-2 line-clamp-2 font-mono text-sm font-bold text-zinc-100 group-hover:text-green-400 hover:cursor-pointer">
        {ad.title}
      </h3>
      <p className="line-clamp-2 font-mono text-[11px] text-zinc-500">
        {ad.description}
      </p>
      {ad.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {ad.tags.slice(0, 3).map((tag) => (
            <span key={tag.id}>
              <button
                key={tag.id}
                type="button"
                onClick={(event) => onTagClick(event, tag.name)}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                  activeTag?.toLowerCase() === tag.name.toLowerCase()
                    ? "bg-green-500/25 text-green-300 hover:cursor-pointer"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:cursor-pointer"
                }`}
              >
                #{tag.name}
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-2">
        <span className="font-mono text-[10px] text-zinc-500">
          @{ad.user.name?.toLowerCase().replace(/\s/g, "") || "unknown"}
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          {new Date(ad.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </>
  );
}

export function AdsGridWithSidebar({
  ads,
  activeTag = null,
}: {
  ads: MarketAd[];
  activeTag?: string | null;
}) {
  const [activeAdId, setActiveAdId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeAd = useMemo(
    () => ads.find((ad) => ad.id === activeAdId) || null,
    [ads, activeAdId],
  );

  async function handleCopyShareUrl() {
    if (!activeAd) return;
    const shareUrl = getAdShareUrl(activeAd);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    if (!activeAd) return;
    const shareUrl = getAdShareUrl(activeAd);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: activeAd.title,
          url: shareUrl,
        });
        return;
      } catch {
        // User canceled; no action needed.
      }
    }

    await handleCopyShareUrl();
  }

  function handleTagClick(event: MouseEvent<HTMLButtonElement>, tag: string) {
    event.preventDefault();
    event.stopPropagation();

    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tag);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="grid grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {ads.map((ad) => {
          const baseClass = `group relative overflow-hidden rounded border border-zinc-800 bg-zinc-800/50 p-4 text-left transition-all hover:border-green-500/50 ${getCardStyle(
            ad.priority || 0,
          )}`;

          return (
            <div
              key={ad.id}
              onClick={() => {
                trackAdView(ad.id);
                setActiveAdId(ad.id);
              }}
              className={`${baseClass} cursor-pointer`}
            >
              <AdCardBody
                ad={ad}
                activeTag={activeTag}
                onTagClick={handleTagClick}
              />
            </div>
          );
        })}
      </div>

      {activeAd && (
        <>
          <button
            type="button"
            aria-label="Close details sidebar"
            onClick={() => setActiveAdId(null)}
            className="fixed inset-0 z-40 bg-black/60"
          />
          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] text-green-400">
                  {activeAd.category}
                </p>
                <h2 className="mt-1 font-mono text-lg font-bold text-zinc-100">
                  {activeAd.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdId(null)}
                className="rounded border border-zinc-700 px-2 py-1 font-mono text-xs text-zinc-400 hover:border-green-500 hover:text-green-400"
              >
                CLOSE
              </button>
            </div>

            {activeAd.imageUrl && (
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded border border-zinc-800">
                <Image
                  src={activeAd.imageUrl}
                  alt={activeAd.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <p className="whitespace-pre-wrap font-mono text-sm text-zinc-300">
              {activeAd.description}
            </p>

            {activeAd.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeAd.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={(event) => handleTagClick(event, tag.name)}
                    className={`rounded px-2 py-1 font-mono text-[11px] ${
                      activeTag?.toLowerCase() === tag.name.toLowerCase()
                        ? "bg-green-500/25 text-green-300"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}

            {activeAd.url && (
              <div className="mt-4 border-t border-zinc-800/60 pt-4">
                <p className="font-mono text-[11px] text-zinc-500">
                  For more information, visit:
                </p>
                <a
                  href={toExternalUrl(activeAd.url)}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-1 block font-mono text-sm font-semibold text-green-400 hover:text-green-200"
                >
                  {activeAd.url}
                </a>
              </div>
            )}

            <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Poster</span>
                <span className="text-zinc-300">
                  {activeAd.user.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Contact</span>
                <span className="text-zinc-300">
                  {activeAd.contactName || "Not provided"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Phone</span>
                <span className="text-zinc-300">
                  {activeAd.contactNumber || "Not provided"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Created</span>
                <span className="text-zinc-300">
                  {new Date(activeAd.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded border border-zinc-700 px-2 py-1 text-zinc-300 hover:border-green-500 hover:text-green-400"
                >
                  SHARE
                </button>
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className="rounded border border-zinc-700 px-2 py-1 text-zinc-300 hover:border-green-500 hover:text-green-400"
                >
                  {copied ? "COPIED" : "COPY LINK"}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

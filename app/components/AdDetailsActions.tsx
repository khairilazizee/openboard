"use client";

import { useEffect, useState } from "react";

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

type AdDetailsActionsProps = {
  adId: string;
  title: string;
  shareUrl: string;
};

export function AdDetailsActions({ adId, title, shareUrl }: AdDetailsActionsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackAdView(adId);
  }, [adId]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch {
        // User canceled; no action needed.
      }
    }

    await handleCopy();
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Share
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}

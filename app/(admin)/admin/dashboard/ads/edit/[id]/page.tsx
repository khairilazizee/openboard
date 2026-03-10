import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../../../../lib/prisma";
import { ensureUserFromClerkId } from "../../../../../../lib/user";
import { updateAdByAdmin } from "../../../../../../lib/actions";
import { DeleteAdForm } from "./DeleteAdForm";

const categories = [
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
] as const;

const statuses = ["ACTIVE", "INACTIVE", "PRIVATE"] as const;

function toDateTimeLocalValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default async function EditAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const user = await ensureUserFromClerkId(clerkId);
  const isAllowedAdmin =
    user.isAdmin && user.email.toLowerCase() === "khairil114@gmail.com";

  if (!isAllowedAdmin) {
    redirect("/");
  }

  const { id } = await params;
  const ad = await prisma.ads.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!ad) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Edit Ad
            </h1>
            <Link
              href="/admin/dashboard/ads"
              className="rounded border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-[#1a1a1a]"
            >
              Back to Listings
            </Link>
          </div>

          <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
            <div className="mb-4 rounded bg-zinc-100 p-3 dark:bg-zinc-800">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Title
              </p>
              <p className="mt-1 text-lg font-semibold text-black dark:text-zinc-50">
                {ad.title}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Owner: {ad.user.email}
              </p>
            </div>

            <form
              action={updateAdByAdmin.bind(null, ad.id)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="category"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={ad.category}
                  className="w-full rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={ad.status}
                  className="w-full rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(ad.startDate)}
                  className="w-full rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(ad.endDate)}
                  className="w-full rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-black/[.08] pt-6 dark:border-white/[.145]">
              <DeleteAdForm adId={ad.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

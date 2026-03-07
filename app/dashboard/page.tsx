import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUserFromClerkId } from "../lib/user";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const user = await ensureUserFromClerkId(clerkId);

  const ads = await prisma.ads.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          adsViews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAds = ads.length;
  const activeAds = ads.filter((ad) => ad.status === "ACTIVE").length;

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 p-6 dark:bg-black pt-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Dashboard
            </h1>
            <Link
              href="/dashboard/create"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Create New Ad
            </Link>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Ads
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                {totalAds}
              </p>
            </div>
            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Active Ads
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                {activeAds}
              </p>
            </div>
            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Messages
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                0
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-solid border-black/[.08] bg-white dark:border-white/[.145] dark:bg-[#1a1a1a]">
            <div className="border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                Your Ads
              </h2>
            </div>
            {ads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[.08] bg-zinc-50 dark:border-white/[.145] dark:bg-[#2a2a2a]">
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr
                        key={ad.id}
                        className="border-b border-black/[.08] dark:border-white/[.145]"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-black dark:text-zinc-50">
                              {ad.title}
                            </p>
                            <p className="text-sm600 dark:text-z text-zinc-inc-400">
                              {ad.description.slice(0, 50)}...
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              ad.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ad.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-black dark:text-zinc-50">
                          {ad.category}
                        </td>
                        <td className="px-6 py-4 text-black dark:text-zinc-50">
                          {ad._count.adsViews}
                        </td>
                        <td className="px-6 py-4 text-black dark:text-zinc-50">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/edit?id=${ad.id}`}
                            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  You haven&apos;t created any ads yet
                </p>
                <Link
                  href="/dashboard/create"
                  className="mt-4 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Create your first ad
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

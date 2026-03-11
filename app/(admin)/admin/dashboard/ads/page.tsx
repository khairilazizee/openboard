import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { ensureUserFromClerkId } from "../../../../lib/user";
import { DeleteAdForm } from "./edit/[id]/DeleteAdForm";

const ITEMS_PER_PAGE = 30;

export default async function AdminAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
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

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [totalAds, ads] = await Promise.all([
    prisma.ads.count(),
    prisma.ads.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(totalAds / ITEMS_PER_PAGE);

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Ads Management
            </h1>
            <Link
              href="/admin/dashboard"
              className="rounded border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-[#1a1a1a]"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="rounded-lg border border-solid border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-black/[.08] text-left dark:border-white/[.145]">
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Title
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Category
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Owner
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Created
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr
                      key={ad.id}
                      className="border-b border-black/[.08] align-top dark:border-white/[.145]"
                    >
                      <td className="px-3 py-3">
                        <p className="max-w-[200px] truncate text-sm font-medium text-black dark:text-zinc-50">
                          {ad.title}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          {ad.category}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="max-w-[180px] truncate text-sm text-zinc-600 dark:text-zinc-300">
                          {ad.user.email}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                            ad.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ad.status === "INACTIVE"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right flex flex-row gap-2 justify-end">
                        <Link
                          href={`/admin/dashboard/ads/edit/${ad.id}`}
                          className="inline-block rounded bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
                        >
                          Edit
                        </Link>
                        <div>
                          <DeleteAdForm adId={ad.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/admin/dashboard/ads?page=${currentPage - 1}`}
                    className="rounded border border-black/[.08] px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-[#1a1a1a]"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/admin/dashboard/ads?page=${currentPage + 1}`}
                    className="rounded border border-black/[.08] px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-[#1a1a1a]"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

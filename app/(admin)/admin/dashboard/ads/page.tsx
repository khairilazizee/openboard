import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { ensureUserFromClerkId } from "../../../../lib/user";
import { updateAdAdminSettings } from "../../../../lib/actions";

function toDateTimeLocalValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default async function AdminAdsPage() {
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

  const ads = await prisma.ads.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
              Ads Schedule & Ranking
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-black/[.08] text-left dark:border-white/[.145]">
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Title
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Owner
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Hotness (0-100)
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Priority (0-3)
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Start Date
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      End Date
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
                        <p className="max-w-[220px] truncate text-sm font-medium text-black dark:text-zinc-50">
                          {ad.title}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="max-w-[180px] truncate text-sm text-zinc-600 dark:text-zinc-300">
                          {ad.user.email}
                        </p>
                      </td>
                      <td className="px-3 py-3" colSpan={6}>
                        <form
                          action={updateAdAdminSettings.bind(null, ad.id)}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-[150px_120px_120px_220px_220px_1fr]"
                        >
                          <select
                            name="status"
                            defaultValue={ad.status}
                            className="rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="DELETED">DELETED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                          <input
                            name="hotness"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={ad.hotness}
                            className="rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                          />
                          <input
                            name="priority"
                            type="number"
                            min={0}
                            max={3}
                            defaultValue={ad.priority}
                            className="rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                          />
                          <input
                            name="startDate"
                            type="datetime-local"
                            defaultValue={toDateTimeLocalValue(ad.startDate)}
                            className="rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                          />
                          <input
                            name="endDate"
                            type="datetime-local"
                            defaultValue={toDateTimeLocalValue(ad.endDate)}
                            className="rounded border border-solid border-black/[.08] bg-white px-3 py-2 text-sm text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
